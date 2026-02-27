# Polyfill 测试指南

## 测试 Polyfill 是否正确加载

### 1. 打开浏览器控制台

访问 `http://localhost:5173/` 并按 F12 打开控制台。

### 2. 运行以下测试命令

在控制台中逐个运行以下命令：

```javascript
// 测试 Buffer
console.log('Buffer:', typeof Buffer, Buffer);

// 测试 process
console.log('process:', typeof process, process);

// 测试 global
console.log('global:', typeof global, global);

// 测试 assert
console.log('assert:', typeof require === 'undefined' ? 'require not available' : 'require available');

// 尝试导入 assert（如果支持动态导入）
import('assert').then(assert => {
  console.log('assert module:', assert);
  console.log('assert.strict:', assert.strict);
}).catch(err => {
  console.error('Failed to import assert:', err);
});
```

### 3. 预期结果

**成功的输出**：
```
Buffer: function [Function: Buffer]
process: object { ... }
global: object Window { ... }
assert module: { ... }
assert.strict: function
```

**如果 assert 导入失败**：
```
Failed to import assert: Error: ...
```

这说明 assert polyfill 没有正确配置。

---

## 如果 assert 仍然失败

### 方案 A：手动在 main.tsx 中导入 assert

修改 `src/main.tsx`：

```typescript
// Polyfills
import assert from 'assert';

// 确保 assert 全局可用
if (typeof (window as any).assert === 'undefined') {
  (window as any).assert = assert;
}

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

### 方案 B：在 vite.config.ts 中添加更多配置

```typescript
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
      assert: 'assert/',
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
    include: ['buffer', 'process', 'assert'],
    // 强制预构建 assert
    force: true,
  },
  // ...
})
```

然后清除缓存并重启：
```bash
rm -rf node_modules/.vite
npm run dev
```

### 方案 C：检查 assert 包是否正确安装

```bash
npm list assert
```

如果没有安装或版本不对，重新安装：
```bash
npm install assert@^2.1.0 --save-dev --legacy-peer-deps
```

---

## 调试步骤

### 1. 检查 node_modules

```bash
ls node_modules/assert
```

应该看到 assert 包的文件。

### 2. 检查 Vite 预构建

启动开发服务器后，检查：
```bash
ls node_modules/.vite/deps
```

应该看到 `assert.js` 文件。

### 3. 检查浏览器网络请求

在浏览器开发者工具的 Network 标签中，搜索 "assert"，应该能看到 assert 相关的请求。

---

## 最后的备选方案

如果所有方案都失败，可以考虑：

### 选项 1：移除使用 assert 的库

检查哪个 OKX SDK 包在使用 assert，考虑是否可以移除或替换。

### 选项 2：使用不同的钱包库

考虑使用其他不依赖 assert 的钱包库，例如：
- ethers.js（用于 Ethereum）
- @solana/web3.js（用于 Solana）
- bitcoinjs-lib（用于 Bitcoin）

### 选项 3：创建自定义 assert polyfill

在 `src/main.tsx` 中添加：

```typescript
// 简单的 assert polyfill
if (typeof (window as any).assert === 'undefined') {
  const assert = (condition: any, message?: string) => {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  };
  
  assert.strict = assert;
  assert.ok = assert;
  assert.equal = (actual: any, expected: any, message?: string) => {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected} but got ${actual}`);
    }
  };
  
  (window as any).assert = assert;
}
```

---

请先运行控制台测试，然后告诉我结果，我会根据情况提供进一步的解决方案。
