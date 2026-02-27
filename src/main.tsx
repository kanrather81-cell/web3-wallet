// 导入 crypto polyfill (必须在最前面)
// import './lib/wallet/polyfill'; // 暂时禁用以调试白屏问题

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config';
import App from './App.tsx';

// 全局错误与未处理 promise 拦截，便于捕获注入脚本抛出的异常
window.addEventListener('error', (ev: ErrorEvent) => {
  // 输出到控制台以便开发时查看
   
  console.error('[Global Error]', ev.error ?? ev.message, ev);
});

window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
   
  console.error('[Unhandled Rejection]', ev.reason);
});

// 检查并记录是否存在不可配置的 ethereum 属性（某些扩展会把属性设为不可重定义）
try {
  if (typeof window !== 'undefined') {
    try {
      const desc = Object.getOwnPropertyDescriptor(window, 'ethereum');
      if (desc && desc.configurable === false) {
         
        console.warn('Detected non-configurable window.ethereum (injected by extension).');
      }
    } catch (e) {
       
      console.warn('Could not inspect window.ethereum descriptor', e);
    }

     // Monkey-patch defineProperty to suppress redefinition errors on ethereum
     try {
       const origDef = Object.defineProperty;
       Object.defineProperty = function(obj: any, prop: string | symbol, descriptor: PropertyDescriptor) {
         if (prop === 'ethereum') {
           try {
             return origDef.call(Object, obj, prop, descriptor);
           } catch (err) {
              
             console.warn('Suppressed defineProperty error for ethereum', err);
             return obj;
           }
         }
         return origDef.call(Object, obj, prop, descriptor);
       } as typeof Object.defineProperty;
     } catch (e) {
        
       console.warn('Failed to patch Object.defineProperty', e);
     }
   }
 } catch {}
 
 // 渲染应用
 try {
   createRoot(document.getElementById('root')!).render(
     <StrictMode>
       <App />
     </StrictMode>
   );
 } catch (err) {
    
   console.error('[Render Error]', err);
   const root = document.getElementById('root');
   if (root) {
     root.innerHTML = '<div style="color:#fff;padding:20px">应用加载失败，查看控制台获取详情。</div>';
   }
 }
