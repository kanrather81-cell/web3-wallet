/**
 * 交易状态追踪 Hook
 * 支持多链交易状态查询和轮询
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ChainType } from '../wallet/transaction';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'unknown';

export interface TransactionStatusResult {
  status: TransactionStatus;
  confirmations?: number;
  blockNumber?: number;
  isLoading: boolean;
  error?: string;
  refresh: () => void;
  stopPolling: () => void;
}

interface UseTransactionStatusParams {
  txHash: string;
  chain: ChainType;
  pollingInterval?: number; // 轮询间隔（毫秒），默认 3000
  maxPollingAttempts?: number; // 最大轮询次数，默认 100
  autoStart?: boolean; // 是否自动开始轮询，默认 true
}

/**
 * 获取 EVM 链交易状态
 */
async function getEvmTransactionStatus(
  txHash: string,
  provider?: any
): Promise<{ status: TransactionStatus; confirmations?: number; blockNumber?: number }> {
  try {
    if (!provider || typeof provider.request !== 'function') {
      throw new Error('Provider 不可用');
    }

    // 获取交易回执
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    });

    if (!receipt) {
      // 交易还未被打包
      return { status: 'pending' };
    }

    // 获取当前区块高度
    const currentBlockHex = await provider.request({
      method: 'eth_blockNumber',
    });
    const currentBlock = parseInt(currentBlockHex, 16);
    const txBlock = parseInt(receipt.blockNumber, 16);
    const confirmations = currentBlock - txBlock + 1;

    // 检查交易状态
    const status = receipt.status === '0x1' ? 'success' : 'failed';

    return {
      status,
      confirmations,
      blockNumber: txBlock,
    };
  } catch (error) {
    console.error('获取 EVM 交易状态失败:', error);
    throw error;
  }
}

/**
 * 获取 Solana 交易状态
 */
async function getSolanaTransactionStatus(
  signature: string,
  connection?: any
): Promise<{ status: TransactionStatus; confirmations?: number }> {
  try {
    if (!connection || typeof connection.getSignatureStatuses !== 'function') {
      throw new Error('Connection 不可用');
    }

    // 获取签名状态
    const { value } = await connection.getSignatureStatuses([signature]);
    const signatureStatus = value[0];

    if (!signatureStatus) {
      // 交易还未被确认
      return { status: 'pending' };
    }

    // 检查是否有错误
    if (signatureStatus.err) {
      return { status: 'failed' };
    }

    // 获取确认数
    const confirmations = signatureStatus.confirmations || 0;

    // Solana 认为 31 个确认为最终确认
    const status = confirmations >= 31 ? 'success' : 'pending';

    return {
      status,
      confirmations,
    };
  } catch (error) {
    console.error('获取 Solana 交易状态失败:', error);
    throw error;
  }
}

/**
 * 获取 Bitcoin 交易状态
 */
