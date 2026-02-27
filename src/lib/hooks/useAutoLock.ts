import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiWalletManager } from '../wallet/multiWalletManager';
import { toast } from 'sonner';

interface AutoLockOptions {
  timeout?: number; // in milliseconds
  enabled?: boolean;
  onLock?: () => void;
}

const DEFAULT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'auto_lock_settings';

export function useAutoLock(options: AutoLockOptions = {}) {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number | null>(null);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  }, []);

  const settings = loadSettings();
  const timeout = options.timeout || settings.timeout || DEFAULT_TIMEOUT;
  const enabled = options.enabled !== undefined ? options.enabled : settings.enabled !== false;

  const lockWallet = useCallback(() => {
    console.log('[AutoLock] Locking wallet due to inactivity');
    
    // Lock the wallet
    MultiWalletManager.lockWallet();
    
    // Clear session storage
    sessionStorage.removeItem('wallet_unlocked');
    sessionStorage.removeItem('unlock_timestamp');
    
    // Show notification
    toast.info('钱包已自动锁定', {
      description: '由于长时间未活动，钱包已被锁定以保护您的资产',
    });
    
    // Call custom onLock callback
    options.onLock?.();
    
    // Navigate to unlock page
    navigate('/unlock-wallet');
  }, [navigate, options]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= timeout) {
        lockWallet();
      }
    }, timeout);
  }, [enabled, timeout, lockWallet]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    if (!enabled) {
      console.log('[AutoLock] Auto-lock is disabled');
      return;
    }

    console.log(`[AutoLock] Enabled with timeout: ${timeout}ms (${timeout / 1000 / 60} minutes)`);

    // Activity events to monitor
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize last activity timestamp and start the timer
    lastActivityRef.current = Date.now();
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, timeout, handleActivity, resetTimer]);

  // Check if wallet is still unlocked on mount
  useEffect(() => {
    const unlockTimestamp = sessionStorage.getItem('unlock_timestamp');
    if (unlockTimestamp) {
      const elapsed = Date.now() - parseInt(unlockTimestamp, 10);
      if (elapsed > timeout) {
        console.log('[AutoLock] Session expired, locking wallet');
        lockWallet();
      }
    }
  }, [timeout, lockWallet]);

  return {
    resetTimer,
    lockWallet,
    enabled,
    timeout,
  };
}

// Settings management
export const AutoLockSettings = {
  get: () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { enabled: true, timeout: DEFAULT_TIMEOUT };
      }
    }
    return { enabled: true, timeout: DEFAULT_TIMEOUT };
  },

  set: (settings: { enabled?: boolean; timeout?: number }) => {
    const current = AutoLockSettings.get();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    return { enabled: true, timeout: DEFAULT_TIMEOUT };
  },
};
