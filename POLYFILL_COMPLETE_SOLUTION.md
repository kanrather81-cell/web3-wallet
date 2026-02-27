# Node.js Polyfill 完整解决方案

## 问题总结

在浏览器中使用 OKX SDK 和其他加密库时，遇到了多个 Node.js 模块缺失的问题：

1. ✅ **Buffer 未定义** - `Cannot read properties of undefined (reading 'slice')`
2. ✅ **Buffer 重复声明** - `Identifier 'Buffer' has already been declared`
3. ✅ **assert 模块缺失** - `assert_1.strict is not a function`

## 完整解决方案

### 1. 安装必要的 Polyfill 包

```bash
npm install --save-dev \
  @esbuild-plugins/node-globals-polyfill \
  @esbuild-plugins/node-modules-polyfill \
  buffer \
  process \
  stream-browserify \
  util \
  assert \
  --legacy-peer-deps
```

### 2. 配置 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
      process: 'process/browser.js',
      stream: 'stream-browserify',
      util: 'util/',
      assert: 'assert/',  // 添加 assert polyfill
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
    include: ['buffer', 'process'],
  },
  // ... 其他配置
})
```

### 3. 保持 `src/main.tsx` 简洁

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n/config';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**关键点**：
- ❌ 不要手动导入 `Buffer`
- ❌ 不要手动设置 `window.Buffer`
- ✅ 让 esbuild 插件自动处理所有 polyfill

### 4. 移除 Solana Wallet Adapter Wallets

修改 `src/lib/providers/SolanaProvider.tsx`：

```typescript
import type { FC, ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

export const SolanaProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // 不使用 @solana/wallet-adapter-wallets 以避免 Buffer 冲突
  // Phantom 和 Solflare 会通过浏览器扩展自动被检测到
  const wallets = [];

  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

## 工作原理

### Polyfill 层次结构

```
┌─────────────────────────────────────────┐
│  浏览器环境                              │
├─────────────────────────────────────────┤
│  Vite esbuild 插件层                     │
│  - NodeGlobalsPolyfillPlugin            │
│  - NodeModulesPolyfillPlugin            │
│  → 自动注入 Buffer, process 等           │
├─────────────────────────────────────────┤
│  Vite resolve.alias 层                   │
│  - buffer → buffer/                     │
│  - process → process/browser.js         │
│  - stream → stream-browserify           │
│  - util → util/                         │
│  - assert → assert/                     │
│  → 模块路径映射                          │
├─────────────────────────────────────────┤
│  应用代码                                │
│  - OKX SDK                              │
│  - 加密库                                │
│  - 其他依赖                              │
└─────────────────────────────────────────┘
```

### 为什么这个方案有效？

1. **构建时注入** - esbuild 插件在构建时注入 polyfill，避免运行时冲突
2. **统一管理** - 所有库共享同一个 Buffer 实例
3. **自动处理** - 不需要手动管理 polyfill
4. **完整覆盖** - 覆盖了所有必要的 Node.js 模块

## 验证步骤

### 1. 清除缓存
```bash
cd web3-wallet
rm -rf node_modules/.vite
```

### 2. 启动开发服务器
```bash
npm run dev
```

**预期输出**：
```
VITE v7.3.1  ready in 380 ms
➜  Local:   http://localhost:5173/
```

### 3. 浏览器测试

访问 `http://localhost:5173/`

**检查控制台**：
- ✅ 无 "Buffer already declared" 错误
- ✅ 无 "Cannot read properties of undefined" 错误
- ✅ 无 "assert_1.strict is not a function" 错误
- ✅ 页面正常显示

### 4. 测试钱包创建

1. 点击"创建钱包"
2. 输入钱包名称和密码
3. 点击"创建"

**预期日志**：
```
✅ Ethereum 地址派生成功: 0x...
✅ Solana 地址派生成功: ...
✅ Bitcoin 地址派生成功: ...
✅ Tron 地址派生成功: T...
✅ 成功派生 4 个链的地址
```

## 已解决的问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Buffer 未定义 | 浏览器没有 Node.js 的 Buffer | esbuild 插件注入 buffer polyfill |
| Buffer 重复声明 | 多个库都声明 Buffer | 移除手动导入，只用 esbuild 插件 |
| assert 模块缺失 | 浏览器没有 Node.js 的 assert | 添加 assert polyfill 和 alias |
| Solana adapter 冲突 | @solana/wallet-adapter-wallets 包含 Buffer | 移除该包，使用浏览器扩展自动检测 |

## 成功标准

- [x] 开发服务器正常启动
- [x] 浏览器控制台无 polyfill 相关错误
- [x] 页面正常显示（不是白屏）
- [x] 钱包创建功能正常
- [x] 所有链的地址都能正常派生
- [x] Solana 钱包连接功能正常（通过浏览器扩展）

## 可能需要的其他 Polyfill

如果遇到其他 Node.js 模块缺失的错误，可以按照相同的模式添加：

### 常见的 Node.js 模块

| 模块 | Polyfill 包 | Alias 配置 |
|------|------------|-----------|
| crypto | crypto-browserify | `crypto: 'crypto-browserify'` |
| path | path-browserify | `path: 'path-browserify'` |
| os | os-browserify/browser | `os: 'os-browserify/browser'` |
| http | stream-http | `http: 'stream-http'` |
| https | https-browserify | `https: 'https-browserify'` |
| url | url/ | `url: 'url/'` |
| zlib | browserify-zlib | `zlib: 'browserify-zlib'` |
| fs | - | 无法 polyfill（文件系统） |

### 添加新 Polyfill 的步骤

1. 安装 polyfill 包：
   ```bash
   npm install <polyfill-package> --save-dev --legacy-peer-deps
   ```

2. 在 `vite.config.ts` 中添加 alias：
   ```typescript
   resolve: {
     alias: {
       // ... 现有的 alias
       '<module-name>': '<polyfill-package>',
     },
   },
   ```

3. 清除缓存并重启：
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## 总结

通过正确配置 Vite 的 polyfill 系统，我们成功解决了所有 Node.js 模块在浏览器中的兼容性问题：

1. ✅ Buffer polyfill - 通过 esbuild 插件自动注入
2. ✅ process polyfill - 通过 esbuild 插件自动注入
3. ✅ stream polyfill - 通过 stream-browserify
4. ✅ util polyfill - 通过 util 包
5. ✅ assert polyfill - 通过 assert 包
6. ✅ 避免 Buffer 冲突 - 移除手动导入和问题库

现在应用可以正常运行，所有功能都能正常使用！🎉
