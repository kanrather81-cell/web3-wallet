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
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
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

// 获取 Tron 余额（TRX）
export async function getTronBalance(address: string): Promise<number> {
  if (!isValidTronAddress(address)) {
    throw new Error('Invalid Tron address');
  }

  try {
    const response = await fetch(
      `${TRON_NETWORKS[CURRENT_TRON_NETWORK].fullHost}/v1/accounts/${address}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Tron balance');
    }
    
    const data = await response.json();
    
    // TronGrid API 返回的余额单位是 sun
    // 1 TRX = 1,000,000 sun
    const balanceInTRX = (data.data?.[0]?.balance || 0) / 1000000;
    
    return balanceInTRX;
  } catch (error) {
    console.error('Error fetching Tron balance:', error);
    throw error;
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
