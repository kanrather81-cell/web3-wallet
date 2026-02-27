/**
 * 钱包上下文 - 全局钱包状态管理（支持多钱包）
 */
 

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { MultiWalletManager } from '../lib/wallet/multiWalletManager';
import type { WalletData } from '../lib/wallet/multiWalletManager';

interface WalletContextType {
  wallet: WalletData | null;
  wallets: WalletData[];
  isUnlocked: boolean;
  isLoading: boolean;
  unlockWallet: (walletId: string, password: string) => Promise<void>;
  lockWallet: () => void;
  createWallet: (name: string, mnemonic: string, password: string) => Promise<void>;
  switchWallet: (walletId: string) => void;
  refreshWallets: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：检查钱包状态
  useEffect(() => {
    const initWallet = () => {
      try {
        const allWallets = MultiWalletManager.listWallets();
        const activeWallet = MultiWalletManager.getActiveWallet();
        const unlockedId = MultiWalletManager.getUnlockedWalletId();
        
        setWallets(allWallets);
        setWallet(activeWallet);
        setIsUnlocked(!!unlockedId && unlockedId === activeWallet?.id);
      } catch (error) {
        console.error('初始化钱包失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initWallet();
  }, []);

  // 解锁钱包
  const unlockWallet = async (walletId: string, password: string) => {
    try {
      const { wallet: unlockedWallet } = await MultiWalletManager.unlockWallet(walletId, password);
      setWallet(unlockedWallet);
      setIsUnlocked(true);
    } catch (error) {
      console.error('解锁失败:', error);
      throw error;
    }
  };

  // 锁定钱包
  const lockWallet = () => {
    MultiWalletManager.lockWallet();
    setIsUnlocked(false);
  };

  // 创建钱包
  const createWallet = async (name: string, mnemonic: string, password: string) => {
    try {
      const newWallet = await MultiWalletManager.createWallet(name, mnemonic, password);
      
      // 刷新钱包列表
      const allWallets = MultiWalletManager.listWallets();
      setWallets(allWallets);
      setWallet(newWallet);
      setIsUnlocked(true);
    } catch (error) {
      console.error('创建钱包失败:', error);
      throw error;
    }
  };

  // 切换钱包
  const switchWallet = (walletId: string) => {
    const success = MultiWalletManager.switchWallet(walletId);
    if (success) {
      const newWallet = MultiWalletManager.getWallet(walletId);
      setWallet(newWallet);
      setIsUnlocked(false); // 切换后需要重新解锁
    }
  };

  // 刷新钱包列表
  const refreshWallets = () => {
    const allWallets = MultiWalletManager.listWallets();
    const activeWallet = MultiWalletManager.getActiveWallet();
    const unlockedId = MultiWalletManager.getUnlockedWalletId();
    
    setWallets(allWallets);
    setWallet(activeWallet);
    setIsUnlocked(!!unlockedId && unlockedId === activeWallet?.id);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        wallets,
        isUnlocked,
        isLoading,
        unlockWallet,
        lockWallet,
        createWallet,
        switchWallet,
        refreshWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}
