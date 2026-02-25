import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

// Tron上下文类型
interface TronContextType {
  tronWeb: any;
  tronLink: any;
  isInitialized: boolean;
  isInstalled: boolean;
}

const TronContext = createContext<TronContextType>({
  tronWeb: null,
  tronLink: null,
  isInitialized: false,
  isInstalled: false
});

export const useTronContext = () => useContext(TronContext);

export const TronProvider = ({ children }: { children: ReactNode }) => {
  const [tronWeb, setTronWeb] = useState<any>(null);
  const [tronLink, setTronLink] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 检查TronLink是否安装
    const checkTronLink = () => {
      const installed = !!(window as any).tronLink && !!(window as any).tronWeb;
      setIsInstalled(installed);

      if (installed) {
        setTronLink((window as any).tronLink);
        setTronWeb((window as any).tronWeb);
      }

      setIsInitialized(true);
    };

    // 监听TronLink初始化事件
    if ((window as any).tronLink) {
      checkTronLink();
    } else {
      window.addEventListener('tronLink#initialized', checkTronLink);
    }

    return () => {
      window.removeEventListener('tronLink#initialized', checkTronLink);
    };
  }, []);

  return (
    <TronContext.Provider value={{ tronWeb, tronLink, isInitialized, isInstalled }}>
      {children}
    </TronContext.Provider>
  );
};
