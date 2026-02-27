/**
 * Gas 费用估算工具 - 多链支持
 * 提供 Gas 价格获取和优化建议
 */

import type { ChainType } from './transaction';

export type GasSpeed = 'slow' | 'standard' | 'fast';

export interface GasPrice {
  slow: string;      // 经济档位
  standard: string;  // 标准档位
  fast: string;      // 快速档位
}

export interface GasEstimate {
  gasPrice: GasPrice;
  estimatedTime: {
    slow: string;
    standard: string;
    fast: string;
  };
  gasLimit?: string;
  unit: string; // 单位：gwei, lamports, sat/vB, sun
}

/**
 * 获取 EVM 链的 Gas 价格
 */
export async function getEvmGasPrice(provider?: any): Promise<GasEstimate> {
  try {
    let baseGasPrice: bigint;

    if (provider && typeof provider.request === 'function') {
      // 使用钱包 provider
      const gasPriceHex = await provider.request({
        method: 'eth_gasPrice',
      });
      baseGasPrice = BigInt(gasPriceHex);
    } else {
      // 使用默认值（50 gwei）
      baseGasPrice = BigInt(50) * BigInt(10 ** 9);
    }

    // 转换为 gwei
    const baseGwei = Number(baseGasPrice) / 10 ** 9;

    // 计算三个档位（基于基础价格的倍数）
    const slow = (baseGwei * 0.8).toFixed(2);
    const standard = baseGwei.toFixed(2);
    const fast = (baseGwei * 1.2).toFixed(2);

    return {
      gasPrice: {
        slow,
        standard,
        fast,
      },
      estimatedTime: {
        slow: '~5 分钟',
        standard: '~2 分钟',
        fast: '~30 秒',
      },
      gasLimit: '21000', // 标准转账的 gas limit
      unit: 'gwei',
    };
  } catch (error) {
    console.error('获取 EVM Gas 价格失败:', error);
    // 返回默认值
    return {
      gasPrice: {
        slow: '30',
        standard: '50',
        fast: '70',
      },
      estimatedTime: {
        slow: '~5 分钟',
        standard: '~2 分钟',
        fast: '~30 秒',
      },
      gasLimit: '21000',
      unit: 'gwei',
    };
  }
}

/**
 * 获取 Solana 的费用
 */
export async function getSolanaGasPrice(connection?: any): Promise<GasEstimate> {
  try {
    let recentFee = 5000; // 默认 5000 lamports

    if (connection && typeof connection.getRecentBlockhash === 'function') {
      // 获取最近的费用
      const { feeCalculator } = await connection.getRecentBlockhash();
      if (feeCalculator && feeCalculator.lamportsPerSignature) {
        recentFee = feeCalculator.lamportsPerSignature;
      }
    }

    // Solana 的费用相对固定，三个档位差异不大
    const slow = recentFee.toString();
    const standard = recentFee.toString();
    const fast = (recentFee * 1.1).toFixed(0);

    return {
      gasPrice: {
        slow,
        standard,
        fast,
      },
      estimatedTime: {
        slow: '~1 秒',
        standard: '~0.5 秒',
        fast: '~0.4 秒',
      },
      unit: 'lamports',
    };
  } catch (error) {
    console.error('获取 Solana 费用失败:', error);
    return {
      gasPrice: {
        slow: '5000',
        standard: '5000',
        fast: '5500',
      },
      estimatedTime: {
        slow: '~1 秒',
        standard: '~0.5 秒',
        fast: '~0.4 秒',
      },
      unit: 'lamports',
    };
  }
}

/**
 * 获取 Bitcoin 的费率
 */
export async function getBitcoinGasPrice(): Promise<GasEstimate> {
  try {
    // 尝试从 mempool.space API 获取费率
    const response = await fetch('https://mempool.space/api/v1/fees/recommended');
    const data = await response.json();

    return {
      gasPrice: {
        slow: data.hourFee?.toString() || '10',
        standard: data.halfHourFee?.toString() || '20',
        fast: data.fastestFee?.toString() || '30',
      },
      estimatedTime: {
        slow: '~60 分钟',
        standard: '~30 分钟',
        fast: '~10 分钟',
      },
      unit: 'sat/vB',
    };
  } catch (error) {
    console.error('获取 Bitcoin 费率失败:', error);
    // 返回默认值
    return {
      gasPrice: {
        slow: '10',
        standard: '20',
        fast: '30',
      },
      estimatedTime: {
        slow: '~60 分钟',
        standard: '~30 分钟',
        fast: '~10 分钟',
      },
      unit: 'sat/vB',
    };
  }
}

