import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaBalance } from '../lib/hooks/useSolanaBalance';

export function SolanaTestPage() {
  const { connected } = useWallet();
  const { balance, isLoading } = useSolanaBalance();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">Solana 链测试</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">钱包连接</h2>
          <WalletMultiButton className="mb-4" />
          
          {connected ? (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <h3 className="font-medium mb-2 text-gray-900">钱包信息</h3>
              <p className="text-sm text-gray-700 mb-1">
                状态: <span className="text-green-600 font-medium">已连接</span>
              </p>
              <p className="text-sm text-gray-700">
                SOL余额: {isLoading ? (
                  '加载中...'
                ) : (
                  <span className="font-mono text-gray-900">{balance.toFixed(6)} SOL</span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-gray-600 mt-4">点击上方按钮连接Solana钱包</p>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">支持的 Solana 钱包：Phantom、Solflare</p>
          <p className="text-sm text-blue-700 mt-1">如果没有安装钱包，连接窗口会提供下载链接</p>
        </div>
      </div>
    </div>
  );
}
