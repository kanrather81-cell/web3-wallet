// DApp Storage Service using localStorage
export interface StoredDApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  category: string;
  chains: string[];
  timestamp: number;
}

const FAVORITES_KEY = 'dapp_favorites';
const RECENT_KEY = 'dapp_recent';
const MAX_RECENT = 20;

export class DAppStorage {
  // Favorites
  static getFavorites(): StoredDApp[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  static addFavorite(dapp: Omit<StoredDApp, 'timestamp'>): void {
    try {
      const favorites = this.getFavorites();
      const exists = favorites.some((fav) => fav.id === dapp.id);
      
      if (!exists) {
        const newFavorite: StoredDApp = {
          ...dapp,
          timestamp: Date.now(),
        };
        favorites.unshift(newFavorite);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  static removeFavorite(dappId: string): void {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter((fav) => fav.id !== dappId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  static isFavorite(dappId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((fav) => fav.id === dappId);
  }

  // Recent
  static getRecent(): StoredDApp[] {
    try {
      const data = localStorage.getItem(RECENT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recent:', error);
      return [];
    }
  }

  static addRecent(dapp: Omit<StoredDApp, 'timestamp'>): void {
    try {
      let recent = this.getRecent();
      
      // Remove if already exists
      recent = recent.filter((item) => item.id !== dapp.id);
      
      // Add to beginning
      const newRecent: StoredDApp = {
        ...dapp,
        timestamp: Date.now(),
      };
      recent.unshift(newRecent);
      
      // Keep only MAX_RECENT items
      if (recent.length > MAX_RECENT) {
        recent = recent.slice(0, MAX_RECENT);
      }
      
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Error adding recent:', error);
    }
  }

  static clearRecent(): void {
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch (error) {
      console.error('Error clearing recent:', error);
    }
  }
}
