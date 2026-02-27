/**
 * 交易历史存储工具 - 多链支持
 * 使用 localStorage 保存交易记录
 */

import type { ChainType } from './transaction';

export interface TransactionRecord {
  id: string; // 唯一标识
  hash: string; // 交易哈希
  chain: ChainType; // 链类型
  chainName: string; // 链名称
  from: string; // 发送地址
  to: string; // 接收地址
  amount: string; // 金额
  token: string; // 代币符号
  tokenAddress?: string; // 代币合约地址
  status: 'pending' | 'success' | 'failed'; // 交易状态
  timestamp: number; // 时间戳
  gasFee?: string; // Gas 费用
  feeToken?: string; // 手续费代币
  blockNumber?: number; // 区块号
  confirmations?: number; // 确认数
  error?: string; // 错误信息
}

export type TransactionStatus = 'pending' | 'success' | 'failed';
export type TransactionFilter = {
  chain?: ChainType;
  status?: TransactionStatus;
  address?: string;
};

const STORAGE_KEY = 'multichain_wallet_transactions';
const MAX_RECORDS = 1000; // 最多保存 1000 条记录

/**
 * 交易历史管理类
 */
export class TransactionHistoryManager {
  /**
   * 添加交易记录
   */
  static addTransaction(record: Omit<TransactionRecord, 'id' | 'timestamp'>): TransactionRecord {
    const transactions = this.getAllTransactions();
    
    const newRecord: TransactionRecord = {
      ...record,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    transactions.unshift(newRecord);

    // 限制记录数量
    if (transactions.length > MAX_RECORDS) {
      transactions.splice(MAX_RECORDS);
    }

    this.saveTransactions(transactions);
    return newRecord;
  }

  /**
   * 更新交易状态
   */
  static updateTransaction(
    hash: string,
    updates: Partial<Pick<TransactionRecord, 'status' | 'blockNumber' | 'confirmations' | 'error'>>
  ): boolean {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex(tx => tx.hash === hash);

    if (index === -1) return false;

    transactions[index] = {
      ...transactions[index],
      ...updates,
    };

    this.saveTransactions(transactions);
    return true;
  }

  /**
   * 获取所有交易记录
   */
  static getAllTransactions(): TransactionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('读取交易历史失败:', error);
      return [];
    }
  }

  /**
   * 获取筛选后的交易记录
   */
  static getTransactions(filter?: TransactionFilter): TransactionRecord[] {
    let transactions = this.getAllTransactions();

    if (filter) {
      if (filter.chain) {
        transactions = transactions.filter(tx => tx.chain === filter.chain);
      }
      if (filter.status) {
        transactions = transactions.filter(tx => tx.status === filter.status);
      }
      if (filter.address) {
        const addr = filter.address.toLowerCase();
        transactions = transactions.filter(
          tx => tx.from.toLowerCase() === addr || tx.to.toLowerCase() === addr
        );
      }
    }

    // 按时间倒序排列
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 根据哈希获取交易
   */
  static getTransactionByHash(hash: string): TransactionRecord | null {
    const transactions = this.getAllTransactions();
    return transactions.find(tx => tx.hash === hash) || null;
  }

  /**
   * 删除交易记录
   */
  static deleteTransaction(hash: string): boolean {
    const transactions = this.getAllTransactions();
    const filtered = transactions.filter(tx => tx.hash !== hash);

    if (filtered.length === transactions.length) return false;

    this.saveTransactions(filtered);
    return true;
  }

  /**
   * 清除所有交易记录
   */
  static clearAllTransactions(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * 清除指定链的交易记录
   */
  static clearChainTransactions(chain: ChainType): void {
    const transactions = this.getAllTransactions();
    const filtered = transactions.filter(tx => tx.chain !== chain);
    this.saveTransactions(filtered);
  }

  /**
   * 清除指定地址的交易记录
   */
  static clearAddressTransactions(address: string): void {
    const transactions = this.getAllTransactions();
    const addr = address.toLowerCase();
    const filtered = transactions.filter(
      tx => tx.from.toLowerCase() !== addr && tx.to.toLowerCase() !== addr
    );
    this.saveTransactions(filtered);
  }

  /**
   * 获取统计信息
   */
  static getStatistics(address?: string): {
    total: number;
    pending: number;
    success: number;
    failed: number;
    byChain: Record<ChainType, number>;
  } {
    const transactions = address
      ? this.getTransactions({ address })
      : this.getAllTransactions();

    const stats = {
      total: transactions.length,
      pending: 0,
      success: 0,
      failed: 0,
      byChain: {} as Record<ChainType, number>,
    };

    transactions.forEach(tx => {
      // 统计状态
      if (tx.status === 'pending') stats.pending++;
      else if (tx.status === 'success') stats.success++;
      else if (tx.status === 'failed') stats.failed++;

      // 统计链
      if (!stats.byChain[tx.chain]) {
        stats.byChain[tx.chain] = 0;
      }
      stats.byChain[tx.chain]++;
    });

    return stats;
  }

  /**
   * 导出交易记录（JSON 格式）
   */
  static exportTransactions(): string {
    const transactions = this.getAllTransactions();
    return JSON.stringify(transactions, null, 2);
  }

  /**
   * 导入交易记录
   */
  static importTransactions(jsonData: string): boolean {
    try {
      const transactions = JSON.parse(jsonData) as TransactionRecord[];
      
      // 验证数据格式
      if (!Array.isArray(transactions)) {
        throw new Error('Invalid data format');
      }

      // 合并现有记录（去重）
      const existing = this.getAllTransactions();
      const existingHashes = new Set(existing.map(tx => tx.hash));
      
      const newTransactions = transactions.filter(tx => !existingHashes.has(tx.hash));
      const merged = [...existing, ...newTransactions];

      // 按时间排序并限制数量
      merged.sort((a, b) => b.timestamp - a.timestamp);
      if (merged.length > MAX_RECORDS) {
        merged.splice(MAX_RECORDS);
      }

      this.saveTransactions(merged);
      return true;
    } catch (error) {
      console.error('导入交易记录失败:', error);
      return false;
    }
  }

  /**
   * 保存交易记录到 localStorage
   */
  private static saveTransactions(transactions: TransactionRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('保存交易历史失败:', error);
    }
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 获取区块浏览器 URL
 */
export function getExplorerUrl(chain: ChainType, hash: string): string {
  const explorers: Record<ChainType, string> = {
    ethereum: 'https://etherscan.io/tx',
    solana: 'https://explorer.solana.com/tx',
    bitcoin: 'https://blockstream.info/tx',
    tron: 'https://tronscan.org/#/transaction',
  };

  const baseUrl = explorers[chain];
  if (!baseUrl) return '#';

  return `${baseUrl}/${hash}`;
}

/**
 * 格式化时间显示
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
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
}

/**
 * 格式化地址显示
 */
export function formatAddress(address: string, length: number = 8): string {
  if (!address || address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}
