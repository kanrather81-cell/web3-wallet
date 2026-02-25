import { useTron, useTronLinkInstalled } from '../../lib/hooks/useTron';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface TronConnectButtonProps {
  onConnected?: (address: string) => void;
  className?: string;
}

export function TronConnectButton({ onConnected, className }: TronConnectButtonProps) {
  const { address, connected, balance, isLoading, error, connect, disconnect } = useTron();
  const isInstalled = useTronLinkInstalled();

  // 处理连接点击
  const handleConnect = async () => {
    await connect();
    if (address && onConnected) {
      onConnected(address);
    }
  };

  // 如果已连接，显示钱包信息
  if (connected && address) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Tron 已连接</p>
              <p className="text-xs text-muted-foreground">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              {isLoading ? (
                <Skeleton className="h-4 w-20 mt-1" />
              ) : (
                <p className="text-sm font-mono mt-1">{balance.toFixed(2)} TRX</p>
              )}
            </div>
            <button
              onClick={disconnect}
              className="px-3 py-1 text-sm border rounded hover:bg-accent"
            >
              断开
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 未连接时显示连接按钮
  return (
    <div className={className}>
      {!isInstalled ? (
        <div className="space-y-2">
          <button
            onClick={() => window.open('https://www.tronlink.org/', '_blank')}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            安装 TronLink 钱包
          </button>
          <p className="text-xs text-muted-foreground text-center">
            需要安装 TronLink 浏览器插件
          </p>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? '连接中...' : '连接 Tron 钱包'}
        </button>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
