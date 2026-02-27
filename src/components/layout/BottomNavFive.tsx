import { Link, useLocation } from 'react-router-dom';
import { Wallet, TrendingUp, Repeat, Compass, User } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: '资产', path: '/', icon: Wallet },
  { name: '行情', path: '/market', icon: TrendingUp },
  { name: '交易', path: '/swap', icon: Repeat },
  { name: '发现', path: '/discover', icon: Compass },
  { name: '我的', path: '/profile', icon: User },
];

export function BottomNavFive() {
  const location = useLocation();

  console.log('🔍 BottomNavFive 正在渲染, 当前路径:', location.pathname);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-2 z-50 shadow-lg"
      style={{ minHeight: '60px' }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 text-xs transition-colors min-w-[60px]',
                isActive ? 'text-primary-600 font-semibold' : 'text-gray-600'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'stroke-[2.5]')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
