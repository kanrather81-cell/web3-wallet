// Tron 网络配置接口
export interface TronNetworkConfig {
  fullHost: string;
  solidityNode: string;
  eventServer: string;
  chainId: string;
}

// Tron 网络配置
export const TRON_NETWORKS: Record<string, TronNetworkConfig> = {
  mainnet: {
    fullHost: '/trongrid',
    solidityNode: '/trongrid',
    eventServer: '/trongrid',
    chainId: '0x2b6653dc',
  },
  shasta: {
    fullHost: 'https://api.shasta.trongrid.io',
    solidityNode: 'https://api.shasta.trongrid.io',
    eventServer: 'https://api.shasta.trongrid.io',
    chainId: '0x94a9059e',
  },
  nile: {
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
    chainId: '0xcd8690dc',
  },
};

// 当前使用的网络
export const CURRENT_TRON_NETWORK = 'mainnet';

// Tron 网络配置
export const TRON_CONFIG = {
  name: 'Tron',
  symbol: 'TRX',
  decimals: 6,
  chainId: TRON_NETWORKS[CURRENT_TRON_NETWORK].chainId,
  fullHost: TRON_NETWORKS[CURRENT_TRON_NETWORK].fullHost,
  explorer: 'https://tronscan.org',
};

// 备用 RPC 端点列表（使用本地代理）
const TRON_RPC_ENDPOINTS = [
  '/trongrid',
  'https://api.tronstack.io',
  'https://trx.getblock.io/mainnet',
];

// 缓存配置
const BALANCE_CACHE_KEY = 'tron_balance_cache';
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

// 带重试的 fetch 函数
async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      // 如果成功或者是客户端错误（4xx），直接返回
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // 服务器错误（5xx）或其他错误，继续重试
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error');
    }
    
    // 指数退避
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}

// 尝试多个 RPC 端点
async function fetchFromMultipleEndpoints(
  address: string
): Promise<number> {
  let lastError: Error | null = null;
  
  for (const endpoint of TRON_RPC_ENDPOINTS) {
    try {
      const response = await fetchWithRetry(
        `${endpoint}/v1/accounts/${address}`,
        undefined,
        2 // 每个端点重试2次
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          // 速率限制，尝试下一个端点
          console.warn(`Rate limited on ${endpoint}, trying next endpoint`);
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const balanceInTRX = (data.data?.[0]?.balance || 0) / 1000000;
      
      return balanceInTRX;
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue;
    }
  }
  
  throw lastError || new Error('All RPC endpoints failed');
}

// 获取 Tron 余额（TRX）
export async function getTronBalance(address: string): Promise<number> {
  if (!isValidTronAddress(address)) {
    throw new Error('Invalid Tron address');
  }

  // 先检查缓存
  const cachedBalance = getCachedBalance(address);
  if (cachedBalance !== null) {
    return cachedBalance;
  }

  try {
    const balance = await fetchFromMultipleEndpoints(address);
    
    // 缓存结果
    setCachedBalance(address, balance);
    
    return balance;
  } catch (error) {
    console.error('Error fetching Tron balance:', error);
    
    // 如果所有端点都失败，返回0而不是抛出错误
    // 这样可以避免阻塞整个应用
    return 0;
  }
}

// 获取 TRC20 代币余额
export async function getTrc20Balance(
  address: string,
  contractAddress: string
): Promise<number> {
  if (!isValidTronAddress(address)) {
    throw new Error('Invalid Tron address');
  }

  try {
    const response = await fetch(
      `${TRON_NETWORKS[CURRENT_TRON_NETWORK].fullHost}/v1/accounts/${address}/transactions/trc20?contract_address=${contractAddress}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch TRC20 balance');
    }
    
    const data = await response.json();
    
    // 这里需要根据实际 API 响应调整
    const balance = data.data?.[0]?.value || 0;
    
    return balance;
  } catch (error) {
    console.error('Error fetching TRC20 balance:', error);
    throw error;
  }
}

// 验证 Tron 地址
export function isValidTronAddress(address: string): boolean {
  // Tron 地址以 T 开头，长度为 34
  return /^T[A-Za-z1-9]{33}$/.test(address);
}

// 获取账户资源（带宽和能量）
export async function getAccountResources(address: string): Promise<{
  bandwidth: number;
  energy: number;
}> {
  if (!isValidTronAddress(address)) {
    throw new Error('Invalid Tron address');
  }

  try {
    const response = await fetch(
      `${TRON_NETWORKS[CURRENT_TRON_NETWORK].fullHost}/wallet/getaccountresource`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          visible: true,
        }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch account resources');
    }
    
    const data = await response.json();
    
    return {
      bandwidth: data.freeNetLimit || 0,
      energy: data.EnergyLimit || 0,
    };
  } catch (error) {
    console.error('Error fetching account resources:', error);
    return {
      bandwidth: 0,
      energy: 0,
    };
  }
}

// 将 Hex 地址转换为 Base58 地址
export function hexToBase58(hexAddress: string): string {
  // 简化实现，实际应用中需要使用 TronWeb
  return hexAddress;
}

// 将 Base58 地址转换为 Hex 地址
export function base58ToHex(base58Address: string): string {
  // 简化实现，实际应用中需要使用 TronWeb
  return base58Address;
}
