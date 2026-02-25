import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';

export function SimpleSolanaConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      
      console.log('🔍 Simple Solana Debug:', {
        hasWindow,
        hasPhantom,
        phantomVersion,
        solanaObject: solana,
        isConnected: !!address,
      });
    };
    
    checkPhantom();
    const interval = setInterval(checkPhantom, 2000);
    
    return () => clearInterval(interval);
  }, [address]);

  // 检查是否已连接
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { solana } = window as any;
        if (solana?.isPhantom && solana.isConnected && solana.publicKey) {
          setAddress(solana.publicKey.toString());
        }
      } catch (err) {
        console.error('Check connection error:', err);
      }
    };
    
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      const { solana } = window as any;
      
      if (!solana?.isPhantom) {
        throw new Error('请安装 Phantom 钱包');
      }

      console.log('🔗 开始连接 Phantom...');
      
      // 如果已经连接，先断开
      if (solana.isConnected) {
        console.log('⚠️ 检测到已有连接，先断开...');
        try {
          await solana.disconnect();
          // 等待一小段时间确保断开完成
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (disconnectErr) {
          console.warn('断开连接时出错（可忽略）:', disconnectErr);
        }
      }
      
      // 尝试连接，使用 { onlyIfTrusted: false } 确保显示弹窗
      console.log('📱 请求连接权限...');
      const response = await solana.connect({ onlyIfTrusted: false });
      
      console.log('✅ 连接成功:', response);
      
      if (response.publicKey) {
        const addr = response.publicKey.toString();
        setAddress(addr);
        console.log('📍 地址:', addr);
      } else {
        throw new Error('未能获取钱包地址');
      }
    } catch (err: any) {
      console.error('❌ 连接失败:', err);
      
      let errorMessage = '连接失败';
      
      // 更详细的错误处理
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        errorMessage = '用户拒绝了连接请求';
      } else if (err.message?.includes('Unexpected')) {
        errorMessage = 'Phantom 连接异常，请尝试：\n1. 在 Phantom 中断开所有网站连接\n2. 刷新页面后重试';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { solana } = window as any;
      if (solana) {
        await solana.disconnect();
      }
      setAddress(null);
      setError(null);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  // 已连接状态
  if (address) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Solana 已连接</p>
              <p className="text-xs text-gray-400 font-mono">
                {address.slice(0, 8)}...{address.slice(-8)}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              断开
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 未连接状态
  return (
    <div className="space-y-3">
      {/* 调试信息 */}
      <Card className="bg-blue-500/10 border-blue-500/50">
        <CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium text-blue-200">🔍 调试信息</p>
          <div className="text-xs text-blue-300 space-y-1">
            <p>• Window: {debugInfo.hasWindow ? '✅' : '❌'}</p>
            <p>• Phantom: {debugInfo.hasPhantom ? '✅ 已安装' : '❌ 未安装'}</p>
            <p>• 版本: {debugInfo.phantomVersion}</p>
            <p>• 连接中: {isConnecting ? '是' : '否'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 错误信息 */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-3">
            <p className="text-red-200 text-sm whitespace-pre-line">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* 连接按钮 */}
      {debugInfo.hasPhantom ? (
        <div className="space-y-2">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>连接中...</span>
              </>
            ) : (
              <>
                <span>💼</span>
                <span>连接 Phantom 钱包</span>
              </>
            )}
          </button>
          
          {/* 辅助按钮：手动断开 */}
          {error && error.includes('Unexpected') && (
            <button
              onClick={async () => {
                try {
                  const { solana } = window as any;
                  if (solana) {
                    await solana.disconnect();
                    setError(null);
                    alert('已断开 Phantom 连接，请重新点击"连接 Phantom 钱包"按钮');
                  }
                } catch (err) {
                  console.error('手动断开失败:', err);
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              🔧 手动断开 Phantom 连接
            </button>
          )}
        </div>
      ) : (
        <Card className="bg-yellow-500/10 border-yellow-500/50">
          <CardContent className="p-4">
            <p className="text-yellow-200 text-sm mb-3">
              ⚠️ 未检测到 Phantom 钱包
            </p>
            <button
              onClick={() => window.open('https://phantom.app/', '_blank')}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              安装 Phantom 钱包
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
