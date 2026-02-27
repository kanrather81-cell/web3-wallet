/**
 * 多链交易历史组件
 * 显示本地保存的交易记录
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionHistory } from '../lib/hooks/useTransactionHistory';
import { formatTimestamp, formatAddress } from '../lib/wallet/history';
import type { TransactionStatus } from '../lib/wallet/history';
import type { ChainType } from '../lib/wallet/transaction';
import { Skeleton } from './ui/skeleton';

// 链配置
const CHAINS = [
  { id: 'all' as const, name: '全部', icon: '🌐' },
  { id: 'ethereum' as ChainType, name: 'Ethereum', icon: '⟠' },
  { id: 'solana' as ChainType, name: 'Solana', icon: '◎' },
  { id: 'bitcoin' as ChainType, name: 'Bitcoin', icon: '₿' },
  { id: 'tron' as ChainType, name: 'Tron', icon: '⚡' },
];

// 状态配置
const STATUSES = [
  { id: 'all' as const, name: '全部', color: 'text-gray-400' },
  { id: 'pending' as TransactionStatus, name: '进行中', color: 'text-yellow-400' },
  { id: 'success' as TransactionStatus, name: '成功', color: 'text-green-400' },
  { id: 'failed' as TransactionStatus, name: '失败', color: 'text-red-400' },
];

export function MultiChainTransactionHistory() {
  const navigate = useNavigate();
  const [selectedChain, setSelectedChain] = useState<ChainType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');

  const { transactions, isLoading, refresh } = useTransactionHistory({
    chain: selectedChain === 'all' ? undefined : selectedChain,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  // 获取状态图标
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'success':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  // 获取链图标
  const getChainIcon = (chain: ChainType) => {
    return CHAINS.find(c => c.id === chain)?.icon || '🔗';
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 空状态
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">📝</div>
        <div className="text-gray-900 font-semibold mb-2">还没有交易记录</div>
        <div className="text-gray-600 text-sm">你的交易历史将显示在这里</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 筛选器 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
        {/* 链筛选 */}
        <div>
          <div className="text-sm text-gray-600 font-medium mb-2">按链筛选</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedChain === chain.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{chain.icon}</span>
                <span>{chain.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 状态筛选 */}
        <div>
          <div className="text-sm text-gray-600 font-medium mb-2">按状态筛选</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {STATUSES.map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedStatus === status.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>

        {/* 刷新按钮 */}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={refresh}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            <span>刷新</span>
          </button>
        </div>
      </div>

      {/* 交易列表 */}
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => navigate(`/tx/${tx.hash}?chain=${tx.chain}`)}
          >
            <div className="flex items-start justify-between gap-4">
              {/* 左侧：链图标和信息 */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* 链图标 */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {getChainIcon(tx.chain)}
                </div>

                {/* 交易信息 */}
                <div className="flex-1 min-w-0">
                  {/* 第一行：链名称和状态 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-900 font-semibold">{tx.chainName}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-lg border ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {getStatusIcon(tx.status)} {STATUSES.find(s => s.id === tx.status)?.name}
                    </span>
                  </div>

                  {/* 第二行：地址 */}
                  <div className="text-sm text-gray-600 mb-1 font-mono">
                    <span className="text-gray-500">从</span> {formatAddress(tx.from)}
                    <span className="mx-2">→</span>
                    <span className="text-gray-500">至</span> {formatAddress(tx.to)}
                  </div>

                  {/* 第三行：时间和哈希 */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>⏰ {formatTimestamp(tx.timestamp)}</span>
                    <span>•</span>
                    <span className="font-mono">{formatAddress(tx.hash, 6)}</span>
                  </div>

                  {/* Gas 费用（如果有） */}
                  {tx.gasFee && (
                    <div className="text-xs text-gray-500 mt-1">
                      ⛽ Gas: {tx.gasFee} {tx.feeToken || tx.token}
                    </div>
                  )}

                  {/* 错误信息（如果有） */}
                  {tx.error && (
                    <div className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                      ❌ {tx.error}
                    </div>
                  )}
                </div>
              </div>

              {/* 右侧：金额 */}
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {tx.amount} {tx.token}
                </div>
                {tx.tokenAddress && (
                  <div className="text-xs text-gray-500">代币转账</div>
                )}
                <div className="text-xs text-gray-600 mt-1 group-hover:text-primary-600 transition-colors">
                  查看详情 →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 统计信息 */}
      <div className="text-center text-sm text-gray-500 pt-4">
        共 {transactions.length} 条记录
      </div>
    </div>
  );
}

export default MultiChainTransactionHistory;
