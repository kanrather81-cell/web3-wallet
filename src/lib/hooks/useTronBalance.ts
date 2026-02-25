import { useEffect, useState } from 'react';
import { getTronBalance, getTrc20Balance, isValidTronAddress } from '../chains/tron';

interface UseTronBalanceProps {
  address?: string | null;
  autoRefresh?: boolean;
  refreshInterval?: number;
  trc20Contracts?: string[]; // TRC20合约地址列表
}

interface Trc20Balance {
  contractAddress: string;
  balance: number;
  symbol?: string;
  decimals?: number;
}

interface UseTronBalanceReturn {
  trxBalance: number;
  trc20Balances: Trc20Balance[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  refetchTrc20: (contractAddress?: string) => Promise<void>;
}

export function useTronBalance({
  address,
  autoRefresh = true,
  refreshInterval = 30000, // 默认30秒
  trc20Contracts = []
}: UseTronBalanceProps): UseTronBalanceReturn {
  const [trxBalance, setTrxBalance] = useState<number>(0);
  const [trc20Balances, setTrc20Balances] = useState<Trc20Balance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 获取TRX余额
  const fetchTrxBalance = async () => {
    if (!address || !isValidTronAddress(address)) {
      setTrxBalance(0);
      return;
    }

    try {
      const bal = await getTronBalance(address);
      setTrxBalance(bal);
    } catch (err) {
      console.error('获取TRX余额失败:', err);
      throw err;
    }
  };

  // 获取TRC20代币余额
  const fetchTrc20Balances = async () => {
    if (!address || !isValidTronAddress(address) || trc20Contracts.length === 0) {
      setTrc20Balances([]);
      return;
    }

    const balances: Trc20Balance[] = [];
    for (const contract of trc20Contracts) {
      try {
        const bal = await getTrc20Balance(address, contract);
        balances.push({
          contractAddress: contract,
          balance: bal,
          // 这里可以添加代币符号和小数位数的映射
          symbol: getTrc20Symbol(contract),
          decimals: 6 // USDT等通常6位小数
        });
      } catch (err) {
        console.error(`获取TRC20合约 ${contract} 余额失败:`, err);
      }
    }

    setTrc20Balances(balances);
  };

  // 获取所有余额
  const fetchAllBalances = async () => {
    if (!address || !isValidTronAddress(address)) {
      setTrxBalance(0);
      setTrc20Balances([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await fetchTrxBalance();
      await fetchTrc20Balances();
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取余额失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 单独刷新TRC20余额
  const refetchTrc20 = async (contractAddress?: string) => {
    if (!address) return;

    if (contractAddress) {
      try {
        const bal = await getTrc20Balance(address, contractAddress);
        setTrc20Balances(prev => 
          prev.map(item => 
            item.contractAddress === contractAddress 
              ? { ...item, balance: bal }
              : item
          )
        );
      } catch (err) {
        console.error(`刷新TRC20合约 ${contractAddress} 余额失败:`, err);
      }
    } else {
      await fetchTrc20Balances();
    }
  };

  // 地址或合约列表变化时重新获取
  useEffect(() => {
    fetchAllBalances();
  }, [address, trc20Contracts.join(',')]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !address) return;

    const intervalId = setInterval(fetchAllBalances, refreshInterval);
    return () => clearInterval(intervalId);
  }, [address, autoRefresh, refreshInterval]);

  return {
    trxBalance,
    trc20Balances,
    isLoading,
    error,
    refetch: fetchAllBalances,
    refetchTrc20
  };
}

// 获取TRC20代币符号的辅助函数
function getTrc20Symbol(contractAddress: string): string {
  const symbolMap: Record<string, string> = {
    'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t': 'USDT',
    'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT': 'USDC',
    'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf': 'WTRX',
  };

  return symbolMap[contractAddress] || 'Unknown';
}
