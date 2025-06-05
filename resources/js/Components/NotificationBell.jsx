import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Eye, Trash2, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { Link } from "@inertiajs/react";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const dropdownRef = useRef(null);
    const intervalRef = useRef(null);

    // فحص الإشعارات كل 30 ثانية
    useEffect(() => {
        fetchNotifications();

        // بدء الفحص الدوري
        intervalRef.current = setInterval(() => {
            if (!isOpen) {
                // فقط إذا كانت القائمة مغلقة
                fetchNotifications();
            }
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(
                "/api/notifications/unread?limit=10"
            );
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
            setHasMore(response.data.has_more);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/mark-read`);

            // تحديث الحالة المحلية
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId
                        ? {
                              ...n,
                              is_read: true,
                              read_at: new Date().toISOString(),
                          }
                        : n
                )
            );

            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        setIsLoading(true);
        try {
            await axios.post("/api/notifications/mark-all-read");

            // تحديث الحالة المحلية
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    is_read: true,
                    read_at: new Date().toISOString(),
                }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/api/notifications/${notificationId}`);

            // إزالة الإشعار من القائمة
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
            );

            // تقليل العدد إذا كان غير مقروء
            const notification = notifications.find(
                (n) => n.id === notificationId
            );
            if (notification && !notification.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            pulse_received: "💙",
            pulse_liked: "❤️",
            pulse_replied: "💬",
            friend_request: "👥",
            friend_accepted: "🎉",
            circle_invite: "⭕",
            circle_joined: "🔗",
            system_message: "⚙️",
        };
        return icons[type] || "🔔";
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));

        if (diffInMinutes < 1) return "الآن";
        if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `منذ ${diffInDays} يوم`;

        return date.toLocaleDateString("ar-SA");
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            fetchNotifications(); // تحديث عند الفتح
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* جرس الإشعارات */}
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="h-6 w-6" />

                {/* رقم الإشعارات غير المقروءة */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* قائمة الإشعارات المنسدلة */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* رأس القائمة */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            الإشعارات
                        </h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={isLoading}
                                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? "جاري..."
                                        : "تحديد الكل كمقروء"}
                                </button>
                            )}
                            <Link
                                href="/notifications"
                                className="text-sm text-gray-600 hover:text-gray-800"
                                onClick={() => setIsOpen(false)}
                            >
                                عرض الكل
                            </Link>
                        </div>
                    </div>

                    {/* قائمة الإشعارات */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>لا توجد إشعارات جديدة</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors ${
                                            !notification.is_read
                                                ? "bg-blue-50 border-r-4 border-blue-500"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* أيقونة الإشعار */}
                                            <div className="flex-shrink-0">
                                                <span className="text-2xl">
                                                    {getNotificationIcon(
                                                        notification.type
                                                    )}
                                                </span>
                                            </div>

                                            {/* محتوى الإشعار */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        {/* معلومات إضافية */}
                                                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                                                            <span>
                                                                {getTimeAgo(
                                                                    notification.created_at
                                                                )}
                                                            </span>
                                                            {notification.from_user && (
                                                                <span>
                                                                    من:{" "}
                                                                    {
                                                                        notification
                                                                            .from_user
                                                                            .name
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* أزرار الإجراءات */}
                                                    <div className="flex items-center space-x-1 mr-2">
                                                        {!notification.is_read && (
                                                            <button
                                                                onClick={() =>
                                                                    markAsRead(
                                                                        notification.id
                                                                    )
                                                                }
                                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                                title="تحديد كمقروء"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification.id
                                                                )
                                                            }
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                            title="حذف"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* رابط الإجراء */}
                                                {notification.action_url && (
                                                    <div className="mt-2">
                                                        <Link
                                                            href={`/notifications/${notification.id}/open`}
                                                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                            onClick={() =>
                                                                setIsOpen(false)
                                                            }
                                                        >
                                                            عرض التفاصيل
                                                            <Eye className="h-3 w-3 mr-1" />
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* رابط عرض المزيد */}
                    {hasMore && (
                        <div className="p-4 border-t border-gray-200 text-center">
                            <Link
                                href="/notifications"
                                className="text-sm text-blue-600 hover:text-blue-800"
                                onClick={() => setIsOpen(false)}
                            >
                                عرض جميع الإشعارات
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
