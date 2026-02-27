import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, Repeat, Compass } from 'lucide-react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      icon: Wallet,
      label: '资产',
      path: '/',
    },
    {
      icon: TrendingUp,
      label: '行情',
      path: '/market',
    },
    {
      icon: Repeat,
      label: '兑换',
      path: '/swap',
    },
    {
      icon: Compass,
      label: '发现',
      path: '/discover',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all ${
                  active
                    ? 'text-indigo-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${active ? 'scale-110' : ''}`} />
                <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
