# Pronunciation Coach — Session Bootstrap
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

Write-Host ""
Write-Host "  Pronunciation Coach - Session Bootstrap" -ForegroundColor Cyan
Write-Host "  ======================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path .git) {
    Write-Host "Recent commits:" -ForegroundColor Yellow
    git log --oneline -5 2>$null
    Write-Host ""
} else {
    Write-Host "(No git repository initialized yet)" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "Backlog status:" -ForegroundColor Yellow
if (Test-Path docs/backlog/README.md) {
    Get-Content docs/backlog/README.md -Head 30
} else {
    Write-Host "  (no backlog yet - run onboarding)"
}
Write-Host ""

Write-Host "Project files check:" -ForegroundColor Yellow
$keyFiles = @(
    ".github/copilot-instructions.md",
    "docs/prd.md",
    "docs/technical-design.md",
    "package.json"
)
foreach ($f in $keyFiles) {
    if (Test-Path $f) {
        Write-Host "  [OK] $f" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $f" -ForegroundColor Red
    }
}
Write-Host ""

if (Test-Path package.json) {
    Write-Host "Build check:" -ForegroundColor Yellow
    npm run build 2>&1 | Select-Object -Last 5
    Write-Host ""
}

Write-Host "Ready. Read docs/backlog/README.md and docs/prd.md first." -ForegroundColor Green
Write-Host "Recommended: Start with F1 (Scaffold) tasks." -ForegroundColor Green
Write-Host ""
