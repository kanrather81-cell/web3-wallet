import type { FC, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

// Solana RPC配置
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export const SolanaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // 不使用 @solana/wallet-adapter-wallets 以避免 Buffer 冲突
  // Phantom 和 Solflare 等钱包会通过浏览器扩展自动被检测到
  // 用户可以通过 WalletModalProvider 的 UI 连接钱包
  const wallets: any[] = [];

  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
