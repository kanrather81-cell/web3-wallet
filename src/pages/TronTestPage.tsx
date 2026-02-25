import { useState } from 'react';
import { TronConnectButton } from '../components/tron/TronConnectButton';
import { useTron } from '../lib/hooks/useTron';
import { useTronBalance } from '../lib/hooks/useTronBalance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Tron 链测试页面</h1>

        <Tabs defaultValue="connect" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connect">钱包连接</TabsTrigger>
            <TabsTrigger value="balance" disabled={!connected}>余额信息</TabsTrigger>
            <TabsTrigger value="trc20" disabled={!connected}>TRC20代币</TabsTrigger>
          </TabsList>

          <TabsContent value="connect">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Tron 钱包连接</CardTitle>
              </CardHeader>
              <CardContent>
                <TronConnectButton />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="balance">
            {connected && address && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">钱包信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">地址</p>
                    <p className="font-mono text-sm break-all text-white">{address}</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400">TRX 余额</p>
                      <button
                        onClick={() => refetch()}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        刷新
                      </button>
                    </div>
                    {isLoading ? (
                      <Skeleton className="h-8 w-32" />
                    ) : error ? (
                      <p className="text-red-400 text-sm">{error}</p>
                    ) : (
                      <p className="text-2xl font-mono text-white">{trxBalance.toFixed(2)} TRX</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="trc20">
            {connected && address && (
              <div className="space-y-4">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">TRC20 代币余额</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {trc20Balances.length === 0 ? (
                      <p className="text-gray-400 text-sm">暂无 TRC20 代币</p>
                    ) : (
                      <div className="space-y-3">
                        {trc20Balances.map((token) => (
                          <div 
                            key={token.contractAddress}
                            className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-white">{token.symbol}</p>
                              <p className="text-xs text-gray-400 font-mono">
                                {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                              </p>
                            </div>
                            <div className="text-right">
                              {isLoading ? (
                                <Skeleton className="h-6 w-20" />
                              ) : (
                                <p className="font-mono text-white">
                                  {token.balance.toFixed(token.decimals || 2)}
                                </p>
                              )}
                              <button
                                onClick={() => refetchTrc20(token.contractAddress)}
                                className="text-xs text-blue-400 hover:underline mt-1"
                              >
                                刷新
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">支持的代币</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                      {TRC20_CONTRACTS.map((contract) => (
                        <li key={contract.address}>
                          {contract.name} ({contract.symbol})
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 使用说明 */}
        <Card className="mt-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
              <li>点击"钱包连接"标签页连接 TronLink 钱包</li>
              <li>连接后可查看"余额信息"和"TRC20代币"</li>
              <li>TRX 余额和 TRC20 代币余额每30秒自动刷新</li>
              <li>可以手动点击"刷新"按钮立即更新余额</li>
              <li>支持 USDT、USDC 等常用 TRC20 代币</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
