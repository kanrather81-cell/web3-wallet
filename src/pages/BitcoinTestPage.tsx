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
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">Bitcoin 链测试</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* 连接组件 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Bitcoin 钱包连接
          </h2>
          <BitcoinConnectButton />
        </div>

        {/* 余额显示 */}
        {connected && address && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              钱包信息
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">地址</p>
                <p className="font-mono text-sm break-all text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                  {address}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">余额</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32 mt-2" />
                ) : error ? (
                  <div className="mt-2">
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                      onClick={refetch}
                      className="text-sm text-primary-600 hover:underline mt-1"
                    >
                      重试
                    </button>
                  </div>
                ) : (
                  <p className="text-2xl font-mono text-gray-900 mt-2">
                    {balance.toFixed(8)} BTC
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={disconnect}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  断开连接
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">使用说明</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
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
  );
}
