import React, { useState, useEffect } from "react";
import { Bell, BellOff, Settings, TestTube } from "lucide-react";
import { usePage } from "@inertiajs/react";
import axios from "axios";

const PushNotifications = () => {
    return null;
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState("default");
    const [vapidKey, setVapidKey] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const { props } = usePage();
    const csrfToken =
        props.csrf_token ||
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content");

    useEffect(() => {
        checkSupport();
        getVapidKey();
        checkSubscriptionStatus();
        checkPermission();
    }, []);

    // تكوين axios instance للإشعارات
    const apiClient = axios.create({
        baseURL: window.location.origin,
        timeout: 10000,
        withCredentials: true, // مهم لإرسال cookies
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    });

    // إضافة CSRF token للطلبات
    useEffect(() => {
        if (csrfToken) {
            apiClient.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
        }
    }, [csrfToken]);

    // فحص دعم المتصفح للإشعارات
    const checkSupport = () => {
        const supported =
            "serviceWorker" in navigator &&
            "PushManager" in window &&
            "Notification" in window;
        setIsSupported(supported);

        if (!supported) {
            setError("متصفحك لا يدعم الإشعارات");
        }
    };

    // الحصول على VAPID key
    const getVapidKey = async () => {
        try {
            const response = await apiClient.get(
                "/api/push-notifications/vapid-key"
            );
            console.log("✅ VAPID Key response:", response.data);
            setVapidKey(response.data.vapid_public_key);
        } catch (error) {
            console.error("❌ Error getting VAPID key:", error);
            setError("فشل في الحصول على مفتاح الإشعارات");
        }
    };

    // فحص حالة الاشتراك
    const checkSubscriptionStatus = async () => {
        try {
            const response = await apiClient.get(
                "/api/push-notifications/status"
            );
            console.log("✅ Subscription status:", response.data);
            setIsSubscribed(response.data.subscribed);
        } catch (error) {
            console.error("❌ Error checking subscription status:", error);
        }
    };

    // فحص صلاحية الإشعارات
    const checkPermission = () => {
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }
    };

    // تسجيل Service Worker
    const registerServiceWorker = async () => {
        if ("serviceWorker" in navigator) {
            try {
                // فحص Service Worker الموجود أولاً
                const existingRegistration =
                    await navigator.serviceWorker.getRegistration("/");

                if (existingRegistration && existingRegistration.active) {
                    console.log(
                        "✅ Using existing service worker:",
                        existingRegistration
                    );
                    return existingRegistration;
                }

                // تسجيل Service Worker جديد فقط إذا لم يكن موجود
                const registration = await navigator.serviceWorker.register(
                    "/sw.js",
                    {
                        scope: "/",
                    }
                );

                // انتظار حتى يصبح Service Worker نشطاً
                if (registration.installing) {
                    await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(
                                new Error("Service Worker installation timeout")
                            );
                        }, 10000); // 10 seconds timeout

                        registration.installing.addEventListener(
                            "statechange",
                            function () {
                                if (
                                    registration.installing?.state ===
                                    "installed"
                                ) {
                                    clearTimeout(timeout);
                                    resolve(registration);
                                } else if (
                                    registration.installing?.state ===
                                    "redundant"
                                ) {
                                    clearTimeout(timeout);
                                    reject(
                                        new Error(
                                            "Service Worker became redundant"
                                        )
                                    );
                                }
                            }
                        );
                    });
                } else if (registration.waiting) {
                    // Service Worker is waiting, activate it
                    registration.waiting.postMessage({ type: "SKIP_WAITING" });
                } else if (!registration.active) {
                    await new Promise((resolve) => {
                        const checkActive = () => {
                            if (registration.active) {
                                resolve(registration);
                            } else {
                                setTimeout(checkActive, 100);
                            }
                        };
                        checkActive();
                    });
                }

                console.log("✅ Service Worker registered:", registration);
                return registration;
            } catch (error) {
                console.error("❌ Service Worker registration failed:", error);
                throw new Error(
                    "فشل في تسجيل Service Worker: " + error.message
                );
            }
        }
        throw new Error("Service Worker غير مدعوم");
    };

    // طلب صلاحية الإشعارات
    const requestPermission = async () => {
        if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            setPermission(permission);
            return permission === "granted";
        }
        return false;
    };

    // تحويل VAPID key إلى Uint8Array
    const urlBase64ToUint8Array = (base64String) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    // الاشتراك في الإشعارات
    const subscribe = async () => {
        if (!isSupported || !vapidKey) {
            setError("الإشعارات غير مدعومة أو مفتاح VAPID غير متوفر");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // طلب الصلاحية
            const hasPermission = await requestPermission();
            if (!hasPermission) {
                throw new Error("تم رفض صلاحية الإشعارات");
            }

            // تسجيل Service Worker
            const registration = await registerServiceWorker();

            // إنشاء اشتراك push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey),
            });

            // إرسال الاشتراك إلى الخادم
            const response = await apiClient.post(
                "/api/push-notifications/subscribe",
                subscription.toJSON()
            );

            if (response.status === 200) {
                setIsSubscribed(true);
                setSuccess("تم تفعيل الإشعارات بنجاح! 🎉");
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error("فشل في حفظ الاشتراك على الخادم");
            }
        } catch (error) {
            console.error("Subscription error:", error);

            // رسائل خطأ أكثر وضوحاً
            let errorMessage = "فشل في تفعيل الإشعارات";

            if (error.message?.includes("denied")) {
                errorMessage =
                    "تم رفض صلاحية الإشعارات. قم بالسماح من إعدادات المتصفح.";
            } else if (error.message?.includes("Service Worker")) {
                errorMessage =
                    "مشكلة في تسجيل Service Worker. جرب إعادة تحميل الصفحة.";
            } else if (error.message?.includes("VAPID")) {
                errorMessage = "مشكلة في إعدادات الخادم. جرب لاحقاً.";
            } else if (error.message?.includes("timeout")) {
                errorMessage = "انتهت مهلة الاتصال. جرب مرة أخرى.";
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // إلغاء الاشتراك
    const unsubscribe = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const registration =
                await navigator.serviceWorker.getRegistration();
            if (registration) {
                const subscription =
                    await registration.pushManager.getSubscription();
                if (subscription) {
                    // إلغاء الاشتراك محلياً
                    await subscription.unsubscribe();

                    // إلغاء الاشتراك على الخادم
                    await apiClient.post(
                        "/api/push-notifications/unsubscribe",
                        {
                            endpoint: subscription.endpoint,
                        }
                    );
                }
            }

            setIsSubscribed(false);
            setSuccess("تم إلغاء الإشعارات بنجاح");
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            console.error("Unsubscribe error:", error);
            setError("فشل في إلغاء الإشعارات");
        } finally {
            setIsLoading(false);
        }
    };

    // إرسال إشعار تجريبي
    const sendTestNotification = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post(
                "/api/push-notifications/test"
            );

            if (response.status === 200) {
                setSuccess("تم إرسال الإشعار التجريبي! تحقق من الإشعارات 📱");
                setTimeout(() => setSuccess(null), 5000);
            } else {
                throw new Error(
                    response.data.message || "فشل في إرسال الإشعار التجريبي"
                );
            }
        } catch (error) {
            console.error("Test notification error:", error);
            setError(
                error.response?.data?.message ||
                    error.message ||
                    "فشل في إرسال الإشعار التجريبي"
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isSupported) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                    <BellOff className="h-5 w-5 text-yellow-600 ml-2" />
                    <p className="text-yellow-800">
                        متصفحك لا يدعم الإشعارات الفورية
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Bell className="h-6 w-6 text-blue-600 ml-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        الإشعارات الفورية
                    </h3>
                </div>
                <div className="flex items-center space-x-2">
                    {isSubscribed && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            مفعل
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">{success}</p>
                </div>
            )}

            <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                    احصل على إشعارات فورية عند وصول نبضات جديدة من أصدقائك
                </p>

                {/* رسالة توضيحية عن طلب الإذن */}
                {!isSubscribed && permission === "default" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-800 text-sm">
                            💡 <strong>ملاحظة:</strong> سيطلب منك المتصفح السماح
                            بالإشعارات عند النقر على "تفعيل". اختر "السماح"
                            لتلقي الإشعارات الفورية.
                        </p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                    {!isSubscribed ? (
                        <button
                            onClick={subscribe}
                            disabled={isLoading || permission === "denied"}
                            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                            ) : (
                                <Bell className="h-4 w-4 ml-2" />
                            )}
                            {isLoading ? "جاري التفعيل..." : "تفعيل الإشعارات"}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={unsubscribe}
                                disabled={isLoading}
                                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                ) : (
                                    <BellOff className="h-4 w-4 ml-2" />
                                )}
                                {isLoading
                                    ? "جاري الإلغاء..."
                                    : "إلغاء الإشعارات"}
                            </button>

                            <button
                                onClick={sendTestNotification}
                                disabled={isLoading}
                                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                ) : (
                                    <TestTube className="h-4 w-4 ml-2" />
                                )}
                                {isLoading ? "جاري الإرسال..." : "إشعار تجريبي"}
                            </button>
                        </>
                    )}
                </div>

                {permission === "denied" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-orange-800 text-sm font-medium mb-2">
                            تم رفض صلاحية الإشعارات
                        </p>
                        <div className="text-orange-700 text-xs space-y-1">
                            <p>
                                <strong>لإعادة التفعيل:</strong>
                            </p>
                            <p>• انقر على أيقونة القفل 🔒 بجانب رابط الموقع</p>
                            <p>• غيّر إعداد "الإشعارات" إلى "السماح"</p>
                            <p>• حدّث الصفحة وجرب مرة أخرى</p>
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>
                            <strong>💡 نصائح مهمة:</strong>
                        </p>
                        <p>• تأكد من السماح للإشعارات عند طلب الإذن</p>
                        <p>• الإشعارات تعمل حتى لو كان التطبيق مغلقاً</p>
                        <p>• يمكنك إلغاء الإشعارات في أي وقت</p>
                        <p>• جرب الإشعار التجريبي للتأكد من عمل النظام</p>
                    </div>
                </div>

                <div className="text-xs text-gray-500">
                    <p>💡 نصيحة: تأكد من السماح للإشعارات في إعدادات المتصفح</p>
                </div>
            </div>
        </div>
    );
};

export default PushNotifications;
