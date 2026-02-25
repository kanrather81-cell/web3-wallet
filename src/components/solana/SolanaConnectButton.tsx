import { useState, useEffect } from 'react';
import { useSolana } from '../../lib/hooks/useSolana';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function SolanaConnectButton() {
  const { address, balance, isConnected, isLoading, error, connect, disconnect } = useSolana();
  const [isInstalled, setIsInstalled] = useState(true);
  const [debugInfo, setDebugInfo] = useState({
    hasPhantom: false,
    hasWindow: false,
    phantomVersion: 'unknown',
  });

  // 检测 Phantom 钱包
  useEffect(() => {
    const checkPhantom = () => {
      const hasWindow = typeof window !== 'undefined';
      const solana = (window as any)?.solana;
      const hasPhantom = solana?.isPhantom || false;
      const phantomVersion = solana?.version || 'unknown';
      
      setDebugInfo({
        hasPhantom,
        hasWindow,
        phantomVersion,
      });
      
      console.log('🔍 Solana Debug Info:', {
        hasWindow,
        hasPhantom,
        phantomVersion,
        solanaObject: solana,
        isConnected,
        address,
        error,
      });
    };
    
    checkPhantom();
    
    // 每秒检查一次，因为钱包可能延迟加载
    const interval = setInterval(checkPhantom, 1000);
    
    return () => clearInterval(interval);
  }, [isConnected, address, error]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err: any) {
      if (err.message?.includes('install')) {
        setIsInstalled(false);
      }
    }
  };

  if (!isInstalled) {
    return (
      <Card className="bg-yellow-500/10 border-yellow-500/50">
        <CardContent className="p-4">
          <p className="text-yellow-200 text-sm mb-3">
            ⚠️ 未检测到 Phantom 钱包，请先安装
          </p>
          <button
            onClick={() => window.open('https://phantom.app/', '_blank')}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            安装 Phantom 钱包
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isConnected && address) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Solana 已连接</p>
              <p className="text-xs text-gray-400">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
              {isLoading ? (
                <Skeleton className="h-4 w-20 mt-1" />
              ) : (
                <p className="text-sm font-mono mt-1 text-white">
                  {balance.toFixed(6)} SOL
                </p>
              )}
            </div>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              断开
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* 调试信息卡片 */}
      <Card className="bg-blue-500/10 border-blue-500/50">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-medium text-blue-200">调试信息</p>
          </div>
          <div className="text-xs text-blue-300 space-y-1">
            <p>• Window 对象: {debugInfo.hasWindow ? '✅ 存在' : '❌ 不存在'}</p>
            <p>• Phantom 钱包: {debugInfo.hasPhantom ? '✅ 已安装' : '❌ 未安装'}</p>
            <p>• 钱包版本: {debugInfo.phantomVersion}</p>
            <p>• 连接状态: {isConnected ? '✅ 已连接' : '❌ 未连接'}</p>
            <p>• 加载中: {isLoading ? '是' : '否'}</p>
            {address && <p>• 地址: {address.slice(0, 8)}...{address.slice(-8)}</p>}
            {error && <p className="text-red-300">• 错误: {error}</p>}
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            连接中...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            连接 Solana 钱包
          </>
        )}
      </button>
    </div>
  );
}
