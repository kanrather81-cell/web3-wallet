# 🚀 快速推送到 GitHub 脚本 (PowerShell)

Write-Host "🔍 检查 Git 状态..." -ForegroundColor Cyan
git status

Write-Host ""
$github_username = Read-Host "📝 请输入你的 GitHub 用户名"

Write-Host ""
$repo_name = Read-Host "📝 请输入仓库名称（默认: web3-wallet）"
if ([string]::IsNullOrWhiteSpace($repo_name)) {
    $repo_name = "web3-wallet"
}

Write-Host ""
Write-Host "🔗 添加远程仓库..." -ForegroundColor Cyan
git remote add origin "https://github.com/$github_username/$repo_name.git"

Write-Host ""
Write-Host "🌿 重命名分支为 main..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "📤 推送代码到 GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "✅ 完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 下一步：" -ForegroundColor Yellow
Write-Host "1. 访问 https://vercel.com/new"
Write-Host "2. 导入你的 GitHub 仓库: $github_username/$repo_name"
Write-Host "3. 点击 Deploy"
Write-Host ""
Write-Host "📖 详细步骤请查看 DEPLOYMENT_STEPS.md" -ForegroundColor Cyan
