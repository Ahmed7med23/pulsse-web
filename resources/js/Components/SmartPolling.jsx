import React, { useState, useEffect, useRef } from "react";
import { usePoll } from "@inertiajs/react";

const SmartPolling = ({ children, dataKey, onUpdate }) => {
    const [isActive, setIsActive] = useState(true);
    const [pollingInterval, setPollingInterval] = useState(5000); // 5 ثوان افتراضياً
    const lastActivityRef = useRef(Date.now());
    const pollRef = useRef(null);

    // تتبع نشاط المستخدم
    useEffect(() => {
        const updateActivity = () => {
            lastActivityRef.current = Date.now();

            // إذا كان المستخدم نشطاً، قلل فترة التحديث
            if (pollingInterval !== 3000) {
                setPollingInterval(3000); // 3 ثوان للمستخدم النشط
            }
        };

        const events = [
            "mousedown",
            "mousemove",
            "keypress",
            "scroll",
            "touchstart",
        ];
        events.forEach((event) => {
            document.addEventListener(event, updateActivity, true);
        });

        // فحص النشاط كل دقيقة
        const activityChecker = setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivityRef.current;

            if (timeSinceLastActivity > 60000) {
                // دقيقة واحدة
                setPollingInterval(30000); // 30 ثانية للمستخدم غير النشط
            } else if (timeSinceLastActivity > 300000) {
                // 5 دقائق
                setPollingInterval(60000); // دقيقة واحدة للمستخدم الخامل
            }
        }, 60000);

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, updateActivity, true);
            });
            clearInterval(activityChecker);
        };
    }, [pollingInterval]);

    // Polling ذكي
    const { stop, start } = usePoll(
        pollingInterval,
        {
            only: [dataKey],
            onSuccess: (response) => {
                if (onUpdate) {
                    onUpdate(response.props[dataKey]);
                }
            },
            onError: (error) => {
                console.error(`خطأ في تحديث ${dataKey}:`, error);

                // في حالة الخطأ، زيد فترة التحديث
                setPollingInterval((prev) => Math.min(prev * 2, 60000));
            },
        },
        {
            keepAlive: true,
            autoStart: isActive,
        }
    );

    // إيقاف/تشغيل الـ Polling عند تغيير حالة النشاط
    useEffect(() => {
        if (isActive) {
            start();
        } else {
            stop();
        }
    }, [isActive, start, stop]);

    // إعادة تشغيل الـ Polling عند تغيير الفترة الزمنية
    useEffect(() => {
        if (pollRef.current) {
            stop();
            setTimeout(() => start(), 100);
        }
        pollRef.current = true;
    }, [pollingInterval]);

    // تتبع حالة الصفحة (مرئية/مخفية)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setPollingInterval(30000); // بطء التحديث عند إخفاء الصفحة
            } else {
                setPollingInterval(5000); // تسريع التحديث عند إظهار الصفحة
                lastActivityRef.current = Date.now();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, []);

    const getPollingStatus = () => {
        if (!isActive) return { text: "متوقف", color: "text-red-500" };

        if (pollingInterval <= 3000)
            return { text: "سريع", color: "text-green-500" };
        if (pollingInterval <= 10000)
            return { text: "عادي", color: "text-blue-500" };
        return { text: "بطيء", color: "text-yellow-500" };
    };

    const status = getPollingStatus();

    return (
        <div className="relative">
            {/* مؤشر حالة الـ Polling */}
            <div className="absolute top-2 left-2 z-10">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                    <div
                        className={`w-2 h-2 rounded-full ${
                            isActive
                                ? "bg-green-500 animate-pulse"
                                : "bg-gray-400"
                        }`}
                    ></div>
                    <span className={`text-xs font-medium ${status.color}`}>
                        {status.text}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({pollingInterval / 1000}ث)
                    </span>
                </div>
            </div>

            {/* أزرار التحكم */}
            <div className="absolute top-2 right-2 z-10">
                <div className="flex gap-1">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                            isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                    >
                        {isActive ? "⏸️" : "▶️"}
                    </button>

                    <button
                        onClick={() => {
                            setPollingInterval(3000);
                            lastActivityRef.current = Date.now();
                        }}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                        title="تحديث سريع"
                    >
                        ⚡
                    </button>
                </div>
            </div>

            {children}
        </div>
    );
};

export default SmartPolling;
