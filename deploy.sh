#!/bin/bash

# Web3 Wallet - Vercel 部署脚本

echo "🚀 Web3 Wallet - Vercel 部署"
echo "================================"
echo ""

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI 未安装"
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI 已就绪"
echo ""

# 检查是否已登录
echo "🔐 检查登录状态..."
if ! vercel whoami &> /dev/null
then
    echo "📝 请登录 Vercel..."
    vercel login
fi

echo "✅ 已登录"
echo ""

# 构建测试
echo "🔨 测试构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败，请检查错误"
    exit 1
fi

echo ""

# 询问部署类型
echo "📦 选择部署类型："
echo "1) 预览部署 (Preview)"
echo "2) 生产部署 (Production)"
read -p "请选择 (1/2): " deploy_type

echo ""

if [ "$deploy_type" = "2" ]; then
    echo "🚀 开始生产部署..."
    vercel --prod
else
    echo "🚀 开始预览部署..."
    vercel
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "📋 后续步骤："
    echo "1. 在 Vercel Dashboard 中配置环境变量"
    echo "2. 配置自定义域名（可选）"
    echo "3. 测试所有功能"
    echo "4. 查看 DEPLOYMENT.md 了解更多"
else
    echo ""
    echo "❌ 部署失败"
    exit 1
fi
