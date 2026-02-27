import { Link, useLocation } from 'react-router-dom';
import { Home, User, TrendingUp, Repeat } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: '资产', path: '/', icon: Home, altPaths: ['/assets'] },
  { name: '行情', path: '/market', icon: TrendingUp },
  { name: '兑换', path: '/swap', icon: Repeat },
  { name: '我的', path: '/profile', icon: User },
];

export function BottomNavTP() {
  const location = useLocation();

  console.log('🔍 BottomNavTP rendering, current path:', location.pathname);

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
      style={{ zIndex: 9999 }}
      data-testid="bottom-nav"
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.altPaths && item.altPaths.includes(location.pathname));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 flex-1',
                isActive ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon 
                className="h-6 w-6" 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn('text-xs', isActive && 'font-semibold')}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
