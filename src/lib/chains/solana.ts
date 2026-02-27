import { Connection, PublicKey } from '@solana/web3.js';

// Solana RPC 端点列表（备用）
const SOLANA_RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
  'https://solana-mainnet.rpc.extrnode.com',
];

// Solana RPC配置
export const SOLANA_RPC = SOLANA_RPC_ENDPOINTS[0];
export const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';
export const SOLANA_TESTNET_RPC = 'https://api.testnet.solana.com';

// 缓存配置
const BALANCE_CACHE_KEY = 'solana_balance_cache';
const CACHE_DURATION = 30000; // 30秒

interface BalanceCache {
  [address: string]: {
    balance: number;
    timestamp: number;
  };
}

// 获取缓存的余额
function getCachedBalance(address: string): number | null {
  try {
    const cache = localStorage.getItem(BALANCE_CACHE_KEY);
    if (!cache) return null;
    
    const balanceCache: BalanceCache = JSON.parse(cache);
    const cached = balanceCache[address];
    
    if (!cached) return null;
    
    // 检查缓存是否过期
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      return null;
    }
    
    return cached.balance;
  } catch {
    return null;
  }
}

// 设置缓存的余额
function setCachedBalance(address: string, balance: number): void {
  try {
    const cache = localStorage.getItem(BALANCE_CACHE_KEY);
    const balanceCache: BalanceCache = cache ? JSON.parse(cache) : {};
    
    balanceCache[address] = {
      balance,
      timestamp: Date.now(),
    };
    
    localStorage.setItem(BALANCE_CACHE_KEY, JSON.stringify(balanceCache));
  } catch (error) {
    console.error('Failed to cache balance:', error);
  }
}

// 尝试多个 RPC 端点获取余额
async function fetchBalanceFromMultipleEndpoints(address: string): Promise<number> {
  let lastError: Error | null = null;
  
  for (const endpoint of SOLANA_RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 10000, // 10秒超时
      });
      
      const pubKey = new PublicKey(address);
      const balance = await connection.getBalance(pubKey);
      
      return balance / 1e9; // lamports → SOL
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue;
    }
  }
  
  throw lastError || new Error('All RPC endpoints failed');
}

// 创建连接实例（使用第一个端点）
export const solanaConnection = new Connection(SOLANA_RPC, {
  commitment: 'confirmed',
});

// 获取SOL余额（带缓存和重试）
export async function getSolanaBalance(address: string): Promise<number> {
  try {
    // 先检查缓存
    const cachedBalance = getCachedBalance(address);
    if (cachedBalance !== null) {
      return cachedBalance;
    }

    // 尝试从多个端点获取余额
    const balance = await fetchBalanceFromMultipleEndpoints(address);
    
    // 缓存结果
    setCachedBalance(address, balance);
    
    return balance;
  } catch (error) {
    console.error('获取Solana余额失败:', error);
    
    // 如果所有端点都失败，返回0而不是抛出错误
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
