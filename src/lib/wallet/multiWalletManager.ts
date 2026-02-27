/**
 * 多钱包管理器 - 支持多个钱包
 * 基于 OKX SDK
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
  id: string; // 唯一标识
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
  id: string;
  wallet: WalletData;
  encryptedMnemonic: EncryptedData;
}

/**
 * 多钱包存储结构
 */
interface MultiWalletStorage {
  wallets: EncryptedWallet[];
  activeWalletId: string | null;
}

const STORAGE_KEY = 'multichain_wallets_data';
const SESSION_KEY = 'multichain_wallet_session';

/**
 * 多钱包管理器类
 */
export class MultiWalletManager {
  /**
   * 生成助记词
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
   */
  static async deriveAddresses(mnemonic: string): Promise<WalletData['addresses']> {
    const addresses: WalletData['addresses'] = {};
    const errors: string[] = [];

    try {
      // 导入 OKX SDK
      const { EthWallet } = await import('@okxweb3/coin-ethereum');
      const { SolWallet } = await import('@okxweb3/coin-solana');
      const { BtcWallet } = await import('@okxweb3/coin-bitcoin');
      const { TrxWallet } = await import('@okxweb3/coin-tron');

      // 派生 Ethereum 地址
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
        console.log('✅ Ethereum 地址派生成功:', addresses.ethereum);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ 派生 Ethereum 地址失败:', errorMsg);
        errors.push(`Ethereum: ${errorMsg}`);
      }

      // 派生 Solana 地址
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
        console.log('✅ Solana 地址派生成功:', addresses.solana);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ 派生 Solana 地址失败:', errorMsg);
        errors.push(`Solana: ${errorMsg}`);
      }

      // 派生 Bitcoin 地址
      try {
        const btcWallet = new BtcWallet();
        const btcPrivateKey = await btcWallet.getDerivedPrivateKey({
          mnemonic,
          hdPath: "m/44'/0'/0'/0/0",
        });
        const btcAddress = await btcWallet.getNewAddress({
          privateKey: btcPrivateKey,
          addressType: 'legacy',
        });
        addresses.bitcoin = btcAddress.address;
        console.log('✅ Bitcoin 地址派生成功:', addresses.bitcoin);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ 派生 Bitcoin 地址失败:', errorMsg);
        errors.push(`Bitcoin: ${errorMsg}`);
      }

