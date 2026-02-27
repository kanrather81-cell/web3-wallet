import { useState } from 'react';
import { TronConnectButton } from '../components/tron/TronConnectButton';
import { useTron } from '../lib/hooks/useTron';
import { useTronBalance } from '../lib/hooks/useTronBalance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';

// 常用TRC20合约地址
const TRC20_CONTRACTS = [
  {
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    name: 'USDT',
    symbol: 'USDT'
  },
  {
    address: 'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT',
    name: 'USDC',
    symbol: 'USDC'
  }
];

export default function TronTestPage() {
  const { address, connected } = useTron();
  const [selectedContracts] = useState(TRC20_CONTRACTS.map(c => c.address));

  const { 
    trxBalance, 
    trc20Balances, 
    isLoading, 
    error, 
    refetch,
    refetchTrc20 
  } = useTronBalance({
    address,
    autoRefresh: true,
    refreshInterval: 30000,
    trc20Contracts: selectedContracts
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">Tron 链测试</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <Tabs defaultValue="connect" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl p-1">
            <TabsTrigger value="connect" className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">钱包连接</TabsTrigger>
            <TabsTrigger value="balance" disabled={!connected} className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">余额信息</TabsTrigger>
            <TabsTrigger value="trc20" disabled={!connected} className="data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">TRC20代币</TabsTrigger>
          </TabsList>

          <TabsContent value="connect">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Tron 钱包连接</h2>
              <TronConnectButton />
            </div>
          </TabsContent>

          <TabsContent value="balance">
            {connected && address && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">钱包信息</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">地址</p>
                    <p className="font-mono text-sm break-all text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">{address}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">TRX 余额</p>
                      <button
                        onClick={() => refetch()}
                        className="px-3 py-1 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        刷新
                      </button>
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-8 w-32 mt-2" />
                    ) : error ? (
                      <p className="text-red-600 text-sm mt-2">{error}</p>
                    ) : (
                      <p className="text-2xl font-mono text-gray-900 mt-2">{trxBalance.toFixed(2)} TRX</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trc20">
            {connected && address && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">TRC20 代币余额</h2>
                  {trc20Balances.length === 0 ? (
                    <p className="text-gray-600 text-sm">暂无 TRC20 代币</p>
                  ) : (
                    <div className="space-y-3">
                      {trc20Balances.map((token) => (
                        <div 
                          key={token.contractAddress}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{token.symbol}</p>
                            <p className="text-xs text-gray-600 font-mono">
                              {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                            </p>
                          </div>
                          <div className="text-right">
                            {isLoading ? (
                              <Skeleton className="h-6 w-20" />
                            ) : (
                              <p className="font-mono text-gray-900">
                                {token.balance.toFixed(token.decimals || 2)}
                              </p>
                            )}
                            <button
                              onClick={() => refetchTrc20(token.contractAddress)}
                              className="text-xs text-primary-600 hover:underline mt-1"
                            >
                              刷新
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4 text-gray-900">支持的代币</h2>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    {TRC20_CONTRACTS.map((contract) => (
                      <li key={contract.address}>
                        {contract.name} ({contract.symbol})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 使用说明 */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">使用说明</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            <li>点击"钱包连接"标签页连接 TronLink 钱包</li>
            <li>连接后可查看"余额信息"和"TRC20代币"</li>
            <li>TRX 余额和 TRC20 代币余额每30秒自动刷新</li>
            <li>可以手动点击"刷新"按钮立即更新余额</li>
            <li>支持 USDT、USDC 等常用 TRC20 代币</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
