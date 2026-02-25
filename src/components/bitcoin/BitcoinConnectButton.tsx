import { useRef } from 'react';
import type { FC } from 'react';
import {
  useBitcoin,
  handleBitcoinWalletConnected,
  useBitcoinWalletListener,
} from '../../lib/hooks/useBitcoin';
import { Skeleton } from '../ui/skeleton';

interface BitcoinConnectButtonProps {
  onConnected?: (address: string) => void;
  className?: string;
}

export const BitcoinConnectButton: FC<BitcoinConnectButtonProps> = ({
  onConnected,
  className,
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { address, connected, balance, isLoading, disconnect } = useBitcoin();

  // 监听自定义事件
  useBitcoinWalletListener((addr) => {
    handleBitcoinWalletConnected(addr);
    if (onConnected) onConnected(addr);
  });

  // 如果已连接，显示钱包信息
  if (connected && address) {
    return (
      <div className={`bg-gray-800/50 border-gray-700 p-4 rounded-lg border ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Bitcoin 已连接</p>
            <p className="text-xs text-gray-400">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
            {isLoading ? (
              <Skeleton className="h-4 w-20 mt-1" />
            ) : (
              <p className="text-sm font-mono mt-1 text-white">
                {balance.toFixed(8)} BTC
              </p>
            )}
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            断开
          </button>
        </div>
      </div>
    );
  }

  // 未连接时显示连接提示（bitcoinsdk Web Component 需要单独集成）
  return (
    <div className={className} ref={buttonRef}>
      <div className="bg-gray-800/50 border-gray-700 p-4 rounded-lg border">
        <p className="text-sm text-gray-300 mb-2">
          Bitcoin 钱包连接功能需要集成 bitcoinsdk Web Component
        </p>
        <p className="text-xs text-gray-400">
          支持：Unisat、Xverse、Leather等比特币钱包
        </p>
        <p className="text-xs text-gray-500 mt-2">
          提示：可以通过 localStorage 设置 'bitcoin_address' 来测试余额显示功能
        </p>
      </div>
    </div>
  );
};
