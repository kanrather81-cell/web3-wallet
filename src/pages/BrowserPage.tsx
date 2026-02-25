import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '../components/ui/card';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Browser Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Navigation Bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleHome}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title="返回首页"
            >
              <Home className="w-5 h-5" />
            </button>

            <button
              onClick={handleGoBack}
              disabled={!canGoBack}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="后退"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleGoForward}
              disabled={!canGoForward}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="前进"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleRefresh}
              disabled={!currentUrl}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <Lock className="w-4 h-4 text-green-400" />
                    ) : (
                      <Unlock className="w-4 h-4 text-yellow-400" />
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </form>

            {/* Wallet Status */}
            {isConnected && (
              <div className="px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium whitespace-nowrap">
                钱包已连接
              </div>
            )}
          </div>

          {/* Current URL Display */}
          {currentUrl && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {isSecure ? (
                <Lock className="w-3 h-3 text-green-400" />
              ) : (
                <Unlock className="w-3 h-3 text-yellow-400" />
              )}
              <span className="truncate">{displayUrl}</span>
            </div>
          )}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative">
        {!currentUrl ? (
          <div className="h-full flex items-center justify-center p-4">
            <Card className="bg-gray-800/50 border-gray-700 max-w-2xl w-full">
              <CardContent className="p-12 text-center">
                <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">DApp 浏览器</h2>
                <p className="text-gray-400 mb-6">
                  在地址栏输入 DApp 网址开始浏览
                </p>
                <div className="space-y-2 text-left">
                  <p className="text-sm text-gray-500">推荐 DApp：</p>
                  <button
                    onClick={() => {
                      setUrl('app.uniswap.org');
                      loadUrl('app.uniswap.org');
                    }}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-left"
                  >
                    🦄 Uniswap - app.uniswap.org
                  </button>
                  <button
                    onClick={() => {
                      setUrl('app.aave.com');
                      loadUrl('app.aave.com');
                    }}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-left"
                  >
                    👻 Aave - app.aave.com
                  </button>
                  <button
                    onClick={() => {
                      setUrl('opensea.io');
                      loadUrl('opensea.io');
                    }}
                    className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-left"
                  >
                    🌊 OpenSea - opensea.io
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center p-4">
            <Card className="bg-red-500/10 border-red-500/30 max-w-md w-full">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">加载失败</h3>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  重试
                </button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-10">
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
                  <p className="text-white">加载中...</p>
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
          </>
        )}
      </div>

      {/* Security Warning */}
      {currentUrl && !isSecure && (
        <div className="bg-yellow-500/10 border-t border-yellow-500/30 p-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>此连接不安全。请谨慎操作，不要输入敏感信息。</span>
          </div>
        </div>
      )}
    </div>
  );
}
