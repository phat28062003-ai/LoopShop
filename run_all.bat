@echo off
title Khoi dong VidCommerce (TikTok + Shopee Video)
echo ========================================================
echo   KHOI DONG HE THONG VIDCOMMERCE (BACKEND + FRONTEND)
echo ========================================================
echo.
echo Dang khoi dong Django Backend (Port 8000)...
start "VidCommerce Backend" cmd /c "cd /d %~dp0backend && .\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

echo Dang khoi dong React Frontend (Port 5173)...
start "VidCommerce Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo He thong da khoi dong thanh cong!
echo - Ung dung Web & PWA:  http://localhost:5173
echo - Backend REST API:     http://127.0.0.1:8000/api/
echo - Django Admin:         http://127.0.0.1:8000/admin/
echo   Tai khoan admin: phat / phat123456
echo ========================================================
pause