async function getBitcoinTransactionStatus(
  txHash: string
): Promise<{ status: TransactionStatus; confirmations?: number; blockNumber?: number }> {
  try {
    // 使用 mempool.space API 查询交易状态
    const response = await fetch(`https://mempool.space/api/tx/${txHash}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { status: 'pending' };
      }
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();

    // 检查交易状态
    if (!data.status) {
      return { status: 'pending' };
    }

    const confirmations = data.status.confirmed ? data.status.block_height : 0;
    const blockNumber = data.status.block_height;

    // Bitcoin 通常认为 6 个确认为安全
    const status = confirmations >= 6 ? 'success' : 'pending';

    return {
      status,
      confirmations,
      blockNumber,
    };
  } catch (error) {
    console.error('获取 Bitcoin 交易状态失败:', error);
    throw error;
  }
}

/**
 * 获取 Tron 交易状态
 */
async function getTronTransactionStatus(
  txHash: string,
  tronWeb?: any
): Promise<{ status: TransactionStatus; confirmations?: number; blockNumber?: number }> {
  try {
    if (!tronWeb || typeof tronWeb.trx?.getTransactionInfo !== 'function') {
      throw new Error('TronWeb 不可用');
    }

    // 获取交易信息
    const txInfo = await tronWeb.trx.getTransactionInfo(txHash);

    if (!txInfo || Object.keys(txInfo).length === 0) {
      // 交易还未被确认
      return { status: 'pending' };
    }

    // 检查交易结果
    const status = txInfo.receipt?.result === 'SUCCESS' ? 'success' : 'failed';

    // 获取区块号
    const blockNumber = txInfo.blockNumber;

    // Tron 的确认数（当前区块 - 交易区块）
    const currentBlock = await tronWeb.trx.getCurrentBlock();
    const confirmations = currentBlock.block_header?.raw_data?.number
      ? currentBlock.block_header.raw_data.number - blockNumber
      : 0;

    return {
      status,
      confirmations,
      blockNumber,
    };
  } catch (error) {
    console.error('获取 Tron 交易状态失败:', error);
    throw error;
  }
}

/**
 * 统一的交易状态查询接口
 */
async function getTransactionStatus(
  txHash: string,
  chain: ChainType,
  context?: any
): Promise<{ status: TransactionStatus; confirmations?: number; blockNumber?: number }> {
  switch (chain) {
    case 'ethereum':
      return getEvmTransactionStatus(txHash, context?.provider);
    
    case 'solana':
      return getSolanaTransactionStatus(txHash, context?.connection);
    
    case 'bitcoin':
      return getBitcoinTransactionStatus(txHash);
    
    case 'tron':
      return getTronTransactionStatus(txHash, context?.tronWeb);
    
    default:
      throw new Error(`不支持的链类型: ${chain}`);
  }
}

/**
 * 交易状态追踪 Hook
 */
export function useTransactionStatus({
  txHash,
  chain,
  pollingInterval = 3000,
  maxPollingAttempts = 100,
  autoStart = true,
}: UseTransactionStatusParams): TransactionStatusResult {
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [confirmations, setConfirmations] = useState<number | undefined>();
  const [blockNumber, setBlockNumber] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(0);
  const isPollingRef = useRef(false);

  // 获取链上下文
  const getContext = useCallback(() => {
    // 使用安全读取函数，避免某些注入 getter 抛错
    const { getSafeWindowProp } = require('../utils/safeWindow');
    return {
      provider: getSafeWindowProp('ethereum'),
      connection: getSafeWindowProp('solana')?.connection,
      tronWeb: getSafeWindowProp('tronWeb'),
    };
  }, []);

  // 查询交易状态
  const fetchStatus = useCallback(async () => {
    if (!txHash || isPollingRef.current) return;

    setIsLoading(true);
    setError(undefined);
    isPollingRef.current = true;

    try {
      const context = getContext();
      const result = await getTransactionStatus(txHash, chain, context);
      
      setStatus(result.status);
      setConfirmations(result.confirmations);
      setBlockNumber(result.blockNumber);

      // 如果交易已完成（成功或失败），停止轮询
      if (result.status === 'success' || result.status === 'failed') {
        stopPolling();
      }
    } catch (err: any) {
      console.error('查询交易状态失败:', err);
      setError(err.message || '查询失败');
      
      // 达到最大尝试次数后停止轮询
      attemptsRef.current += 1;
      if (attemptsRef.current >= maxPollingAttempts) {
        setStatus('unknown');
        stopPolling();
      }
    } finally {
      setIsLoading(false);
      isPollingRef.current = false;
    }
  }, [txHash, chain, getContext, maxPollingAttempts]);

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // 开始轮询
  const startPolling = useCallback(() => {
    stopPolling();
    attemptsRef.current = 0;
    
    // 立即执行一次
    fetchStatus();
    
    // 设置定时轮询
    pollingRef.current = setInterval(() => {
      fetchStatus();
    }, pollingInterval);
  }, [fetchStatus, pollingInterval, stopPolling]);

  // 手动刷新
  const refresh = useCallback(() => {
    attemptsRef.current = 0;
    fetchStatus();
  }, [fetchStatus]);

  // 自动开始轮询
  useEffect(() => {
    if (autoStart && txHash) {
      startPolling();
    }

    // 清理函数
    return () => {
      stopPolling();
    };
  }, [autoStart, txHash, startPolling, stopPolling]);

  return {
    status,
    confirmations,
    blockNumber,
    isLoading,
    error,
    refresh,
    stopPolling,
  };
}

export default useTransactionStatus;
