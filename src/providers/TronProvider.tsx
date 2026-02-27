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
    // 检查TronLink是否安装（安全读取）
    const checkTronLink = () => {
      try {
         
        const { getSafeWindowProp } = require('../lib/utils/safeWindow');
        const installed = !!getSafeWindowProp('tronLink') && !!getSafeWindowProp('tronWeb');
        setIsInstalled(installed);

        if (installed) {
          setTronLink(getSafeWindowProp('tronLink'));
          setTronWeb(getSafeWindowProp('tronWeb'));
        }

        setIsInitialized(true);
      } catch (e) {
         
        console.warn('checkTronLink failed', e);
        setIsInitialized(true);
      }
    };

    try {
      const safeTronLink = (function() {
        try {
           
          const { getSafeWindowProp } = require('../lib/utils/safeWindow');
          return getSafeWindowProp('tronLink');
        } catch (e) {
          return undefined;
        }
      })();

      if (safeTronLink) {
        checkTronLink();
      } else {
        window.addEventListener('tronLink#initialized', checkTronLink);
      }
    } catch (e) {
       
      console.warn('TronProvider initialization failed:', e);
      // 保证组件不会一直处于未初始化状态
      setIsInitialized(true);
    }

    return () => {
      try {
        window.removeEventListener('tronLink#initialized', checkTronLink);
      } catch {}
    };
  }, []);

  return (
    <TronContext.Provider value={{ tronWeb, tronLink, isInitialized, isInstalled }}>
      {children}
    </TronContext.Provider>
  );
};
