import { useEffect, useState } from 'react';
import { getBitcoinBalance, isValidBitcoinAddress } from '../chains/bitcoin';

// Bitcoin钱包接口定义
export interface BitcoinWalletState {
  address: string | null;
  connected: boolean;
  balance: number;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Bitcoin钱包连接Hook
export function useBitcoin(): BitcoinWalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 从localStorage恢复之前的连接状态
  useEffect(() => {
    const savedAddress = localStorage.getItem('bitcoin_address');
    if (savedAddress && isValidBitcoinAddress(savedAddress)) {
      setAddress(savedAddress);
    }
  }, []);

  // 当地址变化时获取余额
  useEffect(() => {
    if (!address) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const bal = await getBitcoinBalance(address);
        setBalance(bal);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取余额失败');
        console.error('获取Bitcoin余额失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // 每60秒刷新一次余额
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [address]);

  // 连接钱包
  const connect = async () => {
    setError(null);
    // 注意：实际连接需要通过 bitcoinsdk 或其他钱包连接方式
    // 这里提供一个简单的示例
    console.log('请使用钱包连接组件连接 Bitcoin 钱包');
  };

  // 断开连接
  const disconnect = () => {
    setAddress(null);
    setBalance(0);
    localStorage.removeItem('bitcoin_address');
  };

  return {
    address,
    connected: !!address,
    balance,
    isLoading,
    error,
    connect,
    disconnect,
  };
}

// 用于bitcoinsdk UI组件的辅助函数
export function handleBitcoinWalletConnected(address: string) {
  if (isValidBitcoinAddress(address)) {
    localStorage.setItem('bitcoin_address', address);
    // 触发自定义事件，让useBitcoin Hook可以监听
    window.dispatchEvent(
      new CustomEvent('bitcoin-wallet-connected', { detail: { address } })
    );
  }
}

// 监听钱包连接事件的Hook（与UI组件配合使用）
export function useBitcoinWalletListener(
  onConnected?: (address: string) => void
) {
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ address: string }>;
      const address = customEvent.detail.address;
      if (address && onConnected) {
        onConnected(address);
      }
    };

    window.addEventListener('bitcoin-wallet-connected', handler);
    return () => window.removeEventListener('bitcoin-wallet-connected', handler);
  }, [onConnected]);
}
