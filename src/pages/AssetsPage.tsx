import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useMultiChainBalance } from '../lib/hooks';
import { ConnectWallet } from '../components';
import { NFTGallery } from '../components/NFTGallery';
import { TransactionHistory } from '../components/TransactionHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChainIcon } from '../components/ChainIcon';
import { AssetsLoadingSkeleton } from '../components/AssetsLoadingSkeleton';
import { AssetsChart } from '../components/AssetsChart';
import { Wallet, TrendingUp, RefreshCw, BarChart3, ArrowLeftRight, Compass, Heart, Coins, Image, History, Settings, Globe } from 'lucide-react';

export function AssetsPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { balances, totalBalanceInETH, isLoading, hasError } =
    useMultiChainBalance();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <ConnectWallet />
          <AssetsLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        <ConnectWallet />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Multi-Chain Assets</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/browser')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              浏览器
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
            <button
              onClick={() => navigate('/dapps')}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              <Heart className="w-4 h-4" />
              我的 DApps
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Compass className="w-4 h-4" />
              Discover
            </button>
            <button
              onClick={() => navigate('/swap')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Swap
            </button>
            <button
              onClick={() => navigate('/market')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Market
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-none text-white">
          <CardHeader>
            <CardDescription className="text-indigo-100">
              Total Balance (ETH)
            </CardDescription>
            <CardTitle className="text-5xl font-bold flex items-baseline gap-2">
              {totalBalanceInETH}
              <span className="text-2xl font-normal">ETH</span>
            </CardTitle>
            <p className="text-sm text-indigo-100 mt-2">
              Aggregated from Ethereum, Optimism, Arbitrum, and Base
            </p>
          </CardHeader>
        </Card>

        {hasError && (
          <Card className="bg-yellow-500/10 border-yellow-500/50">
            <CardContent className="p-4">
              <p className="text-yellow-200 text-sm">
                ⚠️ Some balances could not be loaded. Please check your connection.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Assets Chart */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <CardTitle className="text-white">Asset Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AssetsChart balances={balances} />
          </CardContent>
        </Card>

        {/* Tabs for Tokens, NFTs, and History */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="tokens" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              代币
            </TabsTrigger>
            <TabsTrigger value="nfts" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              NFT
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              历史
            </TabsTrigger>
          </TabsList>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-3 mt-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span>Chain Balances</span>
              <span className="text-sm text-gray-400 font-normal">
                ({balances.length} chains)
              </span>
            </h2>

            {balances.map((balance) => {
              return (
                <Card
                  key={balance.chainId}
                  className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ChainIcon chainId={balance.chainId} size={48} />
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {balance.chainName}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Chain ID: {balance.chainId}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {balance.isLoading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                            <span className="text-gray-400">Loading...</span>
                          </div>
                        ) : balance.error ? (
                          <span className="text-red-400 text-sm">Error loading</span>
                        ) : (
                          <>
                            <p className="text-2xl font-bold text-white">
                              {parseFloat(balance.formattedBalance).toFixed(6)}
                            </p>
                            <p className="text-sm text-gray-400">{balance.symbol}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="mt-6">
            <NFTGallery />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <TransactionHistory />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Card className="bg-gray-800/30 border-gray-700">
          <CardContent className="p-4">
            <p className="text-center text-sm text-gray-400">
              💡 Balances are fetched in real-time from each blockchain network
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
