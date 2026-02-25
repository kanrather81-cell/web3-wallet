import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import type { Transaction } from '../services/transactionHistory';

interface VirtualTransactionListProps {
  transactions: Transaction[];
  onTransactionClick?: (tx: Transaction) => void;
}

export function VirtualTransactionList({
  transactions,
  onTransactionClick,
}: VirtualTransactionListProps) {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated height of each transaction row
    overscan: 5, // Render 5 extra items above and below viewport
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatus = (tx: Transaction): 'confirmed' | 'pending' | 'failed' => {
    if (tx.isError === '1') return 'failed';
    if (tx.txreceipt_status === '1') return 'confirmed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return t('transaction.confirmed');
      case 'pending':
        return t('transaction.pending');
      case 'failed':
        return t('transaction.failed');
      default:
        return status;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {t('assets.noHistory')}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const tx = transactions[virtualItem.index];
          const isReceive = tx.type === 'receive';
          const status = getStatus(tx);

          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <div
                className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors mx-2 my-1"
                onClick={() => onTransactionClick?.(tx)}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Type and Address */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isReceive ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}
                    >
                      {isReceive ? (
                        <TrendingDown className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">
                          {isReceive ? t('transaction.receive') : t('transaction.send')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {isReceive ? tx.from : tx.to}
                      </p>
                    </div>
                  </div>

                  {/* Right: Amount and Time */}
                  <div className="text-right ml-4">
                    <p
                      className={`font-semibold ${
                        isReceive ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {isReceive ? '+' : '-'}
                      {tx.valueInEth} {tx.tokenSymbol || 'ETH'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(tx.timestamp)}
                    </p>
                  </div>

                  {/* Explorer Link */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        `https://etherscan.io/tx/${tx.hash}`,
                        '_blank'
                      );
                    }}
                    className="ml-2 p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
