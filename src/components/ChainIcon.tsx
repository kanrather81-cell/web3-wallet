interface ChainIconProps {
  chainId: number | string;
  size?: number;
}

export function ChainIcon({ chainId, size = 32 }: ChainIconProps) {
  const icons: Record<number | string, string> = {
    1: '⟠', // Ethereum
    137: '⬡', // Polygon
    10: '🔴', // Optimism
    42161: '🔵', // Arbitrum
    8453: '🔷', // Base
    'solana': '◎', // Solana
    'bitcoin': '₿', // Bitcoin
    'tron': '🔺', // Tron
  };

  const colors: Record<number | string, string> = {
    1: 'bg-blue-500',
    137: 'bg-purple-500',
    10: 'bg-red-500',
    42161: 'bg-blue-600',
    8453: 'bg-blue-400',
    'solana': 'bg-gradient-to-r from-purple-500 to-blue-500',
    'bitcoin': 'bg-orange-500',
    'tron': 'bg-red-600',
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full ${colors[chainId] || 'bg-gray-500'}`}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.6 }}>{icons[chainId] || '?'}</span>
    </div>
  );
}
