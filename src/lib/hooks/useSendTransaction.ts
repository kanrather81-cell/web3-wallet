/**
 * 交易发送 Hook
 * 支持多链交易发送功能
 */

import { useState, useCallback } from 'react';
import { getSafeWindowProp } from '../utils/safeWindow';
import { useAccount, useSendTransaction as useWagmiSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useConnection, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { 
  Transaction, 
  SystemProgram, 
  PublicKey,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { buildTransaction } from '../wallet/transaction';
import type { ChainType, TransactionParams } from '../wallet/transaction';

export interface SendTransactionParams {
  chain: ChainType;
  to: string;
  amount: string;
  tokenAddress?: string;
  decimals?: number;
}

export interface SendTransactionResult {
  hash?: string;
  signature?: string;
  error?: string;
}

export function useSendTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // EVM 钱包
  const { address: evmAddress } = useAccount();
  const { sendTransactionAsync: sendEvmTransaction } = useWagmiSendTransaction();

  // Solana 钱包
  const { connection } = useConnection();
  const { publicKey: solanaPublicKey, sendTransaction: sendSolanaTransaction } = useSolanaWallet();

  /**
   * 发送 EVM 链交易
   */
  const sendEvm = useCallback(async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    if (!evmAddress) {
      throw new Error('请先连接 EVM 钱包');
    }

    try {
      const txParams: TransactionParams = {
        from: evmAddress,
        to: params.to,
        amount: params.amount,
        tokenAddress: params.tokenAddress,
        decimals: params.decimals,
      };

      // 如果是原生币转账，使用 wagmi 的 sendTransaction
      if (!params.tokenAddress) {
        const hash = await sendEvmTransaction({
          to: params.to as `0x${string}`,
          value: parseEther(params.amount),
        });
        
        return { hash };
      }

      // 代币转账需要构建交易
      const { transaction } = await buildTransaction('ethereum', txParams);
      const hash = await sendEvmTransaction({
        to: transaction.to as `0x${string}`,
        data: transaction.data as `0x${string}`,
        value: BigInt(0),
      });

      return { hash };
    } catch (err: any) {
      console.error('EVM 交易发送失败:', err);
      throw new Error(err.message || '交易发送失败');
    }
  }, [evmAddress, sendEvmTransaction]);

  /**
   * 发送 Solana 交易
   */
  const sendSolana = useCallback(async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    if (!solanaPublicKey) {
      throw new Error('请先连接 Solana 钱包');
    }

    try {
      // 获取最新的 blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // 创建转账交易
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solanaPublicKey,
          toPubkey: new PublicKey(params.to),
          lamports: Math.floor(parseFloat(params.amount) * LAMPORTS_PER_SOL),
        })
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = solanaPublicKey;

      // 发送交易
      const signature = await sendSolanaTransaction(transaction, connection);
      
      // 等待确认
      await connection.confirmTransaction(signature, 'confirmed');

      return { signature };
    } catch (err: any) {
      console.error('Solana 交易发送失败:', err);
      throw new Error(err.message || '交易发送失败');
    }
  }, [solanaPublicKey, connection, sendSolanaTransaction]);

  /**
   * 发送 Bitcoin 交易
   */
  const sendBitcoin = useCallback(async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    try {
      // Bitcoin 交易需要通过钱包扩展发送
      const unisat = getSafeWindowProp('unisat');
      if (!unisat) {
        throw new Error('请先安装 Unisat 钱包');
      }

      const txid = await unisat.sendBitcoin(
        params.to,
        Math.floor(parseFloat(params.amount) * 100000000) // 转换为 satoshi
      );

      return { hash: txid };
    } catch (err: any) {
      console.error('Bitcoin 交易发送失败:', err);
      throw new Error(err.message || '交易发送失败');
    }
  }, []);

  /**
   * 发送 Tron 交易
   */
  const sendTron = useCallback(async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    try {
      // Tron 交易需要通过 TronLink 发送
      const tronWeb = getSafeWindowProp('tronWeb');
      if (!tronWeb) {
        throw new Error('请先安装 TronLink 钱包');
      }
      
      // 发送 TRX
      const transaction = await tronWeb.transactionBuilder.sendTrx(
        params.to,
        Math.floor(parseFloat(params.amount) * 1000000), // 转换为 sun
        tronWeb.defaultAddress.base58
      );

      const signedTx = await tronWeb.trx.sign(transaction);
      const result = await tronWeb.trx.sendRawTransaction(signedTx);

      return { hash: result.txid };
    } catch (err: any) {
      console.error('Tron 交易发送失败:', err);
      throw new Error(err.message || '交易发送失败');
    }
  }, []);

  /**
   * 统一的发送交易接口
   */
  const send = useCallback(async (params: SendTransactionParams): Promise<SendTransactionResult> => {
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
      let result: SendTransactionResult;

      switch (params.chain) {
        case 'ethereum':
          result = await sendEvm(params);
          break;
        
        case 'solana':
          result = await sendSolana(params);
          break;
        
        case 'bitcoin':
          result = await sendBitcoin(params);
          break;
        
        case 'tron':
          result = await sendTron(params);
          break;
        
        default:
          throw new Error(`不支持的链类型: ${params.chain}`);
      }

      const hash = result.hash || result.signature;
      if (hash) {
        setTxHash(hash);
      }

      return result;
    } catch (err: any) {
      const errorMsg = err.message || '交易发送失败';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sendEvm, sendSolana, sendBitcoin, sendTron]);

  return {
    send,
    loading,
    error,
    txHash,
    reset: () => {
      setError(null);
      setTxHash(null);
    },
  };
}
