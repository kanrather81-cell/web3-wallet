import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Skeleton } from './components/ui/skeleton';
import { Providers } from './providers';
import { MainLayout } from './components/MainLayout';
import { BottomNavFive } from './components/layout/BottomNavFive';
// homepage seed; replaced with real assets view
import { AssetsPage } from './pages/AssetsPage';
import { DiscoverTP } from './pages/DiscoverTP';
import { ProfileTP } from './pages/ProfileTP';

// Lazy load pages for code splitting
const AssetsPage = lazy(() => import('./pages/AssetsPage').then(m => ({ default: m.AssetsPage })));
const MarketPage = lazy(() => import('./pages/MarketPage').then(m => ({ default: m.MarketPage })));
const CoinDetailPage = lazy(() => import('./pages/CoinDetailPage').then(m => ({ default: m.CoinDetailPage })));
const SwapPage = lazy(() => import('./pages/SwapPage').then(m => ({ default: m.SwapPage })));
const SendPage = lazy(() => import('./pages/SendPage').then(m => ({ default: m.SendPage })));
const TransactionHistoryPage = lazy(() => import('./pages/TransactionHistoryPage').then(m => ({ default: m.TransactionHistoryPage })));
const TxDetailsPage = lazy(() => import('./pages/TxDetailsPage').then(m => ({ default: m.TxDetailsPage })));
const MyDAppsPage = lazy(() => import('./pages/MyDAppsPage').then(m => ({ default: m.MyDAppsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const BrowserPage = lazy(() => import('./pages/BrowserPage').then(m => ({ default: m.BrowserPage })));
const SolanaTestPage = lazy(() => import('./pages/SolanaTestPage').then(m => ({ default: m.SolanaTestPage })));
const BitcoinTestPage = lazy(() => import('./pages/BitcoinTestPage').then(m => ({ default: m.BitcoinTestPage })));
const TronTestPage = lazy(() => import('./pages/TronTestPage'));
const CreateWalletPage = lazy(() => import('./pages/CreateWalletPage'));
const UnlockWalletPage = lazy(() => import('./pages/UnlockWalletPage'));
const ImportWalletPage = lazy(() => import('./pages/ImportWalletPage'));
const WalletSetupPage = lazy(() => import('./pages/WalletSetupPage'));
const WalletsPage = lazy(() => import('./pages/WalletsPage'));
const TokenDetailPage = lazy(() => import('./pages/TokenDetailPage'));
const ReceivePage = lazy(() => import('./pages/ReceivePage'));

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

// TP Style Layout with Bottom Navigation
function TPLayout() {
  return (
    <>
      <Outlet />
      <BottomNavFive />
    </>
  );
}

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* TP Style Routes with Bottom Navigation */}
              <Route element={<TPLayout />}>
                <Route path="/" element={<AssetsPage />} />
                <Route path="/discover" element={<DiscoverTP />} />
                <Route path="/profile" element={<ProfileTP />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/swap" element={<SwapPage />} />
                <Route path="/history" element={<TransactionHistoryPage />} />
                <Route path="/browser" element={<BrowserPage />} />
                <Route path="/send" element={<SendPage />} />
                <Route path="/send/:chainId/:tokenAddress" element={<SendPage />} />
                <Route path="/receive/:chainId" element={<ReceivePage />} />
                <Route path="/receive/:chainId/:tokenAddress" element={<ReceivePage />} />
                <Route path="/token/:chainId" element={<TokenDetailPage />} />
                <Route path="/token/:chainId/:tokenAddress" element={<TokenDetailPage />} />
                <Route path="/market/:coinId" element={<CoinDetailPage />} />
                <Route path="/tx/:txHash" element={<TxDetailsPage />} />
                <Route path="/assets" element={<AssetsPage />} />
                <Route path="/wallets" element={<WalletsPage />} />
                <Route path="/test/solana" element={<SolanaTestPage />} />
                <Route path="/test/bitcoin" element={<BitcoinTestPage />} />
                <Route path="/test/tron" element={<TronTestPage />} />
              </Route>

              {/* Main app routes with navigation */}
              
              {/* Secondary pages with back button */}
              <Route path="/dapps" element={<MainLayout showBack><MyDAppsPage /></MainLayout>} />
              <Route path="/settings" element={<MainLayout showBack><SettingsPage /></MainLayout>} />
              
              {/* Wallet setup pages (no navigation) */}
              <Route path="/wallet-setup" element={<WalletSetupPage />} />
              <Route path="/create-wallet" element={<CreateWalletPage />} />
              <Route path="/unlock-wallet" element={<UnlockWalletPage />} />
              <Route path="/import-wallet" element={<ImportWalletPage />} />
            </Routes>
          </Suspense>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
