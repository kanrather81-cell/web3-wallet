import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coingeckoService, type CoinMarketData } from '../services/coingecko';
import { PriceAlertService, type PriceAlert } from '../services/priceAlert';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Skeleton } from '../components/ui/skeleton';
import { LazyImage } from '../components/LazyImage';
import { TrendingUp, TrendingDown, Search, Bell, BellOff, Check } from 'lucide-react';

export function MarketPage() {
  const navigate = useNavigate();
  const [coins, setCoins] = useState<CoinMarketData[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    filterCoins();
  }, [coins, searchQuery]);

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

  const filterCoins = () => {
    let filtered = coins;

    // Filter by search query
    if (searchQuery) {
      filtered = coins.filter(
        (coin) =>
          coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by market cap (default)
    filtered = [...filtered].sort((a, b) => b.market_cap - a.market_cap);

    setFilteredCoins(filtered);
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
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-gradient-tp text-white px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg">
          <Skeleton className="h-8 w-32 bg-white/20" />
        </div>
        <div className="px-4 mt-6 space-y-3">
          <Skeleton className="h-12 w-full bg-gray-200" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header - TP Style */}
      <div className="bg-gradient-tp text-white px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7" />
            <h1 className="text-2xl font-bold">行情</h1>
          </div>
        </div>
        
        {/* Search - Inside Header */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="搜索币种名称或代码..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 backdrop-blur border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
          />
        </div>
      </div>

      {/* Market List - TP Style Cards */}
      <div className="px-4 mt-6 space-y-3">
        {filteredCoins.map((coin) => (
          <div
            key={coin.id}
            className="bg-white rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer border border-gray-100"
            onClick={() => navigate(`/market/${coin.id}`)}
          >
            <div className="flex items-center justify-between">
              {/* Left: Coin Info */}
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <LazyImage
                    src={coin.image}
                    alt={coin.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="absolute -top-1 -left-1 bg-gray-100 text-gray-600 text-xs font-semibold px-1.5 py-0.5 rounded">
                    {coin.market_cap_rank}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{coin.name}</p>
                  <p className="text-sm text-gray-500 uppercase">{coin.symbol}</p>
                </div>
              </div>

              {/* Right: Price & Change */}
              <div className="text-right ml-3">
                <p className="font-semibold text-gray-900 font-mono text-sm">
                  ${formatPrice(coin.current_price)}
                </p>
                <div
                  className={`flex items-center justify-end gap-1 text-sm font-medium ${
                    coin.price_change_percentage_24h >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </div>
              </div>

              {/* Alert Button */}
              <button
                onClick={(e) => handleOpenAlertDialog(coin, e)}
                className={`ml-3 p-2 rounded-lg transition-colors ${
                  hasActiveAlert(coin.id)
                    ? 'bg-yellow-50 text-yellow-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={hasActiveAlert(coin.id) ? '已设置提醒' : '设置价格提醒'}
              >
                {hasActiveAlert(coin.id) ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Market Cap - Below */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">市值</span>
              <span className="text-gray-700 font-medium">
                ${formatMarketCap(coin.market_cap)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Price Alert Dialog - TP Style */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">设置价格提醒</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedCoin && `${selectedCoin.name} (${selectedCoin.symbol.toUpperCase()})`}
            </DialogDescription>
          </DialogHeader>

          {selectedCoin && (
            <div className="space-y-4">
              {/* Current Price */}
              <div className="p-4 bg-gradient-primary rounded-xl text-white">
                <p className="text-sm opacity-90 mb-1">当前价格</p>
                <p className="text-2xl font-bold">
                  ${formatPrice(selectedCoin.current_price)}
                </p>
              </div>

              {/* Alert Type */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">提醒类型</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAlertType('above')}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      alertType === 'above'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    高于
                  </button>
                  <button
                    onClick={() => setAlertType('below')}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      alertType === 'below'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    低于
                  </button>
                </div>
              </div>

              {/* Target Price */}
              <div>
                <label className="text-sm text-gray-600 mb-2 block font-medium">目标价格 (USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="输入目标价格"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>

              {/* Existing Alerts */}
              {getCoinAlerts(selectedCoin.id).length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">当前提醒</p>
                  <div className="space-y-2">
                    {getCoinAlerts(selectedCoin.id).map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 bg-gray-50 rounded-xl flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-900 font-medium">
                          {alert.type === 'above' ? '高于' : '低于'} ${alert.targetPrice.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            PriceAlertService.deleteAlert(alert.id);
                            loadAlerts();
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
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
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
                  需要通知权限才能接收价格提醒
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAlertDialogOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateAlert}
                  className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium shadow-md"
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
