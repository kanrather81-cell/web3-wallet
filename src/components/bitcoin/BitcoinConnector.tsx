import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { BitcoinWalletConnector } from 'bitcoin-wallet-connector';
import type { AdapterEntry } from 'bitcoin-wallet-connector';
import {
  UnisatWalletAdapterFactory,
  XverseWalletAdapterFactory,
  LeatherWalletAdapterFactory,
} from 'bitcoin-wallet-connector/adapters';
import { Card, CardContent } from '../ui/card';
import { Loader2, Wallet, LogOut } from 'lucide-react';

export const BitcoinConnector: FC = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(0);
  const [availableWallets, setAvailableWallets] = useState<AdapterEntry[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [connector] = useState(() => 
    new BitcoinWalletConnector([
      UnisatWalletAdapterFactory(),
      XverseWalletAdapterFactory(),
      LeatherWalletAdapterFactory(),
    ])
  );

  useEffect(() => {
    // 从localStorage恢复地址
    const saved = localStorage.getItem('bitcoin_address');
    if (saved) setAddress(saved);
  }, []);

  useEffect(() => {
    // 订阅可用钱包
    const subscription = connector.subscribeAvailableAdapters((adapters) => {
      setAvailableWallets(adapters);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [connector]);

  const handleConnect = async (adapterId: string, adapter: any) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      await connector.connect(adapterId, adapter);
      const addresses = await adapter.getAddresses();
      
      if (addresses.length > 0) {
        const addr = addresses[0].address;
        localStorage.setItem('bitcoin_address', addr);
        setAddress(addr);
        
        // 触发自定义事件，让其他组件知道钱包已连接
        window.dispatchEvent(
          new CustomEvent('bitcoin-wallet-connected', { detail: { address: addr } })
        );
      }
    } catch (err: any) {
      console.error('连接失败:', err);
      setError(err.message || '连接失败');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('bitcoin_address');
    setAddress('');
    setBalance(0);
    setError(null);
  };

  // 测试用：手动输入地址
  const handleTestAddress = () => {
    const testAddr = prompt('输入比特币地址测试:');
    if (testAddr) {
      localStorage.setItem('bitcoin_address', testAddr);
      setAddress(testAddr);
      
      // 触发自定义事件
      window.dispatchEvent(
        new CustomEvent('bitcoin-wallet-connected', { detail: { address: testAddr } })
      );
    }
  };

  // 已连接状态
  if (address) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Bitcoin 已连接</p>
              <p className="text-xs text-gray-400 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
              <p className="text-sm font-mono mt-1 text-white">
                {balance.toFixed(8)} BTC
              </p>
            </div>
            <button
              onClick={handleDisconnect}
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

  // 未连接状态
  return (
    <div className="space-y-3">
      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="p-3">
            <p className="text-red-200 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}
      
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-white">选择比特币钱包：</p>
          
          <div className="flex flex-wrap gap-2">
            {availableWallets.map(([adapterId, adapter]) => (
              <button
                key={adapterId}
                onClick={() => handleConnect(adapterId, adapter)}
                disabled={isConnecting}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    连接中...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    连接 {adapterId}
                  </>
                )}
              </button>
            ))}
            
            <button
              onClick={handleTestAddress}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              测试地址
            </button>
          </div>
          
          <p className="text-xs text-gray-400">
            支持：Unisat、Xverse、Leather等比特币钱包
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
