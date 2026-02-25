// Bitcoin网络配置
export const BITCOIN_CONFIG = {
  mainnet: {
    network: 'mainnet',
    blockstreamApi: 'https://blockstream.info/api',
    mempoolApi: 'https://mempool.space/api',
  },
  testnet: {
    network: 'testnet',
    blockstreamApi: 'https://blockstream.info/testnet/api',
    mempoolApi: 'https://mempool.space/testnet/api',
  },
};

// 当前使用的网络（默认主网）
const CURRENT_NETWORK = BITCOIN_CONFIG.mainnet;

// 获取BTC余额（使用Blockstream API）
export async function getBitcoinBalance(address: string): Promise<number> {
  try {
    const response = await fetch(
      `${CURRENT_NETWORK.blockstreamApi}/address/${address}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Bitcoin balance');
    }

    const data = await response.json();

    // 计算余额 = 已确认收入 - 已支出
    const funded = data.chain_stats.funded_txo_sum || 0;
    const spent = data.chain_stats.spent_txo_sum || 0;
    const balance = funded - spent;

    // 返回BTC余额（satoshi → BTC）
    return balance / 100000000;
  } catch (error) {
    console.error('获取Bitcoin余额失败:', error);
    return 0;
  }
}

// 通过Blockstream API获取余额（备选方案）
export async function getBitcoinBalanceFromBlockstream(
  address: string
): Promise<number> {
  try {
    const response = await fetch(
      `${CURRENT_NETWORK.blockstreamApi}/address/${address}`
    );
    const data = await response.json();

    // 计算余额 = 已确认收入 - 已支出
    const funded = data.chain_stats.funded_txo_sum || 0;
    const spent = data.chain_stats.spent_txo_sum || 0;
    const balance = funded - spent;

    // 返回BTC余额（satoshi → BTC）
    return balance / 100000000;
  } catch (error) {
    console.error('通过Blockstream获取Bitcoin余额失败:', error);
    return 0;
  }
}

// 验证Bitcoin地址格式（简单验证）
export function isValidBitcoinAddress(address: string): boolean {
  // BTC地址基本规则：
  // 1. 以1、3或bc1开头
  // 2. 长度在26-62之间
  const regex = /^(1|3|bc1)[a-zA-Z0-9]{25,60}$/;
  return regex.test(address);
}

// 获取地址的交易历史（可选）
export async function getBitcoinTransactions(address: string) {
  try {
    const response = await fetch(
      `${CURRENT_NETWORK.blockstreamApi}/address/${address}/txs`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取Bitcoin交易历史失败:', error);
    return [];
  }
}
