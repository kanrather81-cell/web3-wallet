import { lazy, Suspense } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { config } from './config/wagmi';
import { Skeleton } from './components/ui/skeleton';

// Lazy load pages for code splitting
const AssetsPage = lazy(() => import('./pages/AssetsPage').then(m => ({ default: m.AssetsPage })));
const MarketPage = lazy(() => import('./pages/MarketPage').then(m => ({ default: m.MarketPage })));
const CoinDetailPage = lazy(() => import('./pages/CoinDetailPage').then(m => ({ default: m.CoinDetailPage })));
const SwapPage = lazy(() => import('./pages/SwapPage').then(m => ({ default: m.SwapPage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const MyDAppsPage = lazy(() => import('./pages/MyDAppsPage').then(m => ({ default: m.MyDAppsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const BrowserPage = lazy(() => import('./pages/BrowserPage').then(m => ({ default: m.BrowserPage })));

const queryClient = new QueryClient();

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto pt-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="dark">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<AssetsPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/market/:coinId" element={<CoinDetailPage />} />
                <Route path="/swap" element={<SwapPage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/dapps" element={<MyDAppsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/browser" element={<BrowserPage />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
