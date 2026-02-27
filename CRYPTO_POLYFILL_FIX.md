# Crypto Polyfill 和 API 代理修复方案

## 修复的问题

### 1. crypto.randomBytes 不是函数
- **原因**: OKX SDK 依赖 Node.js 的 crypto 模块,浏览器环境不支持
- **解决**: 使用 `crypto-browserify` polyfill 并全局注入

### 2. Tron API CORS/429 错误
- **原因**: 直接从浏览器调用 api.trongrid.io 遇到 CORS 限制和速率限制
- **解决**: 通过 Vite 开发服务器代理转发请求

### 3. Bitcoin SDK fs/path 模块外部化
- **原因**: Bitcoin SDK 依赖 Node.js 的 fs 和 path 模块
- **解决**: 在 vite-plugin-node-polyfills 中添加 fs, path, os 等模块的 polyfill

## 修改内容

### 1. vite.config.ts
```typescript
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // 添加所有需要的 Node.js 模块
      include: ['assert', 'buffer', 'crypto', 'stream', 'path', 'fs', 'os', 'url', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  // 添加 Tron API 代理
  server: {
    proxy: {
      '/trongrid': {
        target: 'https://api.trongrid.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trongrid/, ''),
      },
      '/trongrid-v1': {
        target: 'https://api.trongrid.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trongrid-v1/, '/v1'),
      },
    },
  },
})
```

### 2. src/main.tsx
添加全局 polyfill 注入:
```typescript
import { Buffer } from 'buffer';
import process from 'process';
import crypto from 'crypto-browserify';

(window as any).Buffer = Buffer;
(window as any).process = process;
(window as any).crypto = crypto;
```

### 3. src/lib/chains/tron.ts
更新 API 端点使用本地代理:
```typescript
export const TRON_NETWORKS: Record<string, TronNetworkConfig> = {
  mainnet: {
    fullHost: '/trongrid',  // 使用本地代理
    solidityNode: '/trongrid',
    eventServer: '/trongrid',
    chainId: '0x2b6653dc',
  },
};

const TRON_RPC_ENDPOINTS = [
  '/trongrid',  // 优先使用本地代理
  'https://api.tronstack.io',
  'https://trx.getblock.io/mainnet',
];
```

### 4. 安装的依赖
```bash
npm install --save-dev crypto-browserify --legacy-peer-deps
```

## 工作原理

### Crypto Polyfill
- `vite-plugin-node-polyfills` 自动将 Node.js 的 crypto 模块替换为 `crypto-browserify`
- 在 main.tsx 中全局注入确保所有代码都能访问
- OKX SDK 的 `randomBytes` 等函数现在可以正常工作

### Tron API 代理
- 开发环境: Vite 代理将 `/trongrid` 请求转发到 `https://api.trongrid.io`
- 避免 CORS 问题: 请求从同源发出
- 绕过速率限制: 服务器端请求不受浏览器限制

### Bitcoin SDK Polyfill
- `fs`, `path`, `os` 等模块通过 polyfill 提供浏览器兼容版本
- Bitcoin SDK 可以正常导入和使用

## 测试步骤

1. 启动开发服务器:
```bash
npm run dev
```

2. 打开浏览器访问 `http://localhost:5173/`

3. 测试创建钱包:
   - 点击"创建钱包"
   - 输入密码
   - 点击"创建钱包"按钮
   - 验证所有 4 条链的地址都能成功派生

4. 检查控制台:
   - ✅ 不应该有 `crypto.randomBytes is not a function` 错误
   - ✅ 不应该有 `assert_1.strict is not a function` 错误
   - ✅ Tron API 调用应该成功(通过代理)
   - ✅ Bitcoin SDK 应该正常工作

## 注意事项

### 生产环境部署
在生产环境中,Vite 代理不可用,需要:
1. 使用后端 API 服务器代理 Tron 请求
2. 或者配置 Vercel/Netlify 的 rewrites 规则
3. 或者使用 CORS 代理服务

### Vercel 配置示例
在 `vercel.json` 中添加:
```json
{
  "rewrites": [
    {
      "source": "/trongrid/:path*",
      "destination": "https://api.trongrid.io/:path*"
    }
  ]
}
```

## 相关文件
- `web3-wallet/vite.config.ts` - Vite 配置
- `web3-wallet/src/main.tsx` - 全局 polyfill 注入
- `web3-wallet/src/lib/chains/tron.ts` - Tron API 配置
- `web3-wallet/package.json` - 依赖配置

## 日期
2026-02-26
