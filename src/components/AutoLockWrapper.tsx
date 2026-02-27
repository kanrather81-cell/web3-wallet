import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAutoLock } from '../lib/hooks/useAutoLock';

interface AutoLockWrapperProps {
  children: React.ReactNode;
}

// Pages that should not trigger auto-lock
const EXCLUDED_PATHS = [
  '/wallet-setup',
  '/create-wallet',
  '/unlock-wallet',
  '/import-wallet',
];

export function AutoLockWrapper({ children }: AutoLockWrapperProps) {
  const location = useLocation();
  const isExcludedPath = EXCLUDED_PATHS.some((path) =>
    location.pathname.startsWith(path)
  );

  // Only enable auto-lock on protected pages
  const { resetTimer } = useAutoLock({
    enabled: !isExcludedPath,
  });

  // Reset timer when route changes
  useEffect(() => {
    if (!isExcludedPath) {
      resetTimer();
    }
  }, [location.pathname, isExcludedPath, resetTimer]);

  return <>{children}</>;
}
