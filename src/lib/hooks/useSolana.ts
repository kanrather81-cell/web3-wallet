import { useState, useEffect, useCallback } from 'react';
import { getSolanaBalance } from '../chains/solana';

interface UseSolanaReturn {
  address: string | null;
  balance: number;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

export function useSolana(): UseSolanaReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 连接 Solana 钱包
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 安全地检查 window 对象
      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }

      // 检查是否安装了 Phantom 钱包
      const { solana } = window as any;

      if (!solana?.isPhantom) {
        throw new Error('Please install Phantom wallet');
      }

      // 请求连接 - 添加 onlyIfTrusted: false 确保显示连接弹窗
      const response = await solana.connect({ onlyIfTrusted: false });
      
      if (!response?.publicKey) {
        throw new Error('Failed to get public key from wallet');
      }
      
      const publicKey = response.publicKey.toString();

      setAddress(publicKey);
      setIsConnected(true);

      // 获取余额
      try {
        const bal = await getSolanaBalance(publicKey);
        setBalance(bal);
      } catch (balErr) {
        console.error('Failed to fetch balance:', balErr);
        // 余额获取失败不影响连接状态
        setBalance(0);
      }
    } catch (err: any) {
      // 改进错误处理
      let errorMessage = 'Failed to connect Solana wallet';
      
      if (err.code === 4001) {
        errorMessage = '用户拒绝了连接请求';
      } else if (err.message?.includes('User rejected')) {
        errorMessage = '用户拒绝了连接请求';
      } else if (err.message?.includes('Unexpected')) {
        errorMessage = 'Phantom 钱包连接失败，请重试';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Solana connection error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 断开连接
  const disconnect = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      
      const { solana } = window as any;
      
      if (solana && typeof solana.disconnect === 'function') {
        solana.disconnect();
      }
    } catch (err) {
      console.error('Error disconnecting Solana wallet:', err);
    }

    setAddress(null);
    setBalance(0);
    setIsConnected(false);
    setError(null);
  }, []);

  // 刷新余额
  const refreshBalance = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const bal = await getSolanaBalance(address);
      setBalance(bal);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh balance');
      console.error('Balance refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  // 监听账户变化
  useEffect(() => {
    try {
      // 安全地访问 window.solana
      if (typeof window === 'undefined') return;
      
      const { solana } = window as any;

      if (!solana) return;

      // Phantom wallet event handlers
      const handleConnect = () => {
        console.log('Solana wallet connected');
      };

      const handleDisconnect = () => {
        setAddress(null);
        setBalance(0);
        setIsConnected(false);
        setError(null);
      };

      const handleAccountChanged = (publicKey: any) => {
        if (publicKey) {
          const newAddress = publicKey.toString();
          setAddress(newAddress);
          // Fetch balance for new address
          getSolanaBalance(newAddress).then(bal => setBalance(bal)).catch(console.error);
        } else {
          setAddress(null);
          setBalance(0);
          setIsConnected(false);
        }
      };

      // Check if wallet supports event listeners
      if (typeof solana.on === 'function') {
        // Use .on() method if available (newer Phantom versions)
        solana.on('connect', handleConnect);
        solana.on('disconnect', handleDisconnect);
        solana.on('accountChanged', handleAccountChanged);
      }

      // Check if already connected
      if (solana.isConnected && solana.publicKey) {
        const addr = solana.publicKey.toString();
        setAddress(addr);
        setIsConnected(true);
        getSolanaBalance(addr).then(bal => setBalance(bal)).catch(console.error);
      }

      return () => {
        // Remove event listeners
        if (solana && typeof solana.off === 'function') {
          try {
            solana.off('connect', handleConnect);
            solana.off('disconnect', handleDisconnect);
            solana.off('accountChanged', handleAccountChanged);
          } catch (err) {
            console.error('Error removing Solana event listeners:', err);
          }
        }
      };
    } catch (err) {
      console.error('Error in useSolana effect:', err);
      // 不设置错误状态，只是静默失败
    }
  }, []); // Empty dependency array - only run once on mount

  return {
    address,
    balance,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    refreshBalance,
  };
}
