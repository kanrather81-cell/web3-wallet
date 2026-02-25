import { mainnet, polygon, optimism, arbitrum, base } from 'viem/chains';

export const supportedChains = [mainnet, polygon, optimism, arbitrum, base] as const;

export const chainConfig = {
  [mainnet.id]: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    icon: '⟠',
  },
  [polygon.id]: {
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    icon: '⬡',
  },
  [optimism.id]: {
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    icon: '🔴',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    symbol: 'ETH',
    decimals: 18,
    icon: '🔵',
  },
  [base.id]: {
    name: 'Base',
    symbol: 'ETH',
    decimals: 18,
    icon: '🔷',
  },
} as const;
