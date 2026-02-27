/**
 * 钱包管理器 - 基于 OKX SDK
 * 支持助记词生成、地址派生、加密存储
 * 
 * ⚠️ 安全警告：此实现仅用于测试目的，不适合生产环境
 */

import * as bip39 from 'bip39';
import { encrypt, decrypt } from './encryption';
import type { EncryptedData } from './encryption';

/**
 * 钱包数据结构
 */
export interface WalletData {
  name: string; // 钱包名称
  addresses: {
    ethereum?: string;
    solana?: string;
    bitcoin?: string;
    tron?: string;
  };
  createdAt: number; // 创建时间
}

/**
 * 加密的钱包存储结构
 */
interface EncryptedWallet {
  wallet: WalletData;
  encryptedMnemonic: EncryptedData;
}

const STORAGE_KEY = 'multichain_wallet_data';
const SESSION_KEY = 'multichain_wallet_session';

/**
 * 钱包管理器类
 */
export class WalletManager {
  /**
   * 生成助记词
   * 使用 bip39 库生成 12 个单词的助记词
   */
  static generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  /**
   * 验证助记词
   */
  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  /**
   * 从助记词派生多链地址
   * 使用 OKX SDK 派生各链地址
   */
  static async deriveAddresses(mnemonic: string): Promise<WalletData['addresses']> {
    try {
      const addresses: WalletData['addresses'] = {};

      // 导入 OKX SDK
      const { EthWallet } = await import('@okxweb3/coin-ethereum');
      const { SolWallet } = await import('@okxweb3/coin-solana');
      const { BtcWallet } = await import('@okxweb3/coin-bitcoin');
      const { TrxWallet } = await import('@okxweb3/coin-tron');

      // 派生 Ethereum 地址 (m/44'/60'/0'/0/0)
      try {
        const ethWallet = new EthWallet();
        const ethPrivateKey = await ethWallet.getDerivedPrivateKey({
          mnemonic,
          hdPath: "m/44'/60'/0'/0/0",
        });
        const ethAddress = await ethWallet.getNewAddress({
          privateKey: ethPrivateKey,
        });
        addresses.ethereum = ethAddress.address;
      } catch (error) {
        console.error('派生 Ethereum 地址失败:', error);
      }

      // 派生 Solana 地址 (m/44'/501'/0'/0')
      try {
        const solWallet = new SolWallet();
        const solPrivateKey = await solWallet.getDerivedPrivateKey({
          mnemonic,
          hdPath: "m/44'/501'/0'/0'",
        });
        const solAddress = await solWallet.getNewAddress({
          privateKey: solPrivateKey,
        });
        addresses.solana = solAddress.address;
      } catch (error) {
        console.error('派生 Solana 地址失败:', error);
      }

      // 派生 Bitcoin 地址 (m/44'/0'/0'/0/0)
      try {
        const btcWallet = new BtcWallet();
        const btcPrivateKey = await btcWallet.getDerivedPrivateKey({
          mnemonic,
          hdPath: "m/44'/0'/0'/0/0",
        });
        const btcAddress = await btcWallet.getNewAddress({
          privateKey: btcPrivateKey,
          addressType: 'legacy', // 使用传统地址格式
        });
        addresses.bitcoin = btcAddress.address;
      } catch (error) {
        console.error('派生 Bitcoin 地址失败:', error);
      }

      // 派生 Tron 地址 (m/44'/195'/0'/0/0)
      try {
        const tronWallet = new TrxWallet();
        const tronPrivateKey = await tronWallet.getDerivedPrivateKey({
          mnemonic,
          hdPath: "m/44'/195'/0'/0/0",
        });
        const tronAddress = await tronWallet.getNewAddress({
          privateKey: tronPrivateKey,
        });
        addresses.tron = tronAddress.address;
      } catch (error) {
        console.error('派生 Tron 地址失败:', error);
      }

      return addresses;
    } catch (error) {
      console.error('派生地址失败:', error);
      throw new Error('派生地址失败');
    }
  }

  /**
   * 创建新钱包
   */
  static async createWallet(
    name: string,
    mnemonic: string,
    password: string
  ): Promise<WalletData> {
    try {
      // 验证助记词
      if (!this.validateMnemonic(mnemonic)) {
        throw new Error('无效的助记词');
      }

      // 派生地址
      const addresses = await this.deriveAddresses(mnemonic);

      // 创建钱包数据
      const wallet: WalletData = {
        name,
        addresses,
        createdAt: Date.now(),
      };

      // 加密助记词
      const encryptedMnemonic = await encrypt(mnemonic, password);

      // 保存到 localStorage
      const encryptedWallet: EncryptedWallet = {
        wallet,
        encryptedMnemonic,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedWallet));

      return wallet;
    } catch (error) {
      console.error('创建钱包失败:', error);
      throw error;
    }
  }

  /**
   * 导入钱包
   */
  static async importWallet(
    name: string,
    mnemonic: string,
    password: string
  ): Promise<WalletData> {
    return this.createWallet(name, mnemonic, password);
  }

  /**
   * 检查是否存在钱包
   */
  static hasWallet(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  }

  /**
   * 获取钱包数据（不包含助记词）
   */
  static getWallet(): WalletData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;

      const encryptedWallet: EncryptedWallet = JSON.parse(data);
      return encryptedWallet.wallet;
    } catch (error) {
      console.error('读取钱包失败:', error);
      return null;
    }
  }

  /**
   * 解锁钱包（验证密码并获取助记词）
   */
  static async unlockWallet(password: string): Promise<{
    wallet: WalletData;
    mnemonic: string;
  }> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        throw new Error('钱包不存在');
      }

      const encryptedWallet: EncryptedWallet = JSON.parse(data);

      // 解密助记词
      const mnemonic = await decrypt(encryptedWallet.encryptedMnemonic, password);

      // 验证助记词
      if (!this.validateMnemonic(mnemonic)) {
        throw new Error('钱包数据损坏');
      }

      // 保存会话（表示已解锁）
      sessionStorage.setItem(SESSION_KEY, 'unlocked');

      return {
        wallet: encryptedWallet.wallet,
        mnemonic,
      };
    } catch (error) {
      console.error('解锁钱包失败:', error);
      throw error;
    }
  }

  /**
   * 锁定钱包
   */
  static lockWallet(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /**
   * 检查钱包是否已解锁
   */
  static isUnlocked(): boolean {
    return sessionStorage.getItem(SESSION_KEY) === 'unlocked';
  }

  /**
   * 删除钱包
   */
  static deleteWallet(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  /**
   * 导出助记词（需要密码验证）
   */
  static async exportMnemonic(password: string): Promise<string> {
    try {
      const { mnemonic } = await this.unlockWallet(password);
      return mnemonic;
    } catch (error) {
      console.error('导出助记词失败:', error);
      throw error;
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // 使用旧密码解锁
      const { wallet, mnemonic } = await this.unlockWallet(oldPassword);

      // 使用新密码重新加密
      const encryptedMnemonic = await encrypt(mnemonic, newPassword);

      // 保存
      const encryptedWallet: EncryptedWallet = {
        wallet,
        encryptedMnemonic,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedWallet));
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }
}
