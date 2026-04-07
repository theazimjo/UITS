#!/bin/bash
# DigitalOcean Droplet-ga CRM tizimini deploy qilish skripti
# Foydalanish: bash deploy.sh

set -e

echo "========================================"
echo "  CRM Tizimini Production-ga Deploy"
echo "========================================"

# 1. So'nggi kodni olish
echo "[1/4] Git-dan so'nggi versiyani yuklab olish..."
git pull origin main

# 2. Eski konteynerni to'xtatish
echo "[2/4] Eski konteynerni to'xtatish..."
docker-compose -f docker-compose.prod.yml down

# 3. Yangi imageni build qilish va ishga tushirish
echo "[3/4] Yangi imageni build qilib, konteynerni ishga tushirish..."
docker-compose -f docker-compose.prod.yml --env-file .env up --build -d

# 4. Natijani tekshirish
echo "[4/4] Konteynern holati:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy muvaffaqiyatli yakunlandi!"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Backend:  http://$(curl -s ifconfig.me):3000"