/**
 * 获取 Tron 的能量/带宽价格
 */
export async function getTronGasPrice(): Promise<GasEstimate> {
  try {
    // Tron 的费用相对固定
    // 能量价格约 420 sun/energy
    // 带宽价格约 1000 sun/bandwidth
    
    const baseFee = 1000000; // 1 TRX = 1,000,000 sun

    return {
      gasPrice: {
        slow: (baseFee * 0.001).toFixed(0),   // ~0.001 TRX
        standard: (baseFee * 0.002).toFixed(0), // ~0.002 TRX
        fast: (baseFee * 0.003).toFixed(0),    // ~0.003 TRX
      },
      estimatedTime: {
        slow: '~5 秒',
        standard: '~3 秒',
        fast: '~3 秒',
      },
      unit: 'sun',
    };
  } catch (error) {
    console.error('获取 Tron 费用失败:', error);
    return {
      gasPrice: {
        slow: '1000',
        standard: '2000',
        fast: '3000',
      },
      estimatedTime: {
        slow: '~5 秒',
        standard: '~3 秒',
        fast: '~3 秒',
      },
      unit: 'sun',
    };
  }
}

/**
 * 统一的 Gas 价格获取接口
 */
export async function getGasPrice(
  chain: ChainType,
  context?: any
): Promise<GasEstimate> {
  switch (chain) {
    case 'ethereum':
      return getEvmGasPrice(context?.provider);
    
    case 'solana':
      return getSolanaGasPrice(context?.connection);
    
    case 'bitcoin':
      return getBitcoinGasPrice();
    
    case 'tron':
      return getTronGasPrice();
    
    default:
      throw new Error(`不支持的链类型: ${chain}`);
  }
}

/**
 * 计算总 Gas 费用
 */
export function calculateTotalGasFee(
  gasPrice: string,
  gasLimit: string,
  decimals: number = 18
): string {
  try {
    const price = parseFloat(gasPrice);
    const limit = parseFloat(gasLimit);
    const total = (price * limit) / Math.pow(10, decimals);
    return total.toFixed(6);
  } catch (error) {
    console.error('计算 Gas 费用失败:', error);
    return '0';
  }
}

/**
 * 格式化 Gas 价格显示
 */
export function formatGasPrice(price: string, unit: string): string {
  const value = parseFloat(price);
  if (isNaN(value)) return `0 ${unit}`;
  
  // 根据单位格式化
  switch (unit) {
    case 'gwei':
      return `${value.toFixed(2)} Gwei`;
    case 'lamports':
      return `${value.toFixed(0)} Lamports`;
    case 'sat/vB':
      return `${value.toFixed(0)} sat/vB`;
    case 'sun':
      return `${value.toFixed(0)} Sun`;
    default:
      return `${value} ${unit}`;
  }
}

/**
 * 验证自定义 Gas 价格
 */
export function validateGasPrice(
  price: string,
  estimate: GasEstimate
): { valid: boolean; error?: string } {
  const value = parseFloat(price);
  
  if (isNaN(value) || value <= 0) {
    return { valid: false, error: 'Gas 价格必须大于 0' };
  }

  const slowPrice = parseFloat(estimate.gasPrice.slow);
  const fastPrice = parseFloat(estimate.gasPrice.fast);

  // 警告：价格过低可能导致交易长时间未确认
  if (value < slowPrice * 0.5) {
    return { valid: false, error: 'Gas 价格过低，交易可能无法被打包' };
  }

  // 警告：价格过高
  if (value > fastPrice * 2) {
    return { valid: false, error: 'Gas 价格过高，建议降低以节省费用' };
  }

  return { valid: true };
}

/**
 * 获取推荐的 Gas limit（EVM 链）
 */
export function getRecommendedGasLimit(isTokenTransfer: boolean): string {
  return isTokenTransfer ? '65000' : '21000';
}
