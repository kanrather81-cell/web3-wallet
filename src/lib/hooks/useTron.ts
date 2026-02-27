import { useEffect, useState } from 'react';
import { getTronBalance, isValidTronAddress } from '../chains/tron';

// Tron钱包接口定义
export interface TronWalletState {
  address: string | null;
  connected: boolean;
  balance: number;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Tron钱包连接Hook
export function useTron(): TronWalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 检查TronLink是否安装
  const isTronLinkInstalled = (): boolean => {
    return !!window.tronLink && !!window.tronWeb;
  };

  // 从localStorage恢复之前的连接状态
  useEffect(() => {
    const savedAddress = localStorage.getItem('tron_address');
    if (savedAddress && isValidTronAddress(savedAddress)) {
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
        const bal = await getTronBalance(address);
        setBalance(bal);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取余额失败');
        console.error('获取Tron余额失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // 每60秒刷新一次余额（减少API调用频率）
    const interval = setInterval(fetchBalance, 60000);
    return () => clearInterval(interval);
  }, [address]);

  // 连接Tron钱包
  const connect = async () => {
    setError(null);

    if (!isTronLinkInstalled()) {
      setError('请先安装TronLink钱包插件');
      window.open('https://www.tronlink.org/', '_blank');
      return;
    }

    try {
      setIsLoading(true);

      // 请求连接TronLink
      if (window.tronLink && window.tronLink.request) {
        await window.tronLink.request({ method: 'tron_requestAccounts' });

        // 获取地址
        if (window.tronWeb && window.tronWeb.defaultAddress) {
          const addr = window.tronWeb.defaultAddress.base58;
          if (addr && isValidTronAddress(addr)) {
            setAddress(addr);
            localStorage.setItem('tron_address', addr);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
      console.error('连接Tron钱包失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 断开连接
  const disconnect = () => {
    setAddress(null);
    setBalance(0);
    localStorage.removeItem('tron_address');
  };

  // 监听账户变化
  useEffect(() => {
    if (!window.tronLink) return;

    const handleAccountsChanged = (accounts: any) => {
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        if (addr && isValidTronAddress(addr)) {
          setAddress(addr);
          localStorage.setItem('tron_address', addr);
        }
      } else {
        setAddress(null);
        localStorage.removeItem('tron_address');
      }
    };

    // 添加事件监听（TronLink可能不支持标准事件，这里做兼容）
    if (window.tronLink && window.tronLink.on) {
      window.tronLink.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.tronLink && window.tronLink.removeListener) {
        window.tronLink.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

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

// 检查TronLink是否安装的Hook
export function useTronLinkInstalled() {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const check = () => {
      setInstalled(!!window.tronLink && !!window.tronWeb);
    };

    check();

    // 监听tronLink注入事件
    window.addEventListener('tronLink#initialized', check);

    return () => {
      window.removeEventListener('tronLink#initialized', check);
    };
  }, []);

  return installed;
}
