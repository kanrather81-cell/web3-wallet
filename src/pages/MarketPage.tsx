import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coingeckoService, type CoinMarketData } from '../services/coingecko';
import { PriceAlertService, type PriceAlert } from '../services/priceAlert';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { LazyImage } from '../components/LazyImage';
import { TrendingUp, TrendingDown, Search, ArrowUpDown, Bell, BellOff, Check } from 'lucide-react';

export function MarketPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<CoinMarketData[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'change'>('market_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Price alert states
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinMarketData | null>(null);
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    loadMarketData();
    loadAlerts();
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    filterAndSortCoins();
  }, [coins, searchQuery, sortBy, sortOrder]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const loadAlerts = () => {
    setAlerts(PriceAlertService.getAlerts());
  };

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const data = await coingeckoService.getMarketData(1, 100);
      setCoins(data);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCoins = () => {
    let filtered = coins;

    // Filter by search query
    if (searchQuery) {
      filtered = coins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: number, bValue: number;

      switch (sortBy) {
        case 'market_cap':
          aValue = a.market_cap;
          bValue = b.market_cap;
          break;
        case 'price':
          aValue = a.current_price;
          bValue = b.current_price;
          break;
        case 'change':
          aValue = a.price_change_percentage_24h;
          bValue = b.price_change_percentage_24h;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredCoins(filtered);
  };

  const toggleSort = (column: 'market_cap' | 'price' | 'change') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };
  const formatPrice = (price: number) => {
    if (price < 0.01) return `${price.toFixed(6)}`;
    if (price < 1) return `${price.toFixed(4)}`;
    return `${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };


  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(2)}M`;
    return `${marketCap.toLocaleString()}`;
  };

  const handleOpenAlertDialog = (coin: CoinMarketData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCoin(coin);
    setTargetPrice(coin.current_price.toString());
    setIsAlertDialogOpen(true);
  };

  const handleCreateAlert = async () => {
    if (!selectedCoin || !targetPrice) return;

    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0) {
      alert('请输入有效的价格');
      return;
    }

    // Request notification permission if not granted
    if (notificationPermission !== 'granted') {
      const granted = await PriceAlertService.requestNotificationPermission();
      if (!granted) {
        alert('需要通知权限才能接收价格提醒');
        return;
      }
      setNotificationPermission('granted');
    }

    try {
      PriceAlertService.addAlert({
        coinId: selectedCoin.id,
        coinName: selectedCoin.name,
        coinSymbol: selectedCoin.symbol,
        type: alertType,
        targetPrice: price,
        currentPrice: selectedCoin.current_price,
        enabled: true,
      });

      loadAlerts();
      setIsAlertDialogOpen(false);
      setTargetPrice('');
    } catch (error) {
      alert('创建提醒失败');
    }
  };

  const getCoinAlerts = (coinId: string): PriceAlert[] => {
    return alerts.filter((alert) => alert.coinId === coinId && alert.enabled);
  };

  const hasActiveAlert = (coinId: string): boolean => {
    return getCoinAlerts(coinId).length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto pt-8 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-full" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Crypto Market</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Assets
          </button>
        </div>

        {/* Search */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search coins by name or symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Market Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Cryptocurrencies</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">#</TableHead>
                  <TableHead className="text-gray-400">Coin</TableHead>
                  <TableHead 
                    className="text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Price
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('change')}
                  >
                    <div className="flex items-center gap-1">
                      24h Change
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-gray-400 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('market_cap')}
                  >
                    <div className="flex items-center gap-1">
                      Market Cap
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-gray-400">Alert</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoins.map((coin) => (
                  <TableRow
                    key={coin.id}
                    className="border-gray-700 cursor-pointer hover:bg-gray-700/50"
                    onClick={() => navigate(`/market/${coin.id}`)}
                  >
                    <TableCell className="text-gray-400">
                      {coin.market_cap_rank}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <LazyImage
                          src={coin.image}
                          alt={coin.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-white">{coin.name}</div>
                          <div className="text-sm text-gray-400 uppercase">
                            {coin.symbol}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-mono">
                      {formatPrice(coin.current_price)}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`flex items-center gap-1 ${
                          coin.price_change_percentage_24h >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        {coin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-white">
                      {formatMarketCap(coin.market_cap)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => handleOpenAlertDialog(coin, e)}
                        className={`p-2 rounded-lg transition-colors ${
                          hasActiveAlert(coin.id)
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                        title={hasActiveAlert(coin.id) ? '已设置提醒' : '设置价格提醒'}
                      >
                        {hasActiveAlert(coin.id) ? (
                          <Bell className="w-4 h-4" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Price Alert Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>设置价格提醒</DialogTitle>
            <DialogDescription>
              {selectedCoin && `${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})`}
            </DialogDescription>
          </DialogHeader>

          {selectedCoin && (
            <div className="space-y-4">
              {/* Current Price */}
              <div className="p-3 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">当前价格</p>
                <p className="text-2xl font-bold text-white">
                  ${formatPrice(selectedCoin.current_price)}
                </p>
              </div>

              {/* Alert Type */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">提醒类型</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAlertType('above')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      alertType === 'above'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    高于
                  </button>
                  <button
                    onClick={() => setAlertType('below')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      alertType === 'below'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    低于
                  </button>
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">目标价格 (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="输入目标价格"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {/* Existing Alerts */}
              {getCoinAlerts(selectedCoin.id).length > 0 && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">当前提醒</p>
                  <div className="space-y-2">
                    {getCoinAlerts(selectedCoin.id).map((alert) => (
                      <div
                        key={alert.id}
                        className="p-2 bg-gray-800 rounded flex items-center justify-between"
                      >
                        <span className="text-sm text-white">
                          {alert.type === 'above' ? '高于' : '低于'} ${alert.targetPrice.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            PriceAlertService.deleteAlert(alert.id);
                            loadAlerts();
                          }}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notification Permission Warning */}
              {notificationPermission !== 'granted' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                  需要通知权限才能接收价格提醒
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAlertDialogOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  创建提醒
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
