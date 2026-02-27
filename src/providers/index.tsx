import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '../config/wagmi';
import { SolanaProvider } from '../lib/providers/SolanaProvider';
import { TronProvider } from './TronProvider';
import { WalletProvider } from '../contexts/WalletContext';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          <TronProvider>
            <WalletProvider>
              <Toaster position="top-center" richColors />
              {children}
            </WalletProvider>
          </TronProvider>
        </SolanaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
