// Price Alert Service
import { coingeckoService } from './coingecko';

export interface PriceAlert {
  id: string;
  coinId: string;
  coinName: string;
  coinSymbol: string;
  type: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  enabled: boolean;
  createdAt: number;
  triggeredAt?: number;
}

const STORAGE_KEY = 'price_alerts';
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
let checkIntervalId: number | null = null;

export class PriceAlertService {
  /**
   * Get all price alerts
   */
  static getAlerts(): PriceAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading price alerts:', error);
      return [];
    }
  }

  /**
   * Get alerts for a specific coin
   */
  static getAlertsByCoin(coinId: string): PriceAlert[] {
    const alerts = this.getAlerts();
    return alerts.filter((alert) => alert.coinId === coinId);
  }

  /**
   * Add a new price alert
   */
  static addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): PriceAlert {
    try {
      const alerts = this.getAlerts();
      
      const newAlert: PriceAlert = {
        ...alert,
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
      };

      alerts.push(newAlert);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));

      // Start monitoring if not already running
      this.startMonitoring();

      return newAlert;
    } catch (error) {
      console.error('Error adding price alert:', error);
      throw error;
    }
  }

  /**
   * Update an existing alert
   */
  static updateAlert(id: string, updates: Partial<Omit<PriceAlert, 'id' | 'createdAt'>>): void {
    try {
      const alerts = this.getAlerts();
      const index = alerts.findIndex((alert) => alert.id === id);

      if (index === -1) {
        throw new Error('Alert not found');
      }

      alerts[index] = {
        ...alerts[index],
        ...updates,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error updating price alert:', error);
      throw error;
    }
  }

  /**
   * Delete an alert
   */
  static deleteAlert(id: string): void {
    try {
      const alerts = this.getAlerts();
      const filtered = alerts.filter((alert) => alert.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      // Stop monitoring if no alerts left
      if (filtered.length === 0) {
        this.stopMonitoring();
      }
    } catch (error) {
      console.error('Error deleting price alert:', error);
      throw error;
    }
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show notification
   */
  static showNotification(alert: PriceAlert, currentPrice: number): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const title = `${alert.coinName} 价格提醒`;
    const body = `${alert.coinSymbol.toUpperCase()} 当前价格 $${currentPrice.toFixed(2)} ${
      alert.type === 'above' ? '高于' : '低于'
    } 目标价格 $${alert.targetPrice.toFixed(2)}`;

    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      tag: alert.id,
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  /**
   * Check if alert should be triggered
   */
  static shouldTrigger(alert: PriceAlert, currentPrice: number): boolean {
    if (!alert.enabled) return false;

    if (alert.type === 'above') {
      return currentPrice >= alert.targetPrice;
    } else {
      return currentPrice <= alert.targetPrice;
    }
  }

  /**
   * Check all alerts
   */
  static async checkAlerts(): Promise<void> {
    const alerts = this.getAlerts().filter((alert) => alert.enabled);

    if (alerts.length === 0) {
      return;
    }

    // Group alerts by coin to minimize API calls
    const coinIds = [...new Set(alerts.map((alert) => alert.coinId))];

    try {
      // Fetch current prices for all coins
      const prices = await Promise.all(
        coinIds.map(async (coinId) => {
          try {
            const data = await coingeckoService.getCoinDetail(coinId);
            return {
              coinId,
              price: data.market_data.current_price.usd,
            };
          } catch (error) {
            console.error(`Error fetching price for ${coinId}:`, error);
            return null;
          }
        })
      );

      const priceMap = new Map(
        prices.filter((p) => p !== null).map((p) => [p!.coinId, p!.price])
      );

      // Check each alert
      const updatedAlerts = alerts.map((alert) => {
        const currentPrice = priceMap.get(alert.coinId);

        if (currentPrice === undefined) {
          return alert;
        }

        // Update current price
        alert.currentPrice = currentPrice;

        // Check if should trigger
        if (this.shouldTrigger(alert, currentPrice)) {
          // Show notification
          this.showNotification(alert, currentPrice);

          // Mark as triggered and disable
          alert.triggeredAt = Date.now();
          alert.enabled = false;

          console.log(`Alert triggered for ${alert.coinName}: $${currentPrice}`);
        }

        return alert;
      });

      // Save updated alerts
      const allAlerts = this.getAlerts();
      updatedAlerts.forEach((updatedAlert) => {
        const index = allAlerts.findIndex((a) => a.id === updatedAlert.id);
        if (index !== -1) {
          allAlerts[index] = updatedAlert;
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allAlerts));
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  /**
   * Start monitoring prices
   */
  static startMonitoring(): void {
    if (checkIntervalId !== null) {
      return; // Already monitoring
    }

    console.log('Starting price alert monitoring...');

    // Check immediately
    this.checkAlerts();

    // Then check every interval
    checkIntervalId = window.setInterval(() => {
      this.checkAlerts();
    }, CHECK_INTERVAL);
  }

  /**
   * Stop monitoring prices
   */
  static stopMonitoring(): void {
    if (checkIntervalId !== null) {
      console.log('Stopping price alert monitoring...');
      window.clearInterval(checkIntervalId);
      checkIntervalId = null;
    }
  }

  /**
   * Initialize monitoring on app start
   */
  static initialize(): void {
    const alerts = this.getAlerts();
    const hasEnabledAlerts = alerts.some((alert) => alert.enabled);

    if (hasEnabledAlerts) {
      this.startMonitoring();
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  PriceAlertService.initialize();
}
