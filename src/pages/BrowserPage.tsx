import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Globe,
  AlertTriangle,
  Lock,
  Unlock,
} from 'lucide-react';

export function BrowserPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const initialUrl = searchParams.get('url') || '';

  const [url, setUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [error, setError] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (initialUrl) {
      loadUrl(initialUrl);
    }
  }, []);

  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString.startsWith('http') ? urlString : `https://${urlString}`);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const normalizeUrl = (urlString: string): string => {
    if (!urlString) return '';
    if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
      return urlString;
    }
    return `https://${urlString}`;
  };

  const loadUrl = (targetUrl: string) => {
    if (!targetUrl) return;

    const normalizedUrl = normalizeUrl(targetUrl);
    
    if (!isValidUrl(normalizedUrl)) {
      setError('无效的 URL 地址');
      return;
    }

    setError('');
    setIsLoading(true);
    setCurrentUrl(normalizedUrl);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(normalizedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUrl(url);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
    }
  };

  const handleGoForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentUrl(history[newIndex]);
      setUrl(history[newIndex]);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // Inject wallet provider (simplified version)
    // Note: Full wallet injection requires more complex implementation
    // This is a basic demonstration
    if (iframeRef.current && isConnected && address) {
      try {
        const iframeWindow = iframeRef.current.contentWindow;
        if (iframeWindow) {
          // This is a simplified injection - real implementation would need
          // to inject a full Web3 provider with all required methods
          console.log('Wallet connected:', address);
          // In production, you would inject window.ethereum here
        }
      } catch (error) {
        console.error('Failed to inject wallet:', error);
      }
    }
  };

  const isSecure = currentUrl.startsWith('https://');
  const displayUrl = currentUrl.replace(/^https?:\/\//, '');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Browser Header */}
      <div className="bg-gradient-tp pt-12 pb-6 px-4 rounded-b-[32px] mb-4">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Navigation Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleHome}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors backdrop-blur-sm"
              title="返回首页"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={handleGoBack}
              disabled={!canGoBack}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              title="后退"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleGoForward}
              disabled={!canGoForward}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              title="前进"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleRefresh}
              disabled={!currentUrl}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
              title="刷新"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Address Bar */}
            <form onSubmit={handleSubmit} className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {currentUrl ? (
                    isSecure ? (
                      <Lock className="w-4 h-4 text-green-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-yellow-500" />
                    )
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="输入网址或搜索..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </form>

            {/* Wallet Status */}
            {isConnected && (
              <div className="px-3 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl text-white text-sm font-medium whitespace-nowrap">
                钱包已连接
              </div>
            )}
          </div>

          {/* Current URL Display */}
          {currentUrl && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              {isSecure ? (
                <Lock className="w-3 h-3 text-green-300" />
              ) : (
                <Unlock className="w-3 h-3 text-yellow-300" />
              )}
              <span className="truncate">{displayUrl}</span>
            </div>
          )}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative mx-4">
        {!currentUrl ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-sm max-w-2xl w-full p-12">
              <div className="text-center">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">DApp 浏览器</h2>
                <p className="text-gray-600 mb-6">
                  在地址栏输入 DApp 网址开始浏览
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-sm text-gray-500 font-medium mb-3">推荐 DApp：</p>
                  <button
                    onClick={() => {
                      setUrl('app.uniswap.org');
                      loadUrl('app.uniswap.org');
                    }}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-colors text-left flex items-center gap-3"
                  >
                    <span className="text-2xl">🦄</span>
                    <div>
                      <div className="font-semibold">Uniswap</div>
                      <div className="text-sm text-gray-500">app.uniswap.org</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setUrl('app.aave.com');
                      loadUrl('app.aave.com');
                    }}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-colors text-left flex items-center gap-3"
                  >
                    <span className="text-2xl">👻</span>
                    <div>
                      <div className="font-semibold">Aave</div>
                      <div className="text-sm text-gray-500">app.aave.com</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setUrl('opensea.io');
                      loadUrl('opensea.io');
                    }}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl transition-colors text-left flex items-center gap-3"
                  >
                    <span className="text-2xl">🌊</span>
                    <div>
                      <div className="font-semibold">OpenSea</div>
                      <div className="text-sm text-gray-500">opensea.io</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 rounded-2xl max-w-md w-full p-8">
              <div className="text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">加载失败</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-white rounded-2xl shadow-sm overflow-hidden relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-900 font-medium">加载中...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={handleIframeLoad}
              onError={() => {
                setIsLoading(false);
                setError('无法加载此页面');
              }}
              title="DApp Browser"
            />
          </div>
        )}
      </div>

      {/* Security Warning */}
      {currentUrl && !isSecure && (
        <div className="bg-yellow-50 border-t border-yellow-200 p-3 mx-4 mt-4 rounded-xl">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>此连接不安全。请谨慎操作，不要输入敏感信息。</span>
          </div>
        </div>
      )}
    </div>
  );
}
