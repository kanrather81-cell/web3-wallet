# Window.crypto 只读属性修复方案

## 问题描述

### 错误 1: window.crypto 只读
```
Uncaught TypeError: Cannot set property crypto of #<Window> which has only a getter
```

### 错误 2: crypto.randomBytes 不是函数
```
派生地址失败: (0, crypto_1.randomBytes) is not a function
```

## 根本原因

在浏览器中,`window.crypto` 是一个只读属性,不能直接赋值或替换。之前的方案尝试:
```typescript
window.crypto = crypto;  // ❌ 错误:会抛出 TypeError
```

## 解决方案

### 方法:使用 Object.defineProperty 添加 randomBytes 方法

不替换整个 `window.crypto` 对象,而是在现有的 `crypto` 对象上添加 `randomBytes` 方法。

## 实现步骤

### 1. 创建 polyfill.ts 文件

位置: `src/lib/wallet/polyfill.ts`

```typescript
import { randomBytes } from 'crypto-browserify';

// 在现有的 crypto 对象上添加 randomBytes 方法
if (!(globalThis.crypto as any).randomBytes) {
  try {
    Object.defineProperty(globalThis.crypto, 'randomBytes', {
      value: randomBytes,
      writable: false,
      configurable: true,
      enumerable: false,
    });
  } catch (error) {
    // 降级方案:直接赋值
    (globalThis.crypto as any).randomBytes = randomBytes;
  }
}

// 同时确保 Buffer 和 process 全局可用
import { Buffer } from 'buffer';
import process from 'process';

if (typeof (globalThis as any).Buffer === 'undefined') {
  (globalThis as any).Buffer = Buffer;
}

if (typeof (globalThis as any).process === 'undefined') {
  (globalThis as any).process = process;
}
```

### 2. 在 main.tsx 中导入 polyfill

```typescript
// 必须在最前面导入
import './lib/wallet/polyfill';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// ... 其他导入
```

### 3. vite.config.ts 配置

```typescript
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['assert', 'buffer', 'crypto', 'stream', 'path', 'fs', 'os', 'url', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
})
```

## 工作原理

### 1. vite-plugin-node-polyfills
- 自动将 Node.js 的 `crypto` 模块替换为 `crypto-browserify`
- 在构建时处理所有 `import crypto from 'crypto'` 语句

### 2. polyfill.ts
- 在运行时添加 `crypto.randomBytes` 方法
- 使用 `Object.defineProperty` 避免直接赋值错误
- 确保 OKX SDK 可以调用 `crypto.randomBytes()`

### 3. 全局注入
- Buffer 和 process 也通过 polyfill 全局可用
- 所有加密库都能正常工作

## 对比之前的错误方案

### ❌ 错误方案
```typescript
// main.tsx
import crypto from 'crypto-browserify';
window.crypto = crypto;  // TypeError: 只读属性
```

### ✅ 正确方案
```typescript
// polyfill.ts
import { randomBytes } from 'crypto-browserify';
Object.defineProperty(globalThis.crypto, 'randomBytes', {
  value: randomBytes,
  // ...
});
```

## 测试验证

1. 启动开发服务器:
```bash
npm run dev
```

2. 打开浏览器控制台,测试:
```javascript
// 应该返回 Uint8Array
console.log(crypto.randomBytes(32));
```

3. 测试创建钱包:
   - 点击"创建钱包"
   - 输入密码
   - 点击"创建钱包"按钮
   - 验证所有 4 条链的地址都能成功派生

4. 检查控制台:
   - ✅ 不应该有 `Cannot set property crypto` 错误
   - ✅ 不应该有 `crypto.randomBytes is not a function` 错误
   - ✅ 所有链的地址派生应该成功

## 相关依赖

已安装的 polyfill 包:
- `crypto-browserify` - crypto 模块的浏览器版本
- `buffer` - Buffer 的浏览器版本
- `process` - process 的浏览器版本
- `stream-browserify` - stream 模块的浏览器版本
- `assert` - assert 模块的浏览器版本

## 相关文件

- `web3-wallet/src/lib/wallet/polyfill.ts` - Crypto polyfill 实现
- `web3-wallet/src/main.tsx` - 导入 polyfill
- `web3-wallet/vite.config.ts` - Vite 配置
- `web3-wallet/package.json` - 依赖配置

## 注意事项

### 为什么不能直接替换 window.crypto?

浏览器的 `window.crypto` 是一个只读的 getter 属性:
```javascript
Object.getOwnPropertyDescriptor(window, 'crypto')
// {
//   get: function crypto() { [native code] },
//   set: undefined,  // 没有 setter!
//   enumerable: true,
//   configurable: false
// }
```

因此任何尝试赋值的操作都会失败。

### 为什么使用 Object.defineProperty?

`Object.defineProperty` 可以在现有对象上添加新属性,而不需要替换整个对象:
```javascript
Object.defineProperty(crypto, 'randomBytes', {
  value: randomBytes,
  writable: false,
  configurable: true,
  enumerable: false,
});
```

这样 OKX SDK 调用 `crypto.randomBytes()` 时就能找到这个方法。

## 日期
2026-02-26
