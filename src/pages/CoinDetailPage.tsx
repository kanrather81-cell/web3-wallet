import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { coingeckoService, type CoinDetail, type ChartData } from '../services/coingecko';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';

export function CoinDetailPage() {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(7);

  useEffect(() => {
    if (coinId) {
      loadCoinData();
    }
  }, [coinId, timeRange]);

  const loadCoinData = async () => {
    if (!coinId) return;

    try {
      setLoading(true);
      const [coinData, chart] = await Promise.all([
        coingeckoService.getCoinDetail(coinId),
        coingeckoService.getChartData(coinId, timeRange),
      ]);
      setCoin(coinData);
      setChartData(chart);
    } catch (error) {
      console.error('Failed to load coin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartOption = () => {
    if (!chartData) return {};

    const prices = chartData.prices.map(([timestamp, price]) => [
      new Date(timestamp),
      price,
    ]);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: (params: any) => {
          const date = new Date(params[0].value[0]).toLocaleString();
          const price = `$${params[0].value[1].toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
          return `${date}<br/>Price: ${price}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: { color: '#9ca3af' },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#4b5563' } },
        axisLabel: {
          color: '#9ca3af',
          formatter: (value: number) => `$${value.toLocaleString()}`,
        },
        splitLine: { lineStyle: { color: '#374151' } },
      },
      series: [
        {
          name: 'Price',
          type: 'line',
          data: prices,
          smooth: true,
          lineStyle: {
            color: '#6366f1',
            width: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
                { offset: 1, color: 'rgba(99, 102, 241, 0)' },
              ],
            },
          },
        },
      ],
    };
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  if (loading || !coin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-6xl mx-auto pt-8 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  const priceChange24h = coin.market_data.price_change_percentage_24h;
  const isPositive = priceChange24h >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/market')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={coin.image.large} alt={coin.name} className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="text-3xl font-bold text-white">{coin.name}</h1>
            <p className="text-gray-400 uppercase">{coin.symbol}</p>
          </div>
        </div>

        {/* Price Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-white">
                {formatPrice(coin.market_data.current_price.usd)}
              </span>
              <div
                className={`flex items-center gap-1 text-lg ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {Math.abs(priceChange24h).toFixed(2)}%
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Price Chart</CardTitle>
              <div className="flex gap-2">
                {[
                  { label: '24H', days: 1 },
                  { label: '7D', days: 7 },
                  { label: '30D', days: 30 },
                  { label: '90D', days: 90 },
                  { label: '1Y', days: 365 },
                ].map((range) => (
                  <button
                    key={range.days}
                    onClick={() => setTimeRange(range.days)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      timeRange === range.days
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ReactECharts option={getChartOption()} style={{ height: '100%' }} />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardDescription className="text-gray-400">Market Cap</CardDescription>
              <CardTitle className="text-white">
                {formatMarketCap(coin.market_data.market_cap.usd)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardDescription className="text-gray-400">24h Volume</CardDescription>
              <CardTitle className="text-white">
                {formatMarketCap(coin.market_data.total_volume.usd)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardDescription className="text-gray-400">Circulating Supply</CardDescription>
              <CardTitle className="text-white">
                {coin.market_data.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Description */}
        {coin.description.en && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">About {coin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-gray-300 prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: coin.description.en.split('.').slice(0, 3).join('.') + '.',
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
