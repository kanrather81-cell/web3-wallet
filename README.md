# 🌐 Multi-Chain Web3 Wallet

一个功能完整的多链 Web3 钱包应用，支持以太坊、BSC、Polygon、Arbitrum、Optimism、Solana 等多条区块链。

## ✨ 主要功能

### 💰 资产管理
- 多链资产查看和管理
- 实时余额更新
- NFT 画廊展示
- 资产图表可视化

### 📊 市场行情
- 实时加密货币价格
- 24小时价格变化
- 市值排名
- 价格图表（集成 ECharts）
- 价格提醒功能

### 🔄 代币兑换
- 集成 Li.Fi Widget
- 跨链桥接
- 最优路由选择
- 滑点保护

### 🌍 DApp 浏览器
- 内置 DApp 浏览器
- 收藏夹管理
- 历史记录
- 热门 DApp 推荐

### 🔐 安全功能
- 交易确认对话框
- 敏感操作二次确认
- 生物识别认证（Touch ID/Face ID/Windows Hello）
- 交易失败自动重试
- 滑点保护

### 🌍 国际化
- 中文 / English
- 自动语言检测
- 本地存储偏好设置

### ⚡ 性能优化
- 虚拟列表（处理大量交易和 NFT）
- 图片懒加载
- 路由级代码分割
- PWA 支持（可安装到手机）
- Service Worker 缓存

## 🛠️ 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **区块链**: wagmi 3 + viem 2 + ethers 6
- **状态管理**: Zustand
- **路由**: React Router 7
- **UI 组件**: Tailwind CSS + shadcn/ui + Radix UI
- **图表**: ECharts
- **国际化**: i18next
- **API**: CoinGecko, SimpleHash
- **PWA**: vite-plugin-pwa

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📦 部署到 Vercel

### 方法 1: GitHub + Vercel Dashboard（推荐）

1. 创建 GitHub 仓库并推送代码：
```bash
# 使用快速脚本（Windows）
.\push-to-github.ps1

# 或手动执行
git remote add origin https://github.com/YOUR_USERNAME/web3-wallet.git
git branch -M main
git push -u origin main
```

2. 访问 https://vercel.com/new
3. 导入你的 GitHub 仓库
4. 点击 Deploy

### 方法 2: Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
npm run deploy:prod
```

详细部署步骤请查看 [DEPLOYMENT_STEPS.md](./DEPLOYMENT_STEPS.md)

## 🔧 环境变量（可选）

创建 `.env` 文件：

```env
# CoinGecko API（可选，无 key 时使用模拟数据）
VITE_COINGECKO_API_KEY=your_api_key_here

# SimpleHash API（可选，用于 NFT 数据）
VITE_SIMPLEHASH_API_KEY=your_api_key_here

# WalletConnect Project ID（可选）
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**注意**: 应用在没有 API key 的情况下也能正常运行，会使用模拟数据。

## 📱 支持的链

- Ethereum (ETH)
- BNB Smart Chain (BSC)
- Polygon (MATIC)
- Arbitrum (ARB)
- Optimism (OP)
- Avalanche (AVAX)
- Base
- Solana (SOL)

## 🎨 主要页面

- `/` - 资产页面
- `/market` - 市场行情
- `/market/:coinId` - 币种详情
- `/swap` - 代币兑换
- `/discover` - DApp 发现
- `/dapps` - 我的 DApps
- `/browser` - DApp 浏览器
- `/settings` - 设置

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关文档

- [部署步骤](./DEPLOYMENT_STEPS.md)
- [详细部署指南](./DEPLOYMENT.md)
- [Vercel 部署摘要](./VERCEL_DEPLOYMENT_SUMMARY.md)

---

**Built with ❤️ using React + TypeScript + Vite**
