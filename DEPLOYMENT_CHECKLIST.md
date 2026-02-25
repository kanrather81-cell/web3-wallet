# ✅ 部署检查清单

## 📋 部署前准备

### 本地准备
- [x] Git 仓库已初始化
- [x] 代码已提交到本地仓库
- [x] README.md 已更新
- [x] 部署文档已创建
- [x] Vercel 配置文件已创建 (vercel.json)
- [x] 环境变量示例文件已创建 (.env.example)
- [x] .gitignore 已配置

### 需要你完成的步骤

#### 步骤 1: 创建 GitHub 仓库 ⏳
- [ ] 访问 https://github.com/new
- [ ] 创建新仓库（建议名称: web3-wallet）
- [ ] 选择 Private 或 Public
- [ ] 不要初始化 README（我们已经有了）

#### 步骤 2: 推送代码到 GitHub ⏳
选择以下方法之一：

**方法 A: 使用快速脚本（推荐）**
```powershell
# Windows PowerShell
cd web3-wallet
.\push-to-github.ps1
```

```bash
# Linux/Mac
cd web3-wallet
bash push-to-github.sh
```

**方法 B: 手动执行**
```bash
cd web3-wallet

# 添加远程仓库（替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送代码
git branch -M main
git push -u origin main
```

#### 步骤 3: 在 Vercel 部署 ⏳
- [ ] 访问 https://vercel.com/new
- [ ] 使用 GitHub 账号登录
- [ ] 点击 "Import Git Repository"
- [ ] 选择你的仓库
- [ ] 确认配置：
  - Framework Preset: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] （可选）添加环境变量
- [ ] 点击 "Deploy"

#### 步骤 4: 等待部署完成 ⏳
- [ ] 等待 2-3 分钟
- [ ] 查看部署日志
- [ ] 获取部署 URL

---

## 🧪 部署后测试

### 基础功能测试
- [ ] 页面能正常加载
- [ ] 没有控制台错误
- [ ] 路由切换正常

### 钱包功能测试
- [ ] 连接钱包按钮可见
- [ ] 能够连接 MetaMask/WalletConnect
- [ ] 能够查看钱包地址
- [ ] 能够断开连接

### 资产页面测试
- [ ] 资产列表显示正常
- [ ] 余额查询正常
- [ ] NFT 画廊加载正常
- [ ] 图表显示正常

### 市场页面测试
- [ ] 币种列表加载正常
- [ ] 价格数据显示正常
- [ ] 搜索功能正常
- [ ] 币种详情页正常

### 兑换页面测试
- [ ] Li.Fi Widget 加载正常
- [ ] 能够选择代币
- [ ] 能够输入金额
- [ ] 兑换流程正常

### DApp 浏览器测试
- [ ] DApp 列表显示正常
- [ ] 能够打开 DApp
- [ ] 收藏功能正常
- [ ] 历史记录正常

### 设置页面测试
- [ ] 语言切换正常（中/英）
- [ ] 设置保存正常
- [ ] 生物识别选项显示（如果支持）

### 性能测试
- [ ] 首屏加载时间 < 3秒
- [ ] 页面切换流畅
- [ ] 虚拟列表滚动流畅
- [ ] 图片懒加载正常

### PWA 测试（移动端）
- [ ] 显示"添加到主屏幕"提示
- [ ] 能够安装为 PWA
- [ ] 离线时显示缓存内容
- [ ] 图标和启动画面正常

### 响应式测试
- [ ] 桌面端显示正常（1920x1080）
- [ ] 平板端显示正常（768x1024）
- [ ] 手机端显示正常（375x667）

### 跨浏览器测试
- [ ] Chrome/Edge 正常
- [ ] Firefox 正常
- [ ] Safari 正常（Mac/iOS）

---

## 🔧 可选配置

### 环境变量配置
如果需要真实 API 数据，在 Vercel Dashboard 添加：

```
VITE_COINGECKO_API_KEY=your_coingecko_api_key
VITE_SIMPLEHASH_API_KEY=your_simplehash_api_key
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**获取 API Keys:**
- CoinGecko: https://www.coingecko.com/en/api
- SimpleHash: https://simplehash.com/
- WalletConnect: https://cloud.walletconnect.com/

### 自定义域名配置
- [ ] 在 Vercel Dashboard 进入项目设置
- [ ] 点击 "Domains"
- [ ] 添加自定义域名
- [ ] 配置 DNS 记录（A 或 CNAME）
- [ ] 等待 SSL 证书生成

### 性能监控
- [ ] 启用 Vercel Analytics
- [ ] 启用 Vercel Speed Insights
- [ ] 配置错误追踪（可选：Sentry）

---

## 📊 部署信息记录

部署完成后，记录以下信息：

```
部署日期: _______________
Vercel URL: _______________
自定义域名: _______________
GitHub 仓库: _______________
部署分支: main
```

---

## 🐛 常见问题排查

### 问题 1: 构建失败
```bash
# 本地测试构建
cd web3-wallet
npm run build

# 查看错误信息并修复
```

### 问题 2: 页面 404
- 检查 vercel.json 是否存在
- 检查 rewrites 配置

### 问题 3: 环境变量不生效
- 确保变量名以 VITE_ 开头
- 在 Vercel 重新部署

### 问题 4: 钱包连接失败
- 检查 WalletConnect Project ID
- 检查网络配置

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 详细文档
2. 查看 [Vercel 文档](https://vercel.com/docs)
3. 查看 [GitHub Issues](https://github.com/vercel/vercel/issues)

---

## 🎉 部署成功！

恭喜！你的 Web3 钱包已成功部署。

**下一步:**
- 分享你的应用 URL
- 邀请用户测试
- 收集反馈并改进
- 持续开发新功能

---

**记住**: 每次推送到 main 分支都会自动触发部署！
