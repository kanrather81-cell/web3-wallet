import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getSolanaBalance } from '../chains/solana';

export function useSolanaBalance() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(0);
      return;
    }

    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const bal = await getSolanaBalance(publicKey.toBase58());
        setBalance(bal);
      } catch (error) {
        console.error('获取Solana余额失败:', error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // 每30秒刷新一次余额
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey]);

  return {
    balance,
    isLoading,
    connected,
    address: publicKey?.toBase58(),
  };
}
