import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useMultiChainBalance } from '../lib/hooks';
import { ConnectWallet } from '../components';
import { NFTGallery } from '../components/NFTGallery';
import { TransactionHistory } from '../components/TransactionHistory';
import { ChainConnectors } from '../components/ChainConnectors';
import { ChainAssets } from '../components/ChainAssets';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CustomTokenList } from '../components/CustomTokenList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ChainIcon } from '../components/ChainIcon';
import { AssetsLoadingSkeleton } from '../components/AssetsLoadingSkeleton';
import { AssetsChart } from '../components/AssetsChart';
import { Wallet, RefreshCw, ArrowLeftRight, History, Globe, Coins, Image } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

export function AssetsPage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { balances, totalBalanceInETH, isLoading, hasError } =
    useMultiChainBalance();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-24">
        <div className="max-w-md w-full app-container">
          <ConnectWallet />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-4xl mx-auto pt-8 app-container">
          <ConnectWallet />
          <AssetsLoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <div className="max-w-4xl mx-auto app-container">
          <ConnectWallet />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 mt-6">
            <Wallet className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">多链资产</h1>
          </div>

          {/* Total Balance Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-white/80 text-sm mb-2">总余额 (ETH)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white">{totalBalanceInETH}</span>
              <span className="text-2xl text-white/80">ETH</span>
            </div>
            <p className="text-sm text-white/70 mt-2">
              聚合自 Ethereum, Optimism, Arbitrum 和 Base
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <button
              onClick={() => navigate('/send')}
              className="btn-primary rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
            >
              <ArrowLeftRight className="w-6 h-6" />
              <span className="text-sm font-medium">发送</span>
            </button>
            <button
              onClick={() => navigate('/history')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
            >
              <History className="w-6 h-6 text-white" />
              <span className="text-white text-sm font-medium">历史</span>
            </button>
            <button
              onClick={() => navigate('/browser')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
            >
              <Globe className="w-6 h-6 text-white" />
              <span className="text-white text-sm font-medium">浏览器</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 transition-all"
            >
              <RefreshCw className="w-6 h-6 text-white" />
              <span className="text-white text-sm font-medium">刷新</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {hasError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-700 text-sm">
              ⚠️ 部分余额无法加载，请检查网络连接。
            </p>
          </div>
        )}

        {/* Assets Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">资产分布</h2>
          </div>
          <AssetsChart balances={balances} />
        </div>

        {/* Multi-Chain Connectors */}
        <ErrorBoundary>
          <ChainConnectors />
        </ErrorBoundary>

        {/* Multi-Chain Assets */}
        <ErrorBoundary>
          <ChainAssets />
        </ErrorBoundary>

        {/* Tabs for Tokens, NFTs, Custom Tokens, and History */}
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="w-full sm:w-auto grid grid-cols-4 gap-1 bg-white rounded-xl p-1">
            <TabsTrigger value="tokens" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">
              <Coins className="w-4 h-4" />
              代币
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">
              <Coins className="w-4 h-4" />
              自定义
            </TabsTrigger>
            <TabsTrigger value="nfts" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">
              <Image className="w-4 h-4" />
              NFT
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg">
              <History className="w-4 h-4" />
              历史
            </TabsTrigger>
          </TabsList>

          {/* Tokens Tab */}
          <TabsContent value="tokens" className="space-y-3 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>链余额</span>
              <span className="text-sm text-gray-600 font-normal">
                ({balances.length} 条链)
              </span>
            </h2>

            {balances.map((balance) => {
              return (
                <div
                  key={balance.chainId}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <ChainIcon chainId={balance.chainId} size={48} />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {balance.chainName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Chain ID: {balance.chainId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {balance.isLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                          <span className="text-gray-600">加载中...</span>
                        </div>
                      ) : balance.error ? (
                        <span className="text-red-500 text-sm">加载错误</span>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-gray-900">
                            {parseFloat(balance.formattedBalance).toFixed(6)}
                          </p>
                          <p className="text-sm text-gray-600">{balance.symbol}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Custom Tokens Tab */}
          <TabsContent value="custom" className="mt-6">
            <CustomTokenList chainType="ethereum" />
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-center text-sm text-blue-700">
            💡 余额从各区块链网络实时获取
          </p>
        </div>
      </div>
    </div>
  );
}