      // 派生 Tron 地址
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
        console.log('✅ Tron 地址派生成功:', addresses.tron);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('❌ 派生 Tron 地址失败:', errorMsg);
        errors.push(`Tron: ${errorMsg}`);
      }

      // 检查是否至少有一个地址派生成功
      const successCount = Object.keys(addresses).length;
      if (successCount === 0) {
        const errorDetails = errors.join('; ');
        throw new Error(`所有链的地址派生都失败了。详细错误: ${errorDetails}`);
      }

      // 如果有部分失败，记录警告
      if (errors.length > 0) {
        console.warn(`⚠️ 部分链地址派生失败 (${errors.length}/${errors.length + successCount}):`);
        errors.forEach(err => console.warn(`  - ${err}`));
      }

      console.log(`✅ 成功派生 ${successCount} 个链的地址`);
      return addresses;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      console.error('❌ 派生地址失败:', errorMsg);
      throw new Error(`派生地址失败: ${errorMsg}`);
    }
  }

  /**
   * 获取存储数据
   */
  private static getStorage(): MultiWalletStorage {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { wallets: [], activeWalletId: null };
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('读取存储失败:', error);
      return { wallets: [], activeWalletId: null };
    }
  }

  /**
   * 保存存储数据
   */
  private static saveStorage(storage: MultiWalletStorage): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('保存存储失败:', error);
      throw new Error('保存失败');
    }
  }

  /**
   * 生成唯一 ID
   */
  private static generateId(): string {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

      // 生成 ID
      const id = this.generateId();

      // 创建钱包数据
      const wallet: WalletData = {
        id,
        name,
        addresses,
        createdAt: Date.now(),
      };

      // 加密助记词
      const encryptedMnemonic = await encrypt(mnemonic, password);

      // 获取当前存储
      const storage = this.getStorage();

      // 添加新钱包
      const encryptedWallet: EncryptedWallet = {
        id,
        wallet,
        encryptedMnemonic,
      };

      storage.wallets.push(encryptedWallet);

      // 如果是第一个钱包，设置为活动钱包
      if (storage.wallets.length === 1) {
        storage.activeWalletId = id;
      }

      // 保存
      this.saveStorage(storage);

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
   * 列出所有钱包（不包含助记词）
   */
  static listWallets(): WalletData[] {
    const storage = this.getStorage();
    return storage.wallets.map(w => w.wallet);
  }

  /**
   * 获取指定钱包（不包含助记词）
   */
  static getWallet(id: string): WalletData | null {
    const storage = this.getStorage();
    const encryptedWallet = storage.wallets.find(w => w.id === id);
    return encryptedWallet ? encryptedWallet.wallet : null;
  }

  /**
   * 获取活动钱包
   */
  static getActiveWallet(): WalletData | null {
    const storage = this.getStorage();
    if (!storage.activeWalletId) return null;
    return this.getWallet(storage.activeWalletId);
  }

  /**
   * 获取活动钱包 ID
   */
  static getActiveWalletId(): string | null {
    const storage = this.getStorage();
    return storage.activeWalletId;
  }

  /**
   * 切换活动钱包
   */
  static switchWallet(id: string): boolean {
    const storage = this.getStorage();
    const wallet = storage.wallets.find(w => w.id === id);
    
    if (!wallet) {
      console.error('钱包不存在:', id);
      return false;
    }

    storage.activeWalletId = id;
    this.saveStorage(storage);
    
    // 清除会话（需要重新解锁）
    this.lockWallet();
    
    return true;
  }

  /**
   * 重命名钱包
   */
  static renameWallet(id: string, newName: string): boolean {
    const storage = this.getStorage();
    const encryptedWallet = storage.wallets.find(w => w.id === id);
    
    if (!encryptedWallet) {
      console.error('钱包不存在:', id);
      return false;
    }

    encryptedWallet.wallet.name = newName;
    this.saveStorage(storage);
    
    return true;
  }

  /**
   * 删除钱包（需要密码验证）
   */
  static async deleteWallet(id: string, password: string): Promise<boolean> {
    try {
      // 验证密码
      await this.unlockWallet(id, password);

      const storage = this.getStorage();
      const index = storage.wallets.findIndex(w => w.id === id);
      
      if (index === -1) {
        throw new Error('钱包不存在');
      }

      // 删除钱包
      storage.wallets.splice(index, 1);

      // 如果删除的是活动钱包，切换到第一个钱包
      if (storage.activeWalletId === id) {
        storage.activeWalletId = storage.wallets.length > 0 ? storage.wallets[0].id : null;
      }

      this.saveStorage(storage);
      this.lockWallet();

      return true;
    } catch (error) {
      console.error('删除钱包失败:', error);
      throw error;
    }
  }

  /**
   * 解锁钱包（验证密码并获取助记词）
   */
  static async unlockWallet(id: string, password: string): Promise<{
    wallet: WalletData;
    mnemonic: string;
  }> {
    try {
      const storage = this.getStorage();
      const encryptedWallet = storage.wallets.find(w => w.id === id);

      if (!encryptedWallet) {
        throw new Error('钱包不存在');
      }

      // 解密助记词
      const mnemonic = await decrypt(encryptedWallet.encryptedMnemonic, password);

      // 验证助记词
      if (!this.validateMnemonic(mnemonic)) {
        throw new Error('钱包数据损坏');
      }

      // 保存会话
      sessionStorage.setItem(SESSION_KEY, id);

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
  static isUnlocked(id?: string): boolean {
    const unlockedId = sessionStorage.getItem(SESSION_KEY);
    if (!unlockedId) return false;
    if (id) return unlockedId === id;
    return true;
  }

  /**
   * 获取已解锁的钱包 ID
   */
  static getUnlockedWalletId(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
  }

  /**
   * 备份钱包（导出助记词，需要密码验证）
   */
  static async backupWallet(id: string, password: string): Promise<{
    mnemonic: string;
    wallet: WalletData;
  }> {
    try {
      const { wallet, mnemonic } = await this.unlockWallet(id, password);
      return { mnemonic, wallet };
    } catch (error) {
      console.error('备份钱包失败:', error);
      throw error;
    }
  }

  /**
   * 修改钱包密码
   */
  static async changePassword(
    id: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // 使用旧密码解锁
      const { mnemonic } = await this.unlockWallet(id, oldPassword);

      // 使用新密码重新加密
      const encryptedMnemonic = await encrypt(mnemonic, newPassword);

      // 更新存储
      const storage = this.getStorage();
      const encryptedWallet = storage.wallets.find(w => w.id === id);
      
      if (!encryptedWallet) {
        throw new Error('钱包不存在');
      }

      encryptedWallet.encryptedMnemonic = encryptedMnemonic;
      this.saveStorage(storage);
    } catch (error) {
      console.error('修改密码失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否有钱包
   */
  static hasWallets(): boolean {
    const storage = this.getStorage();
    return storage.wallets.length > 0;
  }

  /**
   * 获取钱包数量
   */
  static getWalletCount(): number {
    const storage = this.getStorage();
    return storage.wallets.length;
  }

  /**
   * 清除所有钱包（危险操作）
   */
  static clearAllWallets(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
