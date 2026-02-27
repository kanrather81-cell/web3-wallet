# Node.js Polyfill 最终修复方案

## 问题描述
使用 OKX SDK 和其他加密库时,浏览器环境缺少 Node.js 模块(buffer, process, stream, util, assert),导致以下错误:
- `(0, assert_1.strict) is not a function`
- `Cannot read properties of undefined (reading 'slice')` (Buffer 相关)
- `Identifier 'Buffer' has already been declared` (重复声明)

## 解决方案

### 使用 vite-plugin-node-polyfills

这是一个专门为 Vite 设计的 Node.js polyfill 插件,比手动配置 esbuild 插件更简单可靠。

### 1. 安装依赖
```bash
npm install --save-dev vite-plugin-node-polyfills --legacy-peer-deps
```

### 2. 更新 vite.config.ts
```typescript
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 启用需要的 Node.js 模块 polyfills
      include: ['buffer', 'process', 'stream', 'util', 'assert'],
      // 全局注入
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    // ... 其他插件
  ],
})
```

### 3. 移除手动导入
从 `src/main.tsx` 中移除所有手动的 polyfill 导入:
```typescript
// ❌ 删除这些
import assert from 'assert';
if (typeof (window as any).assert === 'undefined') {
  (window as any).assert = assert;
}
```

### 4. 移除旧的 esbuild 配置
删除 vite.config.ts 中的:
- `define` 配置
- `resolve.alias` 配置
- `optimizeDeps.esbuildOptions` 配置
- `@esbuild-plugins/node-globals-polyfill` 导入
- `@esbuild-plugins/node-modules-polyfill` 导入

## 优势

1. **更简单**: 一个插件解决所有 polyfill 需求
2. **更可靠**: 专门为 Vite 设计,避免配置冲突
3. **更完整**: 自动处理所有 Node.js 模块的 polyfill
4. **避免重复声明**: 插件内部处理好了 Buffer 等全局变量的注入

## 测试步骤

1. 重启开发服务器:
```bash
npm run dev
```

2. 打开浏览器访问 `http://localhost:5173/`

3. 测试创建钱包功能:
   - 点击"创建钱包"
   - 输入密码
   - 确认密码
   - 点击"创建钱包"按钮

4. 验证所有 4 条链的地址都能成功派生:
   - ✅ Ethereum 地址
   - ✅ Solana 地址
   - ✅ Bitcoin 地址
   - ✅ Tron 地址

## 备份文件
原配置已备份到 `vite.config.ts.backup`,如需回滚可以恢复。

## 相关文件
- `web3-wallet/vite.config.ts` - 新的 Vite 配置
- `web3-wallet/src/main.tsx` - 移除了手动 polyfill 导入
- `web3-wallet/vite.config.ts.backup` - 原配置备份

## 日期
2026-02-26
