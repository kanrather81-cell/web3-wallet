# Web3 Wallet - Vercel 部署脚本 (PowerShell)

Write-Host "🚀 Web3 Wallet - Vercel 部署" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了 Vercel CLI
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI 未安装" -ForegroundColor Red
    Write-Host "📦 正在安装 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

Write-Host "✅ Vercel CLI 已就绪" -ForegroundColor Green
Write-Host ""

# 检查是否已登录
Write-Host "🔐 检查登录状态..." -ForegroundColor Yellow
$loginCheck = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "📝 请登录 Vercel..." -ForegroundColor Yellow
    vercel login
}

Write-Host "✅ 已登录" -ForegroundColor Green
Write-Host ""

# 构建测试
Write-Host "🔨 测试构建..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 构建成功" -ForegroundColor Green
} else {
    Write-Host "❌ 构建失败，请检查错误" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 询问部署类型
Write-Host "📦 选择部署类型：" -ForegroundColor Cyan
Write-Host "1) 预览部署 (Preview)"
Write-Host "2) 生产部署 (Production)"
$deployType = Read-Host "请选择 (1/2)"

Write-Host ""

if ($deployType -eq "2") {
    Write-Host "🚀 开始生产部署..." -ForegroundColor Yellow
    vercel --prod
} else {
    Write-Host "🚀 开始预览部署..." -ForegroundColor Yellow
    vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 后续步骤：" -ForegroundColor Cyan
    Write-Host "1. 在 Vercel Dashboard 中配置环境变量"
    Write-Host "2. 配置自定义域名（可选）"
    Write-Host "3. 测试所有功能"
    Write-Host "4. 查看 DEPLOYMENT.md 了解更多"
} else {
    Write-Host ""
    Write-Host "❌ 部署失败" -ForegroundColor Red
    exit 1
}
