/**
 * OKX SDK 测试文件
 * 用于验证 OKX SDK 是否正确安装和可用
 */

import { EthWallet } from '@okxweb3/coin-ethereum';
import { SolWallet } from '@okxweb3/coin-solana';
import { BtcWallet } from '@okxweb3/coin-bitcoin';
import { TrxWallet } from '@okxweb3/coin-tron';

// 测试 Ethereum 钱包
export function testEthWallet() {
  try {
    const wallet = new EthWallet();
    console.log('✅ EthWallet 初始化成功:', wallet);
    return true;
  } catch (error) {
    console.error('❌ EthWallet 初始化失败:', error);
    return false;
  }
}

// 测试 Solana 钱包
export function testSolWallet() {
  try {
    const wallet = new SolWallet();
    console.log('✅ SolWallet 初始化成功:', wallet);
    return true;
  } catch (error) {
    console.error('❌ SolWallet 初始化失败:', error);
    return false;
  }
}

// 测试 Bitcoin 钱包
export function testBtcWallet() {
  try {
    const wallet = new BtcWallet();
    console.log('✅ BtcWallet 初始化成功:', wallet);
    return true;
  } catch (error) {
    console.error('❌ BtcWallet 初始化失败:', error);
    return false;
  }
}

// 测试 Tron 钱包
export function testTronWallet() {
  try {
    const wallet = new TrxWallet();
    console.log('✅ TrxWallet 初始化成功:', wallet);
    return true;
  } catch (error) {
    console.error('❌ TrxWallet 初始化失败:', error);
    return false;
  }
}

// 运行所有测试
export function runAllTests() {
  console.log('🧪 开始测试 OKX SDK...\n');
  
  const results = {
    eth: testEthWallet(),
    sol: testSolWallet(),
    btc: testBtcWallet(),
    tron: testTronWallet(),
  };
  
  console.log('\n📊 测试结果汇总:');
  console.log('Ethereum:', results.eth ? '✅' : '❌');
  console.log('Solana:', results.sol ? '✅' : '❌');
  console.log('Bitcoin:', results.btc ? '✅' : '❌');
  console.log('Tron:', results.tron ? '✅' : '❌');
  
  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '✅ 所有测试通过！' : '❌ 部分测试失败'));
  
  return allPassed;
}
