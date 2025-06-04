// Service Worker for Web Push Notifications
// نبض - Pulse App

const CACHE_NAME = "pulsse-v1";
const urlsToCache = ["/"];

// تثبيت Service Worker
self.addEventListener("install", (event) => {
    console.log("🔧 Service Worker: Installing...");

    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                console.log("📦 Service Worker: Caching files");
                // استخدام Promise.allSettled بدلاً من addAll لتجنب الأخطاء
                return Promise.allSettled(
                    urlsToCache.map((url) =>
                        cache.add(url).catch((err) => {
                            console.warn("⚠️ Failed to cache:", url, err);
                            return null;
                        })
                    )
                );
            })
            .then(() => {
                console.log("✅ Service Worker: Installation complete");
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error("❌ Service Worker installation failed:", error);
            })
    );
});

// تفعيل Service Worker
self.addEventListener("activate", (event) => {
    console.log("🚀 Service Worker: Activating...");

    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log(
                                "🗑️ Service Worker: Deleting old cache:",
                                cacheName
                            );
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log("✅ Service Worker: Activation complete");
                return self.clients.claim();
            })
    );
});

// استقبال Push Notifications
self.addEventListener("push", (event) => {
    console.log("📨 Service Worker: Push notification received");

    let notificationData = {
        title: "نبض - إشعار جديد",
        body: "لديك إشعار جديد من نبض",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "pulsse-notification",
        data: {
            url: "/",
            timestamp: Date.now(),
        },
        actions: [
            {
                action: "open",
                title: "فتح التطبيق",
                icon: "/favicon.ico",
            },
            {
                action: "close",
                title: "إغلاق",
                icon: "/favicon.ico",
            },
        ],
        requireInteraction: false,
        silent: false,
    };

    // إذا كان هناك بيانات في الإشعار
    if (event.data) {
        try {
            const data = event.data.json();
            console.log("📋 Push data:", data);

            if (data.title) notificationData.title = data.title;
            if (data.body) notificationData.body = data.body;
            if (data.icon) notificationData.icon = data.icon;
            if (data.badge) notificationData.badge = data.badge;
            if (data.tag) notificationData.tag = data.tag;
            if (data.data)
                notificationData.data = {
                    ...notificationData.data,
                    ...data.data,
                };
            if (data.actions) notificationData.actions = data.actions;
            if (data.requireInteraction !== undefined)
                notificationData.requireInteraction = data.requireInteraction;
            if (data.silent !== undefined)
                notificationData.silent = data.silent;
        } catch (error) {
            console.error("❌ Error parsing push data:", error);
        }
    }

    event.waitUntil(
        self.registration
            .showNotification(notificationData.title, notificationData)
            .then(() => {
                console.log("✅ Notification displayed successfully");
            })
            .catch((error) => {
                console.error("❌ Error displaying notification:", error);
            })
    );
});

// التعامل مع النقر على الإشعار
self.addEventListener("notificationclick", (event) => {
    console.log("👆 Service Worker: Notification clicked");

    event.notification.close();

    const action = event.action;
    const notificationData = event.notification.data || {};

    if (action === "close") {
        console.log("🚪 User chose to close notification");
        return;
    }

    // تحديد الرابط المراد فتحه
    let urlToOpen = notificationData.url || "/";

    // إضافة معاملات إضافية للرابط
    if (notificationData.type) {
        const url = new URL(urlToOpen, self.location.origin);
        url.searchParams.set("notification_type", notificationData.type);
        if (notificationData.user_id) {
            url.searchParams.set("user_id", notificationData.user_id);
        }
        urlToOpen = url.toString();
    }

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // البحث عن نافذة مفتوحة بالفعل
                for (const client of clientList) {
                    if (
                        client.url.includes(self.location.origin) &&
                        "focus" in client
                    ) {
                        console.log("🔍 Found existing window, focusing...");
                        return client.focus().then(() => {
                            // إرسال رسالة للنافذة المفتوحة
                            return client.postMessage({
                                type: "NOTIFICATION_CLICKED",
                                data: notificationData,
                            });
                        });
                    }
                }

                // فتح نافذة جديدة إذا لم توجد نافذة مفتوحة
                console.log("🆕 Opening new window:", urlToOpen);
                return clients.openWindow(urlToOpen);
            })
            .catch((error) => {
                console.error("❌ Error handling notification click:", error);
            })
    );
});

// التعامل مع إغلاق الإشعار
self.addEventListener("notificationclose", (event) => {
    console.log("❌ Service Worker: Notification closed");

    // يمكن إضافة تتبع لإحصائيات الإشعارات المغلقة
    const notificationData = event.notification.data || {};

    // إرسال إحصائية إلى الخادم (اختياري)
    if (notificationData.track_close) {
        fetch("/api/notifications/track-close", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                notification_id: notificationData.id,
                closed_at: new Date().toISOString(),
            }),
        }).catch((error) => {
            console.error("❌ Error tracking notification close:", error);
        });
    }
});

// التعامل مع الرسائل من الصفحة الرئيسية
self.addEventListener("message", (event) => {
    console.log("💬 Service Worker: Message received:", event.data);

    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// معالجة الطلبات (Fetch)
self.addEventListener("fetch", (event) => {
    // تطبيق استراتيجية Cache First للملفات الثابتة
    if (
        event.request.destination === "image" ||
        event.request.destination === "style" ||
        event.request.destination === "script"
    ) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

console.log("🎯 Service Worker: Loaded and ready for push notifications!");
