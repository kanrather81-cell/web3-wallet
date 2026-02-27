/**
 * 交易历史 Hook
 * 管理本地交易历史记录
 */

import { useState, useEffect, useCallback } from 'react';
import { TransactionHistoryManager } from '../wallet/history';
import type { TransactionRecord, TransactionFilter } from '../wallet/history';

export function useTransactionHistory(filter?: TransactionFilter) {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载交易记录
  const loadTransactions = useCallback(() => {
    setIsLoading(true);
    try {
      const records = TransactionHistoryManager.getTransactions(filter);
      setTransactions(records);
    } catch (error) {
      console.error('加载交易历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // 初始加载
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // 添加交易
  const addTransaction = useCallback((record: Omit<TransactionRecord, 'id' | 'timestamp'>) => {
    const newRecord = TransactionHistoryManager.addTransaction(record);
    loadTransactions();
    return newRecord;
  }, [loadTransactions]);

  // 更新交易状态
  const updateTransaction = useCallback((
    hash: string,
    updates: Partial<Pick<TransactionRecord, 'status' | 'blockNumber' | 'confirmations' | 'error'>>
  ) => {
    const success = TransactionHistoryManager.updateTransaction(hash, updates);
    if (success) {
      loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  // 删除交易
  const deleteTransaction = useCallback((hash: string) => {
    const success = TransactionHistoryManager.deleteTransaction(hash);
    if (success) {
      loadTransactions();
    }
    return success;
  }, [loadTransactions]);

  // 清除所有交易
  const clearAll = useCallback(() => {
    TransactionHistoryManager.clearAllTransactions();
    loadTransactions();
  }, [loadTransactions]);

  // 刷新
  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll,
    refresh,
  };
}
