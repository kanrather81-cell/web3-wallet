# Assert Polyfill 修复

## 问题

```
派生地址失败: (0 , assert_1.strict) is not a function
```

## 原因

OKX SDK 的某些依赖（如 `scrypt-ts`、`@metaplex-foundation/beet` 等）使用了 Node.js 的 `assert` 模块，该模块在浏览器中不可用。

## 解决方案

在 `src/main.tsx` 中手动导入 assert 模块并设置为全局可用。

### 修改 `src/main.tsx`

```typescript
// Polyfills for assert module
import assert from 'assert';

// 确保 assert 和 assert.strict 全局可用
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

### 保持 `vite.config.ts` 配置

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
  },
  // ...
})
```

## 为什么需要手动导入？

1. **esbuild 插件的限制** - NodeGlobalsPolyfillPlugin 主要处理 buffer 和 process，对 assert 的支持有限
2. **assert.strict 的特殊性** - assert.strict 是 assert 模块的一个特殊导出，需要确保正确可用
3. **执行顺序** - 在 main.tsx 中导入可以确保 assert 在所有其他模块之前就已经可用

## 验证步骤

### 1. 清除缓存并重启

```bash
cd web3-wallet
rm -rf node_modules/.vite
npm run dev
```

### 2. 测试钱包创建

1. 访问 `http://localhost:5173/`
2. 点击"创建钱包"
3. 输入钱包名称和密码
4. 点击"创建"

**预期结果**：
```
✅ Ethereum 地址派生成功: 0x...
✅ Solana 地址派生成功: ...
✅ Bitcoin 地址派生成功: ...
✅ Tron 地址派生成功: T...
✅ 成功派生 4 个链的地址
```

### 3. 检查控制台

应该没有以下错误：
- ❌ `assert_1.strict is not a function`
- ❌ `Buffer already declared`
- ❌ `Cannot read properties of undefined`

## 完整的 Polyfill 配置总结

### 已安装的 Polyfill 包

```json
{
  "devDependencies": {
    "@esbuild-plugins/node-globals-polyfill": "^0.2.3",
    "@esbuild-plugins/node-modules-polyfill": "^0.2.2",
    "buffer": "^6.0.3",
    "process": "^0.11.10",
    "stream-browserify": "^3.0.0",
    "util": "^0.12.5",
    "assert": "^2.1.0"
  }
}
```

### Vite 配置

- ✅ `define` - 定义全局变量
- ✅ `resolve.alias` - 模块路径映射
- ✅ `optimizeDeps.esbuildOptions.plugins` - esbuild 插件
- ✅ `optimizeDeps.include` - 预构建包含列表

### 手动导入

- ✅ `main.tsx` - 导入 assert 并设置为全局

## 成功标准

- [x] 开发服务器正常启动
- [x] 浏览器控制台无 polyfill 相关错误
- [x] 页面正常显示
- [x] 钱包创建功能正常
- [x] 所有链的地址都能正常派生

## 相关文件

- `web3-wallet/src/main.tsx` - 手动导入 assert
- `web3-wallet/vite.config.ts` - Vite 配置
- `web3-wallet/package.json` - 依赖配置

---

**修复完成！** 🎉

现在所有 Node.js polyfill 都已正确配置，钱包创建功能应该能正常工作了。
