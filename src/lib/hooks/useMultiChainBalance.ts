import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
import { supportedChains, chainConfig } from '../chains/config';
import { formatUnits } from 'viem';
import { useState, useEffect } from 'react';
import { getSolanaBalance } from '../chains/solana';
import { getBitcoinBalance } from '../chains/bitcoin';
import { getTronBalance } from '../chains/tron';

export interface ChainBalance {
  chainId: number | string;
  chainName: string;
  symbol: string;
  balance: string;
  formattedBalance: string;
  isLoading: boolean;
  error: Error | null;
}

export interface MultiChainBalanceResult {
  balances: ChainBalance[];
  totalBalanceInETH: string;
  isLoading: boolean;
  hasError: boolean;
}

export function useMultiChainBalance(): MultiChainBalanceResult {
  const { address } = useAccount();
  
  // State for non-EVM chains
  const [solanaBalance, setSolanaBalance] = useState<string>('0');
  const [bitcoinBalance, setBitcoinBalance] = useState<string>('0');
  const [tronBalance, setTronBalance] = useState<string>('0');
  const [nonEvmLoading, setNonEvmLoading] = useState(false);

  // Fetch balance for each supported chain
  const balanceQueries = supportedChains.map((chain) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBalance({
      address,
      chainId: chain.id,
    });
  });

  // Fetch non-EVM chain balances
  useEffect(() => {
    const fetchNonEvmBalances = async () => {
      if (!address) return;
      
      setNonEvmLoading(true);
      try {
        // Note: These addresses would need to be provided separately
        // For now, we'll use placeholder logic
        const solAddress = localStorage.getItem('solana_address');
        const btcAddress = localStorage.getItem('bitcoin_address');
        const tronAddress = localStorage.getItem('tron_address');

        if (solAddress) {
          const solBal = await getSolanaBalance(solAddress);
          setSolanaBalance(solBal.toFixed(6));
        }

        if (btcAddress) {
          const btcBal = await getBitcoinBalance(btcAddress);
          setBitcoinBalance(btcBal.toFixed(8));
        }

        if (tronAddress) {
          const trxBal = await getTronBalance(tronAddress);
          setTronBalance(trxBal.toFixed(6));
        }
      } catch (error) {
        console.error('Error fetching non-EVM balances:', error);
      } finally {
        setNonEvmLoading(false);
      }
    };

    fetchNonEvmBalances();
  }, [address]);

  // Process EVM balances
  const evmBalances: ChainBalance[] = supportedChains.map((chain, index) => {
    const query = balanceQueries[index];
    const config = chainConfig[chain.id];

    return {
      chainId: chain.id,
      chainName: config.name,
      symbol: config.symbol,
      balance: query.data?.value.toString() || '0',
      formattedBalance: query.data
        ? formatUnits(query.data.value, query.data.decimals)
        : '0',
      isLoading: query.isLoading,
      error: query.error,
    };
  });

  // Add non-EVM balances
  const nonEvmBalances: ChainBalance[] = [
    {
      chainId: 'solana',
      chainName: 'Solana',
      symbol: 'SOL',
      balance: solanaBalance,
      formattedBalance: solanaBalance,
      isLoading: nonEvmLoading,
      error: null,
    },
    {
      chainId: 'bitcoin',
      chainName: 'Bitcoin',
      symbol: 'BTC',
      balance: bitcoinBalance,
      formattedBalance: bitcoinBalance,
      isLoading: nonEvmLoading,
      error: null,
    },
    {
      chainId: 'tron',
      chainName: 'Tron',
      symbol: 'TRX',
      balance: tronBalance,
      formattedBalance: tronBalance,
      isLoading: nonEvmLoading,
      error: null,
    },
  ];

  const balances = [...evmBalances, ...nonEvmBalances];

  // Calculate total balance in ETH (simplified - treating all ETH-based chains equally)
  const totalBalanceInETH = evmBalances
    .reduce((total, balance) => {
      // Only sum ETH-based chains (Ethereum, Optimism, Arbitrum, Base)
      if (
        balance.symbol === 'ETH' &&
        !balance.isLoading &&
        !balance.error
      ) {
        return total + parseFloat(balance.formattedBalance);
      }
      return total;
    }, 0)
    .toFixed(6);

  const isLoading = balances.some((b) => b.isLoading);
  const hasError = balances.some((b) => b.error !== null);

  return {
    balances,
    totalBalanceInETH,
    isLoading,
    hasError,
  };
}
