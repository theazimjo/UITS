#!/bin/bash

# Loyihani yangilash va qayta ishga tushirish skripti
echo "🚀 Deployment boshlandi..."

# 1. Eng so'nggi kodni tortish
git pull origin main

# 2. Konteynerlarni build qilish va ishga tushirish
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Eski (ishlatilmayotgan) image-larni tozalash
docker image prune -f

echo "✅ Loyiha muvaffaqiyatli yangilandi!"
