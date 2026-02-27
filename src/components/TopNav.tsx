import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

interface TopNavProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
}

export function TopNav({ title, showBack = false, showSettings = false }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-generate title based on current route if not provided
  const getTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === '/') return '资产';
    if (path.startsWith('/market')) return '行情';
    if (path.startsWith('/swap')) return '兑换';
    if (path.startsWith('/discover')) return '发现';
    if (path.startsWith('/profile')) return '我的';
    if (path.startsWith('/settings')) return '设置';
    if (path.startsWith('/wallets')) return '钱包管理';
    if (path.startsWith('/history')) return '交易历史';
    if (path.startsWith('/send')) return '发送';
    
    return 'Web3 Wallet';
  };

  return (
    <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back button or empty space */}
          <div className="w-10">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Center: Title */}
          <h1 className="text-xl font-bold text-white">{getTitle()}</h1>

          {/* Right: Settings button or empty space */}
          <div className="w-10">
            {showSettings && (
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
