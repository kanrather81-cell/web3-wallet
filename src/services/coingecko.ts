import axios from 'axios';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  last_updated: string;
}

export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    price_change_percentage_24h: number;
    price_change_percentage_7d: number;
    price_change_percentage_30d: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
  };
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

class CoinGeckoService {
  private api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  async getMarketData(
    page: number = 1,
    perPage: number = 50,
    order: string = 'market_cap_desc'
  ): Promise<CoinMarketData[]> {
    try {
      const response = await this.api.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order,
          per_page: perPage,
          page,
          sparkline: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  async searchCoins(query: string): Promise<CoinMarketData[]> {
    try {
      const response = await this.api.get('/coins/markets', {
        params: {
          vs_currency: 'usd',
          ids: query.toLowerCase(),
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching coins:', error);
      throw error;
    }
  }

  async getCoinDetail(coinId: string): Promise<CoinDetail> {
    try {
      const response = await this.api.get(`/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          community_data: false,
          developer_data: false,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching coin detail:', error);
      throw error;
    }
  }

  async getChartData(
    coinId: string,
    days: number = 7
  ): Promise<ChartData> {
    try {
      const response = await this.api.get(`/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }
}

export const coingeckoService = new CoinGeckoService();
