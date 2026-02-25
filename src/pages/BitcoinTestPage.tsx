import { BitcoinConnectButton } from '../components/bitcoin/BitcoinConnectButton';
import { useBitcoinBalance } from '../lib/hooks/useBitcoinBalance';
import { useBitcoin } from '../lib/hooks/useBitcoin';
import { Skeleton } from '../components/ui/skeleton';

export function BitcoinTestPage() {
  const { address, connected, disconnect } = useBitcoin();
  const { balance, isLoading, error, refetch } = useBitcoinBalance({
    address,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Bitcoin 链测试页面
        </h1>

        <div className="grid gap-6">
          {/* 连接组件 */}
          <div className="bg-gray-800/50 border-gray-700 p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Bitcoin 钱包连接
            </h2>
            <BitcoinConnectButton />
          </div>

          {/* 余额显示 */}
          {connected && address && (
            <div className="bg-gray-800/50 border-gray-700 p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-white">
                钱包信息
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">地址</p>
                  <p className="font-mono text-sm break-all text-white">
                    {address}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">余额</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32" />
                  ) : error ? (
                    <div>
                      <p className="text-red-400 text-sm">{error}</p>
                      <button
                        onClick={refetch}
                        className="text-sm text-blue-400 hover:underline mt-1"
                      >
                        重试
                      </button>
                    </div>
                  ) : (
                    <p className="text-2xl font-mono text-white">
                      {balance.toFixed(8)} BTC
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={disconnect}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  >
                    断开连接
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="bg-gray-800/50 border-gray-700 p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-white">使用说明</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
              <li>点击"Connect Wallet"按钮选择比特币钱包</li>
              <li>支持 Unisat、Xverse、Leather 等比特币钱包</li>
              <li>连接后自动显示地址和BTC余额</li>
              <li>余额每30秒自动刷新</li>
              <li>可以手动点击"重试"刷新余额</li>
              <li>
                测试提示：可通过 localStorage.setItem('bitcoin_address',
                'your_address') 设置地址
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
