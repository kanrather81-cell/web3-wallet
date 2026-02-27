import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Wallet, LogOut, Plus, Download } from 'lucide-react';

export function ConnectWallet() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Connected Wallet</p>
                <p className="font-mono text-white">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              </div>
            </div>
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-white">连接您的钱包</CardTitle>
        <CardDescription className="text-gray-400">
          连接钱包以查看跨多个区块链的余额
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 内置钱包选项 */}
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">内置钱包</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/create-wallet')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
            >
              <Plus className="w-4 h-4" />
              创建钱包
            </button>
            <button
              onClick={() => navigate('/import-wallet')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              导入钱包
            </button>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">或使用外部钱包</span>
          </div>
        </div>

        {/* 外部钱包连接器 */}
        <div className="space-y-2">
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              连接 {connector.name}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
