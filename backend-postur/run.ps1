Set-Location $PSScriptRoot
if (Test-Path ".\venv\Scripts\uvicorn.exe") {
    Write-Host "[INFO] Menjalankan backend menggunakan venv (Python 3.10)..." -ForegroundColor Green
    & ".\venv\Scripts\uvicorn.exe" main:app --reload --host 127.0.0.1 --port 8000
} else {
    Write-Host "[ERROR] Virtual environment venv tidak ditemukan!" -ForegroundColor Red
}
