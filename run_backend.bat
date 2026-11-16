@echo off
title VidCommerce - Django Backend
cd /d %~dp0backend
echo Dang khoi dong Django Backend tren http://127.0.0.1:8000 ...
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
pause
