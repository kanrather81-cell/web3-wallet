import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaBalance } from '../lib/hooks/useSolanaBalance';

export function SolanaTestPage() {
  const { connected } = useWallet();
  const { balance, isLoading } = useSolanaBalance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">Solana 链测试页面</h1>
        
        <div className="bg-gray-800/50 border-gray-700 p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-white">钱包连接</h2>
          <WalletMultiButton className="mb-4" />
          
          {connected ? (
            <div className="mt-6 p-4 bg-gray-700/50 rounded-md">
              <h3 className="font-medium mb-2 text-white">钱包信息</h3>
              <p className="text-sm text-gray-300 mb-1">
                状态: <span className="text-green-400 font-medium">已连接</span>
              </p>
              <p className="text-sm text-gray-300">
                SOL余额: {isLoading ? (
                  '加载中...'
                ) : (
                  <span className="font-mono text-white">{balance.toFixed(6)} SOL</span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-gray-400 mt-4">点击上方按钮连接Solana钱包</p>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          <p>支持的 Solana 钱包：Phantom、Solflare</p>
          <p className="mt-1">如果没有安装钱包，连接窗口会提供下载链接</p>
        </div>
      </div>
    </div>
  );
}
