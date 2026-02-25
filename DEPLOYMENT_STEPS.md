# 🚀 部署步骤指南

## ✅ 已完成
- [x] Git 仓库初始化
- [x] 代码已提交到本地仓库
- [x] Vercel 配置文件已创建

## 📋 接下来的步骤

### 方案 A: 使用 GitHub + Vercel Dashboard（推荐）

#### 1. 创建 GitHub 仓库
访问 https://github.com/new 创建一个新仓库

**仓库设置建议：**
- 仓库名称：`web3-wallet` 或 `multi-chain-wallet`
- 可见性：Private（推荐）或 Public
- 不要初始化 README、.gitignore 或 license（我们已经有了）

#### 2. 推送代码到 GitHub

在 `web3-wallet` 目录下运行以下命令：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/web3-wallet.git

# 推送代码
git branch -M main
git push -u origin main
```

**如果遇到认证问题：**
- 使用 GitHub Personal Access Token
- 或者使用 SSH key
- 参考：https://docs.github.com/en/authentication

#### 3. 在 Vercel 导入项目

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你刚创建的 GitHub 仓库
4. Vercel 会自动检测到这是一个 Vite 项目
5. 配置如下：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. （可选）添加环境变量：
   ```
   VITE_COINGECKO_API_KEY=your_api_key_here
   VITE_SIMPLEHASH_API_KEY=your_api_key_here
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```
   
7. 点击 "Deploy"

#### 4. 等待部署完成
- 首次部署通常需要 2-3 分钟
- 部署成功后，Vercel 会提供一个 URL（如：`https://web3-wallet-xxx.vercel.app`）

---

### 方案 B: 使用 Vercel CLI（命令行）

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

在 `web3-wallet` 目录下运行：

```bash
# 首次部署（会询问一些配置问题）
vercel

# 或者直接部署到生产环境
vercel --prod
```

**CLI 会询问的问题：**
1. Set up and deploy? → Yes
2. Which scope? → 选择你的账户
3. Link to existing project? → No
4. What's your project's name? → web3-wallet
5. In which directory is your code located? → ./
6. Want to override the settings? → No

---

## 🔧 部署后配置

### 1. 配置自定义域名（可选）
1. 在 Vercel Dashboard 进入项目设置
2. 点击 "Domains"
3. 添加你的域名
4. 按照提示配置 DNS 记录

### 2. 配置环境变量（可选）
1. 在 Vercel Dashboard 进入项目设置
2. 点击 "Environment Variables"
3. 添加以下变量：
   - `VITE_COINGECKO_API_KEY`
   - `VITE_SIMPLEHASH_API_KEY`
   - `VITE_WALLETCONNECT_PROJECT_ID`

### 3. 启用自动部署
- 推送到 `main` 分支会自动触发生产部署
- 推送到其他分支会创建预览部署

---

## 📱 测试部署

部署成功后，访问 Vercel 提供的 URL，测试以下功能：

- [ ] 页面加载正常
- [ ] 连接钱包功能
- [ ] 查看资产余额
- [ ] 市场行情显示
- [ ] 代币兑换功能
- [ ] DApp 浏览器
- [ ] 语言切换（中英文）
- [ ] PWA 安装提示（移动端）
- [ ] 响应式布局（手机/平板/桌面）

---

## 🐛 常见问题

### 问题 1: 构建失败
**解决方案：**
```bash
# 本地测试构建
cd web3-wallet
npm run build

# 如果失败，检查错误信息并修复
```

### 问题 2: 环境变量未生效
**解决方案：**
- 确保变量名以 `VITE_` 开头
- 在 Vercel Dashboard 重新部署项目

### 问题 3: 路由 404 错误
**解决方案：**
- 确保 `vercel.json` 文件存在
- 检查 rewrites 配置是否正确

### 问题 4: API 调用失败
**解决方案：**
- 应用会使用模拟数据，无需 API key 也能运行
- 如需真实数据，配置相应的 API keys

---

## 📚 相关文档

- [Vercel 部署文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [GitHub 认证设置](https://docs.github.com/en/authentication)

---

## 💡 下一步

部署成功后，你可以：

1. **分享应用**：将 Vercel URL 分享给其他人测试
2. **配置域名**：绑定自己的域名
3. **监控性能**：使用 Vercel Analytics
4. **持续开发**：推送新代码会自动部署

---

## 🎉 快速命令参考

```bash
# 推送代码到 GitHub
git add .
git commit -m "Update: description"
git push

# 使用 Vercel CLI 部署
cd web3-wallet
vercel --prod

# 查看部署日志
vercel logs

# 查看项目信息
vercel inspect
```

---

**需要帮助？** 查看 `DEPLOYMENT.md` 获取更详细的部署说明。
