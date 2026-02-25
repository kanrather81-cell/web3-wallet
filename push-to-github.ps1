# Push to GitHub Script (PowerShell)

Write-Host "Checking Git status..." -ForegroundColor Cyan
git status

Write-Host ""
$github_username = Read-Host "Enter your GitHub username"

Write-Host ""
$repo_name = Read-Host "Enter repository name (default: web3-wallet)"
if ([string]::IsNullOrWhiteSpace($repo_name)) {
    $repo_name = "web3-wallet"
}

Write-Host ""
Write-Host "Adding remote repository..." -ForegroundColor Cyan
git remote add origin "https://github.com/$github_username/$repo_name.git"

Write-Host ""
Write-Host "Renaming branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host ""
Write-Host "Pushing code to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit https://vercel.com/new"
Write-Host "2. Import your GitHub repository: $github_username/$repo_name"
Write-Host "3. Click Deploy"
Write-Host ""
Write-Host "For detailed steps, see DEPLOYMENT_STEPS.md" -ForegroundColor Cyan
