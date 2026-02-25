# Web3 Wallet - Vercel 部署指南

## 前置准备

### 1. 注册 Vercel 账号
- 访问 [vercel.com](https://vercel.com)
- 使用 GitHub/GitLab/Bitbucket 账号登录
- 免费版足够使用

### 2. 准备 Git 仓库
```bash
# 初始化 Git（如果还没有）
cd web3-wallet
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Web3 Wallet"

# 推送到 GitHub/GitLab
git remote add origin <your-repo-url>
git push -u origin main
```

## 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

#### 1. 导入项目
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择你的 Git 仓库
4. 选择 `web3-wallet` 目录作为根目录

#### 2. 配置项目
- **Framework Preset**: Vite
- **Root Directory**: `web3-wallet`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install --legacy-peer-deps`

#### 3. 配置环境变量
在 "Environment Variables" 部分添加以下变量（可选）：

```
VITE_ETHERSCAN_API_KEY=your_key_here
VITE_POLYGONSCAN_API_KEY=your_key_here
VITE_OPTIMISM_API_KEY=your_key_here
VITE_ARBISCAN_API_KEY=your_key_here
VITE_BASESCAN_API_KEY=your_key_here
VITE_SIMPLEHASH_API_KEY=your_key_here
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**注意**：应用在没有 API Key 的情况下也能正常工作（使用模拟数据）

#### 4. 部署
- 点击 "Deploy" 按钮
- 等待构建完成（约 2-3 分钟）
- 部署成功后会获得一个 `.vercel.app` 域名

### 方法二：通过 Vercel CLI

#### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

#### 2. 登录
```bash
vercel login
```

#### 3. 部署
```bash
cd web3-wallet
vercel
```

按照提示操作：
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- What's your project's name? **web3-wallet**
- In which directory is your code located? **./**
- Want to override the settings? **N**

#### 4. 生产部署
```bash
vercel --prod
```

## 获取 API Keys（可选）

### Etherscan API Keys
1. 访问对应的区块链浏览器：
   - Ethereum: [etherscan.io/apis](https://etherscan.io/apis)
   - Polygon: [polygonscan.com/apis](https://polygonscan.com/apis)
   - Optimism: [optimistic.etherscan.io/apis](https://optimistic.etherscan.io/apis)
   - Arbitrum: [arbiscan.io/apis](https://arbiscan.io/apis)
   - Base: [basescan.org/apis](https://basescan.org/apis)
2. 注册账号并创建 API Key
3. 免费版每秒 5 次请求，足够使用

### SimpleHash API Key
1. 访问 [simplehash.com](https://simplehash.com)
2. 注册账号
3. 创建 API Key
4. 免费版每月 100,000 次请求

### WalletConnect Project ID
1. 访问 [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. 创建新项目
3. 获取 Project ID
4. 免费版无限制

## 配置自定义域名

### 1. 在 Vercel Dashboard 中
1. 进入项目设置
2. 点击 "Domains" 标签
3. 点击 "Add Domain"
4. 输入你的域名（例如：wallet.yourdomain.com）

### 2. 配置 DNS
在你的域名提供商处添加以下记录：

**方式 A：使用 CNAME（推荐）**
```
Type: CNAME
Name: wallet (或 @)
Value: cname.vercel-dns.com
```

**方式 B：使用 A 记录**
```
Type: A
Name: wallet (或 @)
Value: 76.76.21.21
```

### 3. 等待 DNS 生效
- 通常需要 5-30 分钟
- Vercel 会自动配置 SSL 证书

## 环境变量管理

### 在 Vercel Dashboard 中设置
1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加变量：
   - **Name**: 变量名（如 `VITE_ETHERSCAN_API_KEY`）
   - **Value**: 变量值
   - **Environment**: 选择 Production / Preview / Development

### 通过 CLI 设置
```bash
# 设置生产环境变量
vercel env add VITE_ETHERSCAN_API_KEY production

# 查看所有环境变量
vercel env ls

# 删除环境变量
vercel env rm VITE_ETHERSCAN_API_KEY production
```

## 部署后测试清单

### 基础功能测试
- [ ] 页面加载正常
- [ ] 路由跳转正常
- [ ] 语言切换正常（中文/英文）
- [ ] PWA 安装提示出现
- [ ] Service Worker 注册成功

### 资产页面
- [ ] 连接钱包功能正常
- [ ] 多链余额显示正常
- [ ] NFT 画廊加载正常
- [ ] 交易历史显示正常

### 行情页面
- [ ] 币种列表加载正常
- [ ] 搜索功能正常
- [ ] 排序功能正常
- [ ] 价格提醒设置正常
- [ ] 币种详情页正常

### 兑换页面
- [ ] 页面显示正常
- [ ] 外部链接正常

### 发现页面
- [ ] DApp 列表加载正常
- [ ] 搜索和筛选正常
- [ ] 收藏功能正常

### 我的 DApp
- [ ] 收藏夹显示正常
- [ ] 最近访问记录正常

### 浏览器页面
- [ ] 地址栏输入正常
- [ ] 导航按钮正常
- [ ] iframe 加载正常

### 设置页面
- [ ] 语言切换正常
- [ ] 生物识别设置正常（如果支持）
- [ ] 网络管理正常
- [ ] 自定义网络添加正常

### 性能测试
- [ ] Lighthouse 性能分数 > 90
- [ ] 首次内容绘制 < 2 秒
- [ ] 可交互时间 < 3 秒
- [ ] 虚拟列表滚动流畅
- [ ] 图片懒加载正常

### PWA 测试
- [ ] 可以安装到桌面
- [ ] 可以安装到手机
- [ ] 离线访问正常
- [ ] 缓存策略正常
- [ ] 更新提示正常

### 安全测试
- [ ] HTTPS 正常
- [ ] 安全头部正确
- [ ] CSP 策略正确
- [ ] 敏感操作需要确认
- [ ] 生物识别认证正常

## 性能优化建议

### 1. 启用 Vercel Analytics
```bash
npm install @vercel/analytics
```

在 `main.tsx` 中添加：
```typescript
import { Analytics } from '@vercel/analytics/react';

// 在 App 组件中
<Analytics />
```

### 2. 启用 Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

在 `main.tsx` 中添加：
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

// 在 App 组件中
<SpeedInsights />
```

### 3. 配置缓存策略
已在 `vercel.json` 中配置：
- 静态资源：缓存 1 年
- Service Worker：不缓存
- HTML：不缓存

### 4. 启用压缩
Vercel 自动启用 Brotli 和 Gzip 压缩

## 监控和日志

### 查看部署日志
```bash
vercel logs <deployment-url>
```

### 查看实时日志
```bash
vercel logs --follow
```

### 在 Dashboard 中查看
1. 进入项目
2. 点击 "Deployments"
3. 选择部署记录
4. 查看构建日志和运行时日志

## 回滚部署

### 通过 Dashboard
1. 进入 "Deployments"
2. 找到之前的成功部署
3. 点击 "..." → "Promote to Production"

### 通过 CLI
```bash
# 列出所有部署
vercel ls

# 回滚到指定部署
vercel promote <deployment-url>
```

## 常见问题

### Q: 构建失败，提示依赖冲突
**A**: 确保使用 `--legacy-peer-deps` 标志：
```json
{
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Q: 环境变量不生效
**A**: 
1. 确保变量名以 `VITE_` 开头
2. 重新部署项目
3. 检查变量是否设置在正确的环境

### Q: PWA 不能安装
**A**:
1. 确保使用 HTTPS
2. 检查 manifest.webmanifest 是否正确
3. 检查 Service Worker 是否注册成功

### Q: 图片加载失败
**A**:
1. 检查图片 URL 是否正确
2. 检查 CORS 设置
3. 使用 LazyImage 组件

### Q: 路由 404 错误
**A**: 确保 `vercel.json` 中配置了 rewrites：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 成本估算

### Vercel 免费版限制
- ✅ 100 GB 带宽/月
- ✅ 无限部署
- ✅ 自动 HTTPS
- ✅ 自定义域名
- ✅ 边缘网络
- ✅ 分析功能（基础）

### 升级到 Pro 版（$20/月）
- 更多带宽
- 更多团队成员
- 优先支持
- 高级分析

对于个人项目，免费版完全够用！

## 技术支持

- Vercel 文档：[vercel.com/docs](https://vercel.com/docs)
- Vercel 社区：[github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- Vite 文档：[vitejs.dev](https://vitejs.dev)

## 下一步

部署成功后，你可以：
1. 配置自定义域名
2. 启用分析功能
3. 设置 GitHub Actions 自动部署
4. 添加更多功能
5. 优化性能

祝部署顺利！🚀
