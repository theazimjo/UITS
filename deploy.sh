#!/bin/bash
# DigitalOcean Droplet-ga CRM tizimini deploy qilish skripti (Optimallashtirilgan & Tezkor)
# Foydalanish: bash deploy.sh [--force]

set -e

echo "========================================"
echo "  CRM Tizimini Production-ga Deploy"
echo "========================================"

# Force flag
FORCE_BUILD=false
if [ "$1" == "--force" ]; then
    FORCE_BUILD=true
    echo "🔄 Force-build rejimi faollashtirildi!"
fi

# Check for Swap
FREE_SWAP=$(free | grep Swap | awk '{print $2}')
if [ "$FREE_SWAP" -eq "0" ]; then
    echo "⚠️  DIQQAT: Serverda Swap (virtual RAM) aniqlanmadi!"
    echo "1GB RAM-da build qilish uchun swap zarur."
    sleep 2
fi

# Load environment variables to read JWT_SECRET
if [ -f .env ]; then
    # Parse env variables safely
    export $(grep -v '^#' .env | xargs 2>/dev/null || true)
fi
SECRET_TOKEN=${JWT_SECRET:-"your_super_secret_jwt_key_change_this_in_production"}
BACKEND_PORT=${DB_PORT:-3000} # Fallback port

echo "🚧 [Maintenance] Signaling backend to start maintenance mode..."
curl -s -X POST -H "Authorization: Bearer $SECRET_TOKEN" "http://localhost:3000/system/maintenance/start" || true

# 1. So'nggi commitni olish va git pull
echo "[1/5] Git-dan so'nggi versiyani yuklab olish..."

# Oxirgi muvaffaqiyatli deploy qilingan commitni aniqlash
PREV_COMMIT=""
if [ -f .last_deployed_commit ]; then
    PREV_COMMIT=$(cat .last_deployed_commit)
    echo "📝 Oxirgi muvaffaqiyatli deploy commit: $PREV_COMMIT"
else
    # Agar fayl bo'lmasa, git log-dan olishga harakat qilamiz
    PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")
fi

git pull origin main

CURRENT_COMMIT=$(git rev-parse HEAD)
echo "🚀 Yangi versiya commit: $CURRENT_COMMIT"

# Android papkasini o'chirish (Serverda kerak emas)
if [ -d "android" ]; then
    rm -rf android
fi

# 2. Qaysi qismlar o'zgarganini aniqlash
BUILD_BACKEND=false
BUILD_FRONTEND=false
BUILD_CERT=false

if [ "$FORCE_BUILD" = true ] || [ -z "$PREV_COMMIT" ] || [ "$PREV_COMMIT" == "$CURRENT_COMMIT" ]; then
    # Agar majburiy bo'lsa yoki oldingi commit bo'lmasa, hammasini quramiz
    BUILD_BACKEND=true
    BUILD_FRONTEND=true
    BUILD_CERT=true
else
    echo "🔍 O'zgarishlarni tekshirish..."
    CHANGED_FILES=$(git diff --name-only "$PREV_COMMIT" "$CURRENT_COMMIT" || echo "all")
    
    if [ "$CHANGED_FILES" == "all" ]; then
        BUILD_BACKEND=true
        BUILD_FRONTEND=true
        BUILD_CERT=true
    else
        echo "$CHANGED_FILES" | grep -q "^backend/" && BUILD_BACKEND=true || true
        echo "$CHANGED_FILES" | grep -q "^frontend/" && BUILD_FRONTEND=true || true
        echo "$CHANGED_FILES" | grep -q "^web-sertificate/" && BUILD_CERT=true || true
        
        # Agar docker-compose yoki deploy skriptlari o'zgargan bo'lsa hammasini yangilaymiz
        if echo "$CHANGED_FILES" | grep -qE "(docker-compose|deploy\.sh|\.env)"; then
            BUILD_BACKEND=true
            BUILD_FRONTEND=true
            BUILD_CERT=true
        fi
    fi
fi

echo "📊 Build rejalari:"
echo "   - Backend:      $BUILD_BACKEND"
echo "   - Frontend:     $BUILD_FRONTEND"
echo "   - Certificate:  $BUILD_CERT"
echo "========================================"

# 3. Ketma-ket build qilish (konteynerlar ishlab turganda!)
echo "[2/5] Servislarni ketma-ket build qilish..."

if [ "$BUILD_BACKEND" = true ]; then
    echo "🐳 Backendni build qilish..."
    docker compose -f docker-compose.prod.yml build backend
fi

if [ "$BUILD_FRONTEND" = true ]; then
    echo "🐳 Frontendni build qilish (bu biroz vaqt olishi mumkin)..."
    docker compose -f docker-compose.prod.yml build frontend
fi

if [ "$BUILD_CERT" = true ]; then
    echo "🐳 Sertifikat servisini build qilish..."
    docker compose -f docker-compose.prod.yml build certificate
fi

# 4. Yangi konteynerlarni ishga tushirish (Zero-Downtime roll-out)
# down qilmaymiz, chunki ishlab turgan konteynerlar o'chib qolmasligi kerak.
# faqat yangilanganlarini recreate qilamiz.
echo "[3/5] Yangilangan konteynerlarni qayta ishga tushirish..."
docker compose -f docker-compose.prod.yml --env-file .env up -d --no-build

# 5. Konteynerlar holati va tozalash
echo "[4/5] Eski ortiqcha Docker fayllarini tozalash..."
docker system prune -f

echo "[5/5] Konteynerlar holati:"
docker compose -f docker-compose.prod.yml ps

# Oxirgi commitni saqlab qo'yish
echo "$CURRENT_COMMIT" > .last_deployed_commit

echo "✅ [Maintenance] Signaling backend to end maintenance mode..."
sleep 3
curl -s -X POST -H "Authorization: Bearer $SECRET_TOKEN" "http://localhost:3000/system/maintenance/end" || true

echo ""
echo "✅ Deploy muvaffaqiyatli yakunlandi!"
echo "   Frontend:    http://$(curl -s ifconfig.me || echo 'localhost')"
echo "   Backend:     http://$(curl -s ifconfig.me || echo 'localhost'):3000"
echo "   Sertifikat:  http://$(curl -s ifconfig.me || echo 'localhost'):8000"
