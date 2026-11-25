@echo off
cd /d "%~dp0"
if exist "venv\Scripts\uvicorn.exe" (
    echo [INFO] Menjalankan backend menggunakan venv (Python 3.10)...
    "venv\Scripts\uvicorn.exe" main:app --reload --host 127.0.0.1 --port 8000
) else (
    echo [ERROR] Virtual environment venv tidak ditemukan!
    pause
)
