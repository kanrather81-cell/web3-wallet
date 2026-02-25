import { useBalance } from 'wagmi';
import { useAccount } from 'wagmi';
import { supportedChains, chainConfig } from '../chains/config';
import { formatUnits } from 'viem';

export interface ChainBalance {
  chainId: number;
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

  // Fetch balance for each supported chain
  const balanceQueries = supportedChains.map((chain) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useBalance({
      address,
      chainId: chain.id,
    });
  });

  // Process balances
  const balances: ChainBalance[] = supportedChains.map((chain, index) => {
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

  // Calculate total balance in ETH (simplified - treating all ETH-based chains equally)
  const totalBalanceInETH = balances
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
