# 📤 推送代码到 GitHub 的详细步骤

## 前提条件

✅ 你已经有 GitHub 账号
✅ 代码已经在本地 Git 仓库中（已完成）

---

## 步骤 1：在 GitHub 创建新仓库

1. 打开浏览器，访问：https://github.com/new

2. 填写仓库信息：
   - **Repository name**: `web3-wallet`（或你喜欢的名字）
   - **Description**: `Multi-chain Web3 wallet application`
   - **Visibility**: 
     - 选择 **Private**（私有，只有你能看到）
     - 或 **Public**（公开，所有人都能看到）
   
3. ⚠️ **重要**：不要勾选以下选项：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
   
   （因为我们已经有这些文件了）

4. 点击绿色按钮 **"Create repository"**

---

## 步骤 2：复制仓库 URL

创建完成后，GitHub 会显示一个页面，上面有仓库的 URL。

URL 格式类似：
```
https://github.com/你的用户名/web3-wallet.git
```

**复制这个 URL**（点击旁边的复制按钮）

---

## 步骤 3：在本地添加远程仓库

打开 PowerShell 或命令行，执行以下命令：

```powershell
# 进入项目目录
cd web3-wallet

# 添加远程仓库（替换下面的 URL 为你复制的 URL）
git remote add origin https://github.com/你的用户名/web3-wallet.git

# 重命名分支为 main
git branch -M main
```

---

## 步骤 4：推送代码

```powershell
# 推送代码到 GitHub
git push -u origin main
```

### 如果遇到认证问题

GitHub 现在需要使用 **Personal Access Token** 而不是密码。

#### 创建 Personal Access Token：

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 填写信息：
   - **Note**: `web3-wallet-deploy`
   - **Expiration**: 选择过期时间（建议 90 days）
   - **Select scopes**: 勾选 **repo**（完整的仓库访问权限）
4. 点击 **"Generate token"**
5. **复制生成的 token**（只会显示一次！）

#### 使用 Token 推送：

当执行 `git push` 时：
- **Username**: 输入你的 GitHub 用户名
- **Password**: 粘贴刚才复制的 Personal Access Token（不是你的 GitHub 密码）

---

## 步骤 5：验证推送成功

推送成功后，你会看到类似的输出：

```
Enumerating objects: 100, done.
Counting objects: 100% (100/100), done.
Delta compression using up to 8 threads
Compressing objects: 100% (90/90), done.
Writing objects: 100% (100/100), 1.5 MiB | 500 KiB/s, done.
Total 100 (delta 10), reused 0 (delta 0)
To https://github.com/你的用户名/web3-wallet.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

刷新你的 GitHub 仓库页面，应该能看到所有代码文件了！

---

## 完整命令参考

如果你已经创建了 GitHub 仓库，这里是完整的命令序列：

```powershell
# 1. 进入项目目录
cd web3-wallet

# 2. 添加远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/web3-wallet.git

# 3. 重命名分支
git branch -M main

# 4. 推送代码
git push -u origin main
```

---

## 常见问题

### Q1: 提示 "remote origin already exists"

**解决方案**：
```powershell
# 删除现有的 origin
git remote remove origin

# 重新添加
git remote add origin https://github.com/YOUR_USERNAME/web3-wallet.git
```

### Q2: 推送时要求输入密码但密码不对

**解决方案**：使用 Personal Access Token 代替密码（见上面的说明）

### Q3: 推送速度很慢

**解决方案**：这是正常的，首次推送需要上传所有文件（约 1.8 MB）

### Q4: 提示 "Permission denied"

**解决方案**：
1. 检查 GitHub 用户名是否正确
2. 检查 Personal Access Token 是否有 repo 权限
3. 确认仓库 URL 是否正确

---

## 推送成功后的下一步

✅ 代码已经在 GitHub 上了！

现在可以：

1. **在 Vercel 部署**：
   - 访问 https://vercel.com/new
   - 导入你的 GitHub 仓库
   - 点击 Deploy

2. **查看仓库**：
   - 访问 https://github.com/你的用户名/web3-wallet
   - 查看代码、提交历史等

3. **继续开发**：
   - 修改代码后，使用 `git add .` → `git commit -m "message"` → `git push`
   - 每次推送都会自动触发 Vercel 部署（配置后）

---

## 需要帮助？

如果遇到问题：
- 查看 GitHub 文档：https://docs.github.com/
- 查看 Git 文档：https://git-scm.com/doc
- 或者在 GitHub 仓库创建 Issue

---

**准备好了吗？现在就开始步骤 1 吧！** 🚀
