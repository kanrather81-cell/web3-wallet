export type DAppCategory = 'DeFi' | 'NFT' | 'Game' | 'Social';

export interface DApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  category: DAppCategory;
  chains: string[];
  featured?: boolean;
}

export const dapps: DApp[] = [
  // DeFi
  {
    id: 'uniswap',
    name: 'Uniswap',
    description: 'Leading decentralized exchange for swapping tokens',
    icon: '🦄',
    url: 'https://app.uniswap.org/',
    category: 'DeFi',
    chains: ['Ethereum', 'Polygon', 'Optimism', 'Arbitrum', 'Base'],
    featured: true,
  },
  {
    id: 'aave',
    name: 'Aave',
    description: 'Decentralized lending and borrowing protocol',
    icon: '👻',
    url: 'https://app.aave.com/',
    category: 'DeFi',
    chains: ['Ethereum', 'Polygon', 'Optimism', 'Arbitrum'],
    featured: true,
  },
  {
    id: 'curve',
    name: 'Curve Finance',
    description: 'Stablecoin exchange with low slippage',
    icon: '🌊',
    url: 'https://curve.fi/',
    category: 'DeFi',
    chains: ['Ethereum', 'Polygon', 'Optimism', 'Arbitrum'],
  },
  {
    id: 'compound',
    name: 'Compound',
    description: 'Algorithmic money market protocol',
    icon: '🏦',
    url: 'https://app.compound.finance/',
    category: 'DeFi',
    chains: ['Ethereum', 'Polygon', 'Base'],
  },
  {
    id: 'lido',
    name: 'Lido',
    description: 'Liquid staking solution for Ethereum',
    icon: '🌊',
    url: 'https://lido.fi/',
    category: 'DeFi',
    chains: ['Ethereum'],
  },
  {
    id: 'pancakeswap',
    name: 'PancakeSwap',
    description: 'Popular DEX with yield farming',
    icon: '🥞',
    url: 'https://pancakeswap.finance/',
    category: 'DeFi',
    chains: ['BSC', 'Ethereum'],
  },

  // NFT
  {
    id: 'opensea',
    name: 'OpenSea',
    description: 'Largest NFT marketplace for buying and selling',
    icon: '🌊',
    url: 'https://opensea.io/',
    category: 'NFT',
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Base'],
    featured: true,
  },
  {
    id: 'blur',
    name: 'Blur',
    description: 'NFT marketplace for pro traders',
    icon: '💨',
    url: 'https://blur.io/',
    category: 'NFT',
    chains: ['Ethereum'],
    featured: true,
  },
  {
    id: 'rarible',
    name: 'Rarible',
    description: 'Community-owned NFT marketplace',
    icon: '🎨',
    url: 'https://rarible.com/',
    category: 'NFT',
    chains: ['Ethereum', 'Polygon'],
  },
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Platform for digital art and NFTs',
    icon: '🖼️',
    url: 'https://foundation.app/',
    category: 'NFT',
    chains: ['Ethereum'],
  },
  {
    id: 'superrare',
    name: 'SuperRare',
    description: 'Curated digital art marketplace',
    icon: '💎',
    url: 'https://superrare.com/',
    category: 'NFT',
    chains: ['Ethereum'],
  },

  // Games
  {
    id: 'axie',
    name: 'Axie Infinity',
    description: 'Play-to-earn game with NFT creatures',
    icon: '🎮',
    url: 'https://axieinfinity.com/',
    category: 'Game',
    chains: ['Ethereum', 'Ronin'],
    featured: true,
  },
  {
    id: 'decentraland',
    name: 'Decentraland',
    description: 'Virtual world powered by Ethereum',
    icon: '🌍',
    url: 'https://decentraland.org/',
    category: 'Game',
    chains: ['Ethereum', 'Polygon'],
  },
  {
    id: 'sandbox',
    name: 'The Sandbox',
    description: 'Create, own, and monetize gaming experiences',
    icon: '🏖️',
    url: 'https://www.sandbox.game/',
    category: 'Game',
    chains: ['Ethereum', 'Polygon'],
    featured: true,
  },
  {
    id: 'gods-unchained',
    name: 'Gods Unchained',
    description: 'Tactical trading card game',
    icon: '🃏',
    url: 'https://godsunchained.com/',
    category: 'Game',
    chains: ['Ethereum'],
  },
  {
    id: 'illuvium',
    name: 'Illuvium',
    description: 'Open-world RPG adventure game',
    icon: '⚔️',
    url: 'https://illuvium.io/',
    category: 'Game',
    chains: ['Ethereum'],
  },

  // Social
  {
    id: 'lens',
    name: 'Lens Protocol',
    description: 'Decentralized social graph protocol',
    icon: '🌿',
    url: 'https://www.lens.xyz/',
    category: 'Social',
    chains: ['Polygon'],
    featured: true,
  },
  {
    id: 'farcaster',
    name: 'Farcaster',
    description: 'Decentralized social network',
    icon: '🎭',
    url: 'https://www.farcaster.xyz/',
    category: 'Social',
    chains: ['Optimism'],
    featured: true,
  },
  {
    id: 'mirror',
    name: 'Mirror',
    description: 'Decentralized publishing platform',
    icon: '✍️',
    url: 'https://mirror.xyz/',
    category: 'Social',
    chains: ['Ethereum', 'Optimism'],
  },
  {
    id: 'cyberconnect',
    name: 'CyberConnect',
    description: 'Web3 social network protocol',
    icon: '🔗',
    url: 'https://cyberconnect.me/',
    category: 'Social',
    chains: ['Ethereum', 'Polygon', 'BSC'],
  },
  {
    id: 'friend-tech',
    name: 'Friend.tech',
    description: 'Social trading platform',
    icon: '👥',
    url: 'https://www.friend.tech/',
    category: 'Social',
    chains: ['Base'],
  },
];

export const categories: { name: DAppCategory; icon: string; description: string }[] = [
  {
    name: 'DeFi',
    icon: '💰',
    description: 'Decentralized Finance',
  },
  {
    name: 'NFT',
    icon: '🖼️',
    description: 'Non-Fungible Tokens',
  },
  {
    name: 'Game',
    icon: '🎮',
    description: 'Blockchain Games',
  },
  {
    name: 'Social',
    icon: '👥',
    description: 'Social Networks',
  },
];
