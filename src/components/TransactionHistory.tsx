import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { TransactionHistoryService, type Transaction } from '../services/transactionHistory';
import { TransactionFilter, type TransactionFilterOptions } from './TransactionFilter';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

export function TransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<number | 'all'>('all');
  const [filters, setFilters] = useState<TransactionFilterOptions>({});

  const chains = [
    { id: 'all' as const, name: '所有链' },
    { id: 1, name: 'Ethereum' },
    { id: 137, name: 'Polygon' },
    { id: 10, name: 'Optimism' },
    { id: 42161, name: 'Arbitrum' },
    { id: 8453, name: 'Base' },
  ];

  useEffect(() => {
    if (address) {
      loadTransactions();
    }
  }, [address, selectedChain]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by chain
    if (filters.chainType && filters.chainType !== 'all') {
      const chainIdMap: Record<string, number> = {
        ethereum: 1,
        polygon: 137,
        optimism: 10,
        arbitrum: 42161,
        base: 8453,
      };
      const chainId = chainIdMap[filters.chainType];
      if (chainId) {
        filtered = filtered.filter((tx) => tx.chainId === chainId);
      }
    }

    // Filter by transaction type
    if (filters.transactionType && filters.transactionType !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filters.transactionType);
    }

    // Filter by token type
    if (filters.tokenType && filters.tokenType !== 'all') {
      if (filters.tokenType === 'native') {
        filtered = filtered.filter((tx) => !tx.tokenSymbol);
      } else if (filters.tokenType === 'erc20') {
        filtered = filtered.filter((tx) => tx.tokenSymbol && tx.tokenSymbol !== 'SOL');
      } else if (filters.tokenType === 'spl') {
        filtered = filtered.filter((tx) => tx.tokenSymbol === 'SOL');
      }
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime() / 1000;
      filtered = filtered.filter((tx) => tx.timestamp >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime() / 1000 + 86400; // End of day
      filtered = filtered.filter((tx) => tx.timestamp <= toDate);
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (newFilters: TransactionFilterOptions) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({});
  };

  const loadTransactions = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      let txs: Transaction[];
      if (selectedChain === 'all') {
        txs = await TransactionHistoryService.getMultiChainTransactions(address);
      } else {
        txs = await TransactionHistoryService.getTransactions(address, selectedChain);
      }
      setTransactions(txs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainColor = (chainId: number) => {
    const colors: Record<number, string> = {
      1: 'bg-blue-500',
      137: 'bg-purple-500',
      10: 'bg-red-500',
      42161: 'bg-cyan-500',
      8453: 'bg-indigo-500',
    };
    return colors[chainId] || 'bg-gray-500';
  };

  const getStatusIcon = (tx: Transaction) => {
    if (tx.isError === '1' || tx.txreceipt_status === '0') {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-green-400" />;
  };

  const getStatusText = (tx: Transaction) => {
    if (tx.isError === '1' || tx.txreceipt_status === '0') {
      return '失败';
    }
    return '成功';
  };

  const getStatusColor = (tx: Transaction) => {
    if (tx.isError === '1' || tx.txreceipt_status === '0') {
      return 'text-red-400';
    }
    return 'text-green-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredTransactions.length === 0 && !isLoading) {
    return (
      <div className="space-y-4">
        <TransactionFilter onFilterChange={handleFilterChange} onReset={handleFilterReset} />
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">
              {transactions.length === 0 ? '还没有交易记录' : '没有符合筛选条件的交易'}
            </p>
            <p className="text-gray-500 text-sm">
              {transactions.length === 0
                ? '你的交易历史将显示在这里'
                : '尝试调整筛选条件'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Transaction Filter */}
      <TransactionFilter onFilterChange={handleFilterChange} onReset={handleFilterReset} />

      {/* Chain Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {chains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => setSelectedChain(chain.id)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedChain === chain.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {chain.name}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.map((tx) => (
          <Card
            key={`${tx.chainId}-${tx.hash}`}
            className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all cursor-pointer group"
            onClick={() =>
              window.open(
                TransactionHistoryService.getExplorerUrl(tx.chainId, tx.hash),
                '_blank'
              )
            }
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left: Icon and Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'send'
                        ? 'bg-orange-500/20'
                        : 'bg-green-500/20'
                    }`}
                  >
                    {tx.type === 'send' ? (
                      <ArrowUpRight className="w-5 h-5 text-orange-400" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">
                        {tx.type === 'send' ? '发送' : '接收'}
                        {tx.tokenSymbol && ` ${tx.tokenSymbol}`}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${getChainColor(
                          tx.chainId
                        )} text-white font-medium`}
                      >
                        {tx.chain}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>
                        {tx.type === 'send' ? '至' : '从'}{' '}
                        {formatAddress(tx.type === 'send' ? tx.to : tx.from)}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Amount and Status */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-base font-semibold ${
                        tx.type === 'send' ? 'text-orange-400' : 'text-green-400'
                      }`}
                    >
                      {tx.type === 'send' ? '-' : '+'}
                      {parseFloat(tx.valueInEth).toFixed(4)}{' '}
                      {tx.tokenSymbol || 'ETH'}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {getStatusIcon(tx)}
                      <span className={`text-xs ${getStatusColor(tx)}`}>
                        {getStatusText(tx)}
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button (Optional) */}
      {filteredTransactions.length >= 20 && (
        <button
          onClick={loadTransactions}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          加载更多
        </button>
      )}
    </div>
  );
}
