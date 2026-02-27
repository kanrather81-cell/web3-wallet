/**
 * 交易状态组件
 * 显示交易状态、确认数和区块浏览器链接
 */

import { useTransactionStatus } from '../lib/hooks/useTransactionStatus';
import type { ChainType } from '../lib/wallet/transaction';

interface TransactionStatusProps {
  txHash: string;
  chain: ChainType;
  autoRefresh?: boolean;
  showConfirmations?: boolean;
  showExplorerLink?: boolean;
}

// 区块浏览器 URL 映射
const EXPLORER_URLS: Record<ChainType, string> = {
  ethereum: 'https://etherscan.io/tx/',
  solana: 'https://explorer.solana.com/tx/',
  bitcoin: 'https://mempool.space/tx/',
  tron: 'https://tronscan.org/#/transaction/',
};

// 状态图标和颜色
const STATUS_CONFIG = {
  pending: {
    icon: '⏳',
    label: '待确认',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  success: {
    icon: '✅',
    label: '成功',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  failed: {
    icon: '❌',
    label: '失败',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  unknown: {
    icon: '❓',
    label: '未知',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
};

export function TransactionStatus({
  txHash,
  chain,
  autoRefresh = true,
  showConfirmations = true,
  showExplorerLink = true,
}: TransactionStatusProps) {
  const { status, confirmations, isLoading, error, refresh } = useTransactionStatus({
    txHash,
    chain,
    autoStart: autoRefresh,
  });

  const config = STATUS_CONFIG[status];
  const explorerUrl = EXPLORER_URLS[chain] + txHash;

  // 格式化确认数显示
  const getConfirmationText = () => {
    if (!showConfirmations || confirmations === undefined) return null;

    switch (chain) {
      case 'ethereum':
        return `${confirmations} 个确认`;
      case 'solana':
        return `${confirmations}/31 确认`;
      case 'bitcoin':
        return `${confirmations}/6 确认`;
      case 'tron':
        return `${confirmations} 个确认`;
      default:
        return `${confirmations} 个确认`;
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center justify-between">
        {/* 状态信息 */}
        <div className="flex items-center gap-3">
          {/* 状态图标 */}
          <div className="text-2xl">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              config.icon
            )}
          </div>

          {/* 状态文本 */}
          <div>
            <div className={`font-semibold ${config.color}`}>
              {config.label}
            </div>
            
            {/* 确认数 */}
            {getConfirmationText() && (
              <div className="text-sm text-gray-400 mt-1">
                {getConfirmationText()}
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="text-xs text-red-400 mt-1">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {/* 刷新按钮 */}
          {!autoRefresh && (
            <button
              onClick={refresh}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              title="刷新状态"
            >
              🔄
            </button>
          )}

          {/* 区块浏览器链接 */}
          {showExplorerLink && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm rounded-lg transition-colors"
            >
              查看详情 →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionStatus;
