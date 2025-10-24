# Restart Server Script

Write-Host "🔄 Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "✅ Starting server..." -ForegroundColor Green
Set-Location -Path "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "✅ Server restarting!" -ForegroundColor Green
Write-Host "📝 Check the new terminal window for server logs" -ForegroundColor Cyan
Write-Host "📱 Look for: 'SMS service (Fast2SMS): Configured ✅'" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Now test SMS by changing order status in Farmer Dashboard!" -ForegroundColor Green
