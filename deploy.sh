#!/bin/bash

echo "🚀 بدء عملية النشر..."

# سحب أحدث التحديثات
echo "📥 سحب التحديثات من GitHub..."
git pull origin main

# تحديث Composer dependencies
echo "📦 تحديث Composer packages..."
composer install --no-dev --optimize-autoloader

# تحديث NPM packages وبناء الأصول
echo "🔨 بناء الأصول..."
npm install --production
npm run build

# تشغيل migrations
echo "🗄️ تحديث قاعدة البيانات..."
php artisan migrate --force

# مسح وإعادة بناء cache
echo "🧹 تنظيف وإعادة بناء Cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan storage:link

# إعطاء صلاحيات للمجلدات
echo "🔐 إعداد الصلاحيات..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

echo "✅ تم النشر بنجاح!"
echo "🌐 يمكنك الآن زيارة الموقع"
