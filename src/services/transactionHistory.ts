// Transaction History Service using Etherscan-like APIs
import axios from 'axios';

// API Keys (store in environment variables in production)
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
const POLYGONSCAN_API_KEY = import.meta.env.VITE_POLYGONSCAN_API_KEY || '';
const OPTIMISM_API_KEY = import.meta.env.VITE_OPTIMISM_API_KEY || '';
const ARBISCAN_API_KEY = import.meta.env.VITE_ARBISCAN_API_KEY || '';
const BASESCAN_API_KEY = import.meta.env.VITE_BASESCAN_API_KEY || '';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueInEth: string;
  timestamp: number;
  blockNumber: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
  type: 'send' | 'receive' | 'contract';
  chain: string;
  chainId: number;
}

interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimal?: string;
}

// Chain configurations
const CHAIN_CONFIGS: Record<
  number,
  { name: string; apiUrl: string; apiKey: string; explorerUrl: string }
> = {
  1: {
    name: 'Ethereum',
    apiUrl: 'https://api.etherscan.io/api',
    apiKey: ETHERSCAN_API_KEY,
    explorerUrl: 'https://etherscan.io',
  },
  137: {
    name: 'Polygon',
    apiUrl: 'https://api.polygonscan.com/api',
    apiKey: POLYGONSCAN_API_KEY,
    explorerUrl: 'https://polygonscan.com',
  },
  10: {
    name: 'Optimism',
    apiUrl: 'https://api-optimistic.etherscan.io/api',
    apiKey: OPTIMISM_API_KEY,
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  42161: {
    name: 'Arbitrum',
    apiUrl: 'https://api.arbiscan.io/api',
    apiKey: ARBISCAN_API_KEY,
    explorerUrl: 'https://arbiscan.io',
  },
  8453: {
    name: 'Base',
    apiUrl: 'https://api.basescan.org/api',
    apiKey: BASESCAN_API_KEY,
    explorerUrl: 'https://basescan.org',
  },
};

export class TransactionHistoryService {
  /**
   * Get transaction history for a wallet address on a specific chain
   */
  static async getTransactions(
    address: string,
    chainId: number,
    page: number = 1,
    offset: number = 20
  ): Promise<Transaction[]> {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) {
      console.warn(`Chain ${chainId} not supported`);
      return [];
    }

    // If no API key, return mock data
    if (!config.apiKey) {
      console.warn(`No API key for ${config.name}, using mock data`);
      return this.getMockTransactions(address, chainId);
    }

    try {
      // Get normal transactions
      const normalTxs = await this.fetchNormalTransactions(
        address,
        chainId,
        page,
        offset
      );

      // Get internal transactions
      const internalTxs = await this.fetchInternalTransactions(
        address,
        chainId,
        page,
        offset
      );

      // Get ERC20 token transfers
      const tokenTxs = await this.fetchTokenTransactions(
        address,
        chainId,
        page,
        offset
      );

      // Combine and sort by timestamp
      const allTxs = [...normalTxs, ...internalTxs, ...tokenTxs];
      return allTxs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error(`Error fetching transactions for ${config.name}:`, error);
      return this.getMockTransactions(address, chainId);
    }
  }

  /**
   * Get transactions from multiple chains
   */
  static async getMultiChainTransactions(
    address: string,
    chainIds: number[] = [1, 137, 10, 42161, 8453]
  ): Promise<Transaction[]> {
    const promises = chainIds.map((chainId) =>
      this.getTransactions(address, chainId)
    );

    const results = await Promise.allSettled(promises);
    const allTransactions: Transaction[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        allTransactions.push(...result.value);
      }
    });

    // Sort by timestamp descending
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Fetch normal transactions from Etherscan-like API
   */
  private static async fetchNormalTransactions(
    address: string,
    chainId: number,
    page: number,
    offset: number
  ): Promise<Transaction[]> {
    const config = CHAIN_CONFIGS[chainId];
    const response = await axios.get(config.apiUrl, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        page,
        offset,
        sort: 'desc',
        apikey: config.apiKey,
      },
    });

    if (response.data.status !== '1') {
      return [];
    }

    return response.data.result.map((tx: EtherscanTransaction) =>
      this.transformTransaction(tx, address, chainId, 'normal')
    );
  }

  /**
   * Fetch internal transactions
   */
  private static async fetchInternalTransactions(
    address: string,
    chainId: number,
    page: number,
    offset: number
  ): Promise<Transaction[]> {
    const config = CHAIN_CONFIGS[chainId];
    try {
      const response = await axios.get(config.apiUrl, {
        params: {
          module: 'account',
          action: 'txlistinternal',
          address,
          page,
          offset,
          sort: 'desc',
          apikey: config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        return [];
      }

      return response.data.result.map((tx: EtherscanTransaction) =>
        this.transformTransaction(tx, address, chainId, 'internal')
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Fetch ERC20 token transfers
   */
  private static async fetchTokenTransactions(
    address: string,
    chainId: number,
    page: number,
    offset: number
  ): Promise<Transaction[]> {
    const config = CHAIN_CONFIGS[chainId];
    try {
      const response = await axios.get(config.apiUrl, {
        params: {
          module: 'account',
          action: 'tokentx',
          address,
          page,
          offset,
          sort: 'desc',
          apikey: config.apiKey,
        },
      });

      if (response.data.status !== '1') {
        return [];
      }

      return response.data.result.map((tx: EtherscanTransaction) =>
        this.transformTransaction(tx, address, chainId, 'token')
      );
    } catch (error) {
      return [];
    }
  }

  /**
   * Transform Etherscan transaction to our format
   */
  private static transformTransaction(
    tx: EtherscanTransaction,
    userAddress: string,
    chainId: number,
    _txType: 'normal' | 'internal' | 'token'
  ): Transaction {
    const config = CHAIN_CONFIGS[chainId];
    const value = tx.value || '0';
    const decimals = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : 18;
    const valueInEth = (parseInt(value) / Math.pow(10, decimals)).toFixed(6);

    const isSent = tx.from.toLowerCase() === userAddress.toLowerCase();
    const type: Transaction['type'] = isSent ? 'send' : 'receive';

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      value,
      valueInEth,
      timestamp: parseInt(tx.timeStamp),
      blockNumber: tx.blockNumber,
      gas: tx.gas,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed || '0',
      isError: tx.isError || '0',
      txreceipt_status: tx.txreceipt_status || '1',
      input: tx.input || '0x',
      contractAddress: tx.contractAddress || '',
      tokenName: tx.tokenName,
      tokenSymbol: tx.tokenSymbol,
      tokenDecimal: tx.tokenDecimal,
      type,
      chain: config.name,
      chainId,
    };
  }

  /**
   * Get explorer URL for a transaction
   */
  static getExplorerUrl(chainId: number, txHash: string): string {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) return '#';
    return `${config.explorerUrl}/tx/${txHash}`;
  }

  /**
   * Mock transaction data for demo
   */
  private static getMockTransactions(address: string, chainId: number): Transaction[] {
    const config = CHAIN_CONFIGS[chainId];
    const now = Math.floor(Date.now() / 1000);

    return [
      {
        hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        from: address,
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        value: '1000000000000000000',
        valueInEth: '1.000000',
        timestamp: now - 3600,
        blockNumber: '12345678',
        gas: '21000',
        gasPrice: '50000000000',
        gasUsed: '21000',
        isError: '0',
        txreceipt_status: '1',
        input: '0x',
        contractAddress: '',
        type: 'send',
        chain: config.name,
        chainId,
      },
      {
        hash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        to: address,
        value: '500000000000000000',
        valueInEth: '0.500000',
        timestamp: now - 7200,
        blockNumber: '12345670',
        gas: '21000',
        gasPrice: '45000000000',
        gasUsed: '21000',
        isError: '0',
        txreceipt_status: '1',
        input: '0x',
        contractAddress: '',
        type: 'receive',
        chain: config.name,
        chainId,
      },
    ];
  }
}
