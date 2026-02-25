import { useEffect, useState } from 'react';
import {
  getBitcoinBalance,
  getBitcoinBalanceFromBlockstream,
  isValidBitcoinAddress,
} from '../chains/bitcoin';

interface UseBitcoinBalanceProps {
  address?: string | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
  useFallback?: boolean; // 是否使用备选API
}

interface UseBitcoinBalanceReturn {
  balance: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBitcoinBalance({
  address,
  autoRefresh = true,
  refreshInterval = 60000, // 默认60秒
  useFallback = false,
}: UseBitcoinBalanceProps): UseBitcoinBalanceReturn {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address || !isValidBitcoinAddress(address)) {
      setBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let bal: number;
      if (useFallback) {
        // 使用备选API（Blockstream）
        bal = await getBitcoinBalanceFromBlockstream(address);
      } else {
        // 使用主API
        bal = await getBitcoinBalance(address);
      }
      setBalance(bal);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取比特币余额失败';
      setError(errorMessage);
      console.error('获取Bitcoin余额失败:', err);

      // 如果主API失败且允许使用备选，尝试备选API
      if (!useFallback) {
        try {
          console.log('尝试使用备选API获取余额...');
          const fallbackBal = await getBitcoinBalanceFromBlockstream(address);
          setBalance(fallbackBal);
          setError(null); // 清除错误
        } catch (fallbackErr) {
          console.error('备选API也失败:', fallbackErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, useFallback]); // 地址或API类型变化时重新获取

  useEffect(() => {
    if (!autoRefresh || !address) return;

    const intervalId = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(intervalId);
  }, [address, autoRefresh, refreshInterval]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}

// 批量获取多个地址余额的Hook（可选）
export function useBitcoinBalances(addresses: (string | null)[]) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validAddresses = addresses.filter(
      (addr): addr is string => addr !== null && isValidBitcoinAddress(addr)
    );

    if (validAddresses.length === 0) {
      setBalances({});
      return;
    }

    const fetchAllBalances = async () => {
      setIsLoading(true);
      const newBalances: Record<string, number> = {};

      await Promise.all(
        validAddresses.map(async (addr) => {
          try {
            const bal = await getBitcoinBalance(addr);
            newBalances[addr] = bal;
          } catch (error) {
            console.error(`获取地址 ${addr} 余额失败:`, error);
            newBalances[addr] = 0;
          }
        })
      );

      setBalances(newBalances);
      setIsLoading(false);
    };

    fetchAllBalances();
  }, [addresses.join(',')]); // 地址列表变化时重新获取

  return { balances, isLoading };
}
