import { Connection, PublicKey } from '@solana/web3.js';

// Solana RPC配置
export const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
export const SOLANA_TESTNET_RPC = 'https://api.testnet.solana.com';

// 创建连接实例
export const solanaConnection = new Connection(SOLANA_RPC);

// 获取SOL余额
export async function getSolanaBalance(address: string): Promise<number> {
  try {
    const pubKey = new PublicKey(address);
    const balance = await solanaConnection.getBalance(pubKey);
    return balance / 1e9; // lamports → SOL
  } catch (error) {
    console.error('获取Solana余额失败:', error);
    return 0;
  }
}

// 验证Solana地址
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}
