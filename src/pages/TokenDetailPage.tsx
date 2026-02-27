import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMultiChainBalance } from '../lib/hooks/useMultiChainBalance';
import { ArrowUpRight, ArrowDownLeft, Copy, RefreshCw } from 'lucide-react';
import type { ChainBalance } from '../lib/hooks/useMultiChainBalance';

export function TokenDetailPage() {
  const { chainId, tokenAddress } = useParams<{ chainId: string; tokenAddress?: string }>();
  const navigate = useNavigate();
  const { balances, isLoading } = useMultiChainBalance();
  const [tokenInfo, setTokenInfo] = useState<ChainBalance | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 从 balances 中找到对应链的信息
    const chain = balances.find(
      (b) => b.chainId.toString() === chainId
    );
    
    if (chain) {
      setTokenInfo(chain);
    }
  }, [chainId, balances]);

  const handleCopyAddress = () => {
    // 从 localStorage 获取对应链的地址
    let address = '';
    if (chainId === 'solana') {
      address = localStorage.getItem('solana_address') || '';
    } else if (chainId === 'bitcoin') {
      address = localStorage.getItem('bitcoin_address') || '';
    } else if (chainId === 'tron') {
      address = localStorage.getItem('tron_address') || '';
    } else {
      // EVM chains use the same address
      address = localStorage.getItem('ethereum_address') || '';
    }

    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = () => {
    const token = tokenAddress || 'native';
    navigate(`/send/${chainId}/${token}`);
  };

  const handleReceive = () => {
    const token = tokenAddress || 'native';
    navigate(`/receive/${chainId}/${token}`);
  };

  if (isLoading || !tokenInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-600">加载代币信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold text-3xl">
              {tokenInfo.symbol.charAt(0)}
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {tokenInfo.chainName}
        </h1>
        <p className="text-white/80 text-center">{tokenInfo.symbol}</p>

        {/* Balance Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mt-6">
          <p className="text-white/80 text-sm text-center mb-2">余额</p>
          <p className="text-4xl font-bold text-white text-center">
            {parseFloat(tokenInfo.formattedBalance).toFixed(
              tokenInfo.symbol === 'BTC' ? 8 : 6
            )}
          </p>
          <p className="text-white/80 text-center mt-2">{tokenInfo.symbol}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSend}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowUpRight className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">发送</span>
          </button>
          <button
            onClick={handleReceive}
            className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowDownLeft className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">接收</span>
          </button>
        </div>
      </div>

      {/* Token Info */}
      <div className="max-w-md mx-auto px-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">代币信息</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">链</span>
              <span className="text-gray-900 font-medium">{tokenInfo.chainName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">符号</span>
              <span className="text-gray-900 font-medium">{tokenInfo.symbol}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">类型</span>
              <span className="text-gray-900 font-medium">原生代币</span>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-start">
                <span className="text-gray-600">钱包地址</span>
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  {copied ? (
                    <span className="text-green-600 text-sm font-medium">已复制!</span>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900 text-sm">复制地址</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Link */}
        <button
          onClick={() => navigate('/history')}
          className="w-full bg-white rounded-2xl p-4 hover:bg-gray-50 transition-all shadow-sm"
        >
          <span className="text-gray-900 font-medium">查看交易历史</span>
        </button>
      </div>
    </div>
  );
}

export default TokenDetailPage;
