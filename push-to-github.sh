#!/bin/bash

# 🚀 快速推送到 GitHub 脚本

echo "🔍 检查 Git 状态..."
git status

echo ""
echo "📝 请输入你的 GitHub 用户名："
read github_username

echo ""
echo "📝 请输入仓库名称（默认: web3-wallet）："
read repo_name
repo_name=${repo_name:-web3-wallet}

echo ""
echo "🔗 添加远程仓库..."
git remote add origin https://github.com/$github_username/$repo_name.git

echo ""
echo "🌿 重命名分支为 main..."
git branch -M main

echo ""
echo "📤 推送代码到 GitHub..."
git push -u origin main

echo ""
echo "✅ 完成！"
echo ""
echo "🎉 下一步："
echo "1. 访问 https://vercel.com/new"
echo "2. 导入你的 GitHub 仓库: $github_username/$repo_name"
echo "3. 点击 Deploy"
echo ""
echo "📖 详细步骤请查看 DEPLOYMENT_STEPS.md"
