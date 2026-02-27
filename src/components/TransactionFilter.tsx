import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Filter, X, Calendar } from 'lucide-react';

export interface TransactionFilterOptions {
  chainType?: string;
  tokenType?: string;
  transactionType?: 'all' | 'send' | 'receive';
  dateFrom?: string;
  dateTo?: string;
}

interface TransactionFilterProps {
  onFilterChange: (filters: TransactionFilterOptions) => void;
  onReset: () => void;
}

const CHAIN_OPTIONS = [
  { value: 'all', label: '所有链' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'optimism', label: 'Optimism' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'base', label: 'Base' },
  { value: 'bitcoin', label: 'Bitcoin' },
  { value: 'solana', label: 'Solana' },
  { value: 'tron', label: 'Tron' },
];

const TOKEN_TYPE_OPTIONS = [
  { value: 'all', label: '所有代币' },
  { value: 'native', label: '原生代币' },
  { value: 'erc20', label: 'ERC-20' },
  { value: 'spl', label: 'SPL Token' },
];

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'all', label: '所有类型' },
  { value: 'send', label: '发送' },
  { value: 'receive', label: '接收' },
];

export function TransactionFilter({ onFilterChange, onReset }: TransactionFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<TransactionFilterOptions>({
    chainType: 'all',
    tokenType: 'all',
    transactionType: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterChange = (key: keyof TransactionFilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: TransactionFilterOptions = {
      chainType: 'all',
      tokenType: 'all',
      transactionType: 'all',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(resetFilters);
    onReset();
  };

  const hasActiveFilters =
    filters.chainType !== 'all' ||
    filters.tokenType !== 'all' ||
    filters.transactionType !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            交易筛选
            {hasActiveFilters && (
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                已启用
              </span>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReset}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                重置
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? '收起' : '展开'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Chain Filter */}
          <div className="space-y-2">
            <Label htmlFor="chain-filter" className="text-white">
              按链筛选
            </Label>
            <Select
              value={filters.chainType || 'all'}
              onValueChange={(value) => handleFilterChange('chainType', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {CHAIN_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="token-filter" className="text-white">
              按代币类型筛选
            </Label>
            <Select
              value={filters.tokenType || 'all'}
              onValueChange={(value) => handleFilterChange('tokenType', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {TOKEN_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type-filter" className="text-white">
              按交易类型筛选
            </Label>
            <Select
              value={filters.transactionType || 'all'}
              onValueChange={(value) =>
                handleFilterChange('transactionType', value as 'all' | 'send' | 'receive')
              }
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              按时间范围筛选
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="date-from" className="text-xs text-gray-400">
                  开始日期
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="date-to" className="text-xs text-gray-400">
                  结束日期
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-2">当前筛选条件：</p>
              <div className="flex flex-wrap gap-2">
                {filters.chainType && filters.chainType !== 'all' && (
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                    链: {CHAIN_OPTIONS.find((o) => o.value === filters.chainType)?.label}
                  </span>
                )}
                {filters.tokenType && filters.tokenType !== 'all' && (
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">
                    代币: {TOKEN_TYPE_OPTIONS.find((o) => o.value === filters.tokenType)?.label}
                  </span>
                )}
                {filters.transactionType && filters.transactionType !== 'all' && (
                  <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                    类型:{' '}
                    {
                      TRANSACTION_TYPE_OPTIONS.find((o) => o.value === filters.transactionType)
                        ?.label
                    }
                  </span>
                )}
                {filters.dateFrom && (
                  <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded">
                    从: {filters.dateFrom}
                  </span>
                )}
                {filters.dateTo && (
                  <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-1 rounded">
                    到: {filters.dateTo}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
