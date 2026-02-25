import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '../config/wagmi';
import { SolanaProvider } from '../lib/providers/SolanaProvider';
import { TronProvider } from './TronProvider';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SolanaProvider>
          <TronProvider>
            {children}
          </TronProvider>
        </SolanaProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
