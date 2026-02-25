interface ChainIconProps {
  chainId: number;
  size?: number;
}

export function ChainIcon({ chainId, size = 32 }: ChainIconProps) {
  const icons: Record<number, string> = {
    1: '⟠', // Ethereum
    137: '⬡', // Polygon
    10: '🔴', // Optimism
    42161: '🔵', // Arbitrum
    8453: '🔷', // Base
  };

  const colors: Record<number, string> = {
    1: 'bg-blue-500',
    137: 'bg-purple-500',
    10: 'bg-red-500',
    42161: 'bg-blue-600',
    8453: 'bg-blue-400',
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
