import { useSolana } from '../lib/hooks/useSolana';
import { useBitcoin } from '../lib/hooks/useBitcoin';
import { useTron } from '../lib/hooks/useTron';
import { Card, CardContent } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface ChainAssetCardProps {
  chainName: string;
  symbol: string;
  balance: number;
  address: string | null;
  isLoading: boolean;
  iconColor: string;
  chainId: string;
}

function ChainAssetCard({ chainName, symbol, balance, address, isLoading, iconColor, chainId }: ChainAssetCardProps) {
  const navigate = useNavigate();

  if (!address) {
    return null;
  }

  const handleClick = () => {
    navigate(`/token/${chainId}`);
  };

  return (
    <Card 
      className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">
                {symbol.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{chainName}</h3>
              <p className="text-sm text-gray-400 font-mono">
                {address.slice(0, 6)}...{address.slice(-6)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400">加载中...</span>
                </div>
              ) : (
                <>
                  <p className="text-2xl font-bold text-white">
                    {balance.toFixed(symbol === 'BTC' ? 8 : 6)}
                  </p>
                  <p className="text-sm text-gray-400">{symbol}</p>
                </>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChainAssets() {
  // Call hooks at the top level unconditionally (React requirement)
  const solana = useSolana();
  const bitcoin = useBitcoin();
  const tron = useTron();

  const hasAnyConnection = solana.isConnected || bitcoin.connected || tron.connected;

  if (!hasAnyConnection) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <span>非 EVM 链资产</span>
        <span className="text-sm text-gray-400 font-normal">
          ({[solana.isConnected, bitcoin.connected, tron.connected].filter(Boolean).length} 条链已连接)
        </span>
      </h2>

      {solana.isConnected && solana.address && (
        <ChainAssetCard
          chainName="Solana"
          symbol="SOL"
          balance={solana.balance || 0}
          address={solana.address}
          isLoading={solana.isLoading || false}
          iconColor="bg-purple-600"
          chainId="solana"
        />
      )}

      {bitcoin.connected && bitcoin.address && (
        <ChainAssetCard
          chainName="Bitcoin"
          symbol="BTC"
          balance={bitcoin.balance || 0}
          address={bitcoin.address}
          isLoading={bitcoin.isLoading || false}
          iconColor="bg-orange-500"
          chainId="bitcoin"
        />
      )}

      {tron.connected && tron.address && (
        <ChainAssetCard
          chainName="Tron"
          symbol="TRX"
          balance={tron.balance || 0}
          address={tron.address}
          isLoading={tron.isLoading || false}
          iconColor="bg-red-600"
          chainId="tron"
        />
      )}
    </div>
  );
}
