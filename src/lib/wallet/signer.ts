/**
 * 交易签名工具 - 基于 OKX SDK
 * 支持 EVM、Solana、Bitcoin、Tron 链的交易签名
 */

import type { ChainType } from './transaction';

export interface SignTransactionParams {
  chain: ChainType;
  transaction: any;
  privateKey?: string; // 可选：用于离线签名
}

export interface SignTransactionResult {
  signedTransaction: any;
  signature?: string;
  rawTransaction?: string;
}

/**
 * 签名 EVM 链交易
 */
export async function signEvmTransaction(
  transaction: any,
  wallet: any // EVM 钱包实例（MetaMask 等）
): Promise<SignTransactionResult> {
  try {
    // 使用钱包签名交易
    const signedTx = await wallet.request({
      method: 'eth_signTransaction',
      params: [transaction],
    });

    return {
      signedTransaction: signedTx,
      rawTransaction: signedTx,
    };
  } catch (error) {
    console.error('EVM 交易签名失败:', error);
    throw error;
  }
}

/**
 * 签名 Solana 交易
 */
export async function signSolanaTransaction(
  transaction: any,
  wallet: any // Solana 钱包实例
): Promise<SignTransactionResult> {
  try {
    // Solana 钱包会自动签名交易
    const signedTx = await wallet.signTransaction(transaction);

    return {
      signedTransaction: signedTx,
      signature: signedTx.signature?.toString('base64'),
    };
  } catch (error) {
    console.error('Solana 交易签名失败:', error);
    throw error;
  }
}

/**
 * 签名 Bitcoin 交易
 */
export async function signBitcoinTransaction(
  transaction: any,
  wallet: any // Bitcoin 钱包实例（Unisat 等）
): Promise<SignTransactionResult> {
  try {
    // Bitcoin 钱包通过扩展签名
    const signedTx = await wallet.signPsbt(transaction);

    return {
      signedTransaction: signedTx,
      rawTransaction: signedTx,
    };
  } catch (error) {
    console.error('Bitcoin 交易签名失败:', error);
    throw error;
  }
}

/**
 * 签名 Tron 交易
 */
export async function signTronTransaction(
  transaction: any,
  tronWeb: any // TronWeb 实例
): Promise<SignTransactionResult> {
  try {
    // 使用 TronWeb 签名交易
    const signedTx = await tronWeb.trx.sign(transaction);

    return {
      signedTransaction: signedTx,
      rawTransaction: JSON.stringify(signedTx),
    };
  } catch (error) {
    console.error('Tron 交易签名失败:', error);
    throw error;
  }
}

/**
 * 广播 EVM 链交易
 */
export async function broadcastEvmTransaction(
  signedTransaction: any,
  provider: any
): Promise<string> {
  try {
    const txHash = await provider.request({
      method: 'eth_sendRawTransaction',
      params: [signedTransaction],
    });

    return txHash;
  } catch (error) {
    console.error('EVM 交易广播失败:', error);
    throw error;
  }
}

/**
 * 广播 Solana 交易
 */
export async function broadcastSolanaTransaction(
  signedTransaction: any,
  connection: any
): Promise<string> {
  try {
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    // 等待确认
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  } catch (error) {
    console.error('Solana 交易广播失败:', error);
    throw error;
  }
}

/**
 * 广播 Bitcoin 交易
 */
export async function broadcastBitcoinTransaction(
  signedTransaction: any,
  wallet: any
): Promise<string> {
  try {
    const txid = await wallet.pushPsbt(signedTransaction);
    return txid;
  } catch (error) {
    console.error('Bitcoin 交易广播失败:', error);
    throw error;
  }
}

/**
 * 广播 Tron 交易
 */
export async function broadcastTronTransaction(
  signedTransaction: any,
  tronWeb: any
): Promise<string> {
  try {
    const result = await tronWeb.trx.sendRawTransaction(signedTransaction);
    
    if (!result.result) {
      throw new Error(result.message || '交易广播失败');
    }

    return result.txid;
  } catch (error) {
    console.error('Tron 交易广播失败:', error);
    throw error;
  }
}

/**
 * 统一的签名接口
 */
export async function signTransaction(
  params: SignTransactionParams,
  context: any // 钱包或连接实例
): Promise<SignTransactionResult> {
  switch (params.chain) {
    case 'ethereum':
      return signEvmTransaction(params.transaction, context);
    
    case 'solana':
      return signSolanaTransaction(params.transaction, context);
    
    case 'bitcoin':
      return signBitcoinTransaction(params.transaction, context);
    
    case 'tron':
      return signTronTransaction(params.transaction, context);
    
    default:
      throw new Error(`不支持的链类型: ${params.chain}`);
  }
}

/**
 * 统一的广播接口
 */
export async function broadcastTransaction(
  chain: ChainType,
  signedTransaction: any,
  context: any
): Promise<string> {
  switch (chain) {
    case 'ethereum':
      return broadcastEvmTransaction(signedTransaction, context);
    
    case 'solana':
      return broadcastSolanaTransaction(signedTransaction, context);
    
    case 'bitcoin':
      return broadcastBitcoinTransaction(signedTransaction, context);
    
    case 'tron':
      return broadcastTronTransaction(signedTransaction, context);
    
    default:
      throw new Error(`不支持的链类型: ${chain}`);
  }
}
