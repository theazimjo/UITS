#!/bin/bash
# DigitalOcean Droplet-ga CRM tizimini deploy qilish skripti (Optimallashtirilgan)
# Foydalanish: bash deploy.sh

set -e

echo "========================================"
echo "  CRM Tizimini Production-ga Deploy"
echo "========================================"

# Check for Swap
FREE_SWAP=$(free | grep Swap | awk '{print $2}')
if [ "$FREE_SWAP" -eq "0" ]; then
    echo "⚠️  DIQQAT: Serverda Swap (virtual RAM) aniqlanmadi!"
    echo "1GB RAM-da build qilish uchun swap zarur. Iltimos buni o'qing: deployment_fix_plan.md"
    echo "Davom etishdan oldin swap yaratish tavsiya etiladi."
    sleep 3
fi

# 1. So'nggi kodni olish
echo "[1/5] Git-dan so'nggi versiyani yuklab olish..."
git pull origin main

# 2. Tozalash (Diskda joy ochish)
echo "[2/5] Docker-ni tozalash va joy ochish..."
docker system prune -f --volumes

# 3. Ketma-ket build qilish (Resurslarni tejash uchun)
echo "[3/5] Servislarni ketma-ket build qilish..."

echo "   > Backendni build qilish..."
docker-compose -f docker-compose.prod.yml build backend

echo "   > Frontendni build qilish (bu biroz vaqt olishi mumkin)..."
docker-compose -f docker-compose.prod.yml build frontend

# 4. Servislarni ishga tushirish
echo "[4/5] Yangi imageni build qilib, konteynerni ishga tushirish..."
docker-compose -f docker-compose.prod.yml --env-file .env up -d --no-build

# 5. Natijani tekshirish
echo "[5/5] Konteynern holati:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy muvaffaqiyatli yakunlandi!"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   Backend:  http://$(curl -s ifconfig.me):3000"
