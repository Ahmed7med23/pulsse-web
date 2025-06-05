import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import {
    Bell,
    Search,
    Filter,
    Check,
    CheckCheck,
    X,
    Trash2,
    RefreshCw,
    Eye,
    MoreHorizontal,
    Calendar,
    User,
} from "lucide-react";
import axios from "axios";

const NotificationsPage = ({
    notifications: initialNotifications,
    stats = {},
    filters = {},
}) => {
    const [notifications, setNotifications] = useState(
        initialNotifications?.data || []
    );
    const [filteredNotifications, setFilteredNotifications] =
        useState(notifications);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState(filters?.type || "all");
    const [selectedStatus, setSelectedStatus] = useState(
        filters?.status || "all"
    );
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // أنواع الإشعارات
    const notificationTypes = [
        {
            value: "all",
            label: "جميع الإشعارات",
            icon: "🔔",
            count: stats?.total || 0,
        },
        {
            value: "pulse_received",
            label: "نبضات مستقبلة",
            icon: "💙",
            count: stats?.by_type?.pulse_received || 0,
        },
        {
            value: "pulse_liked",
            label: "إعجابات",
            icon: "❤️",
            count: stats?.by_type?.pulse_liked || 0,
        },
        {
            value: "pulse_replied",
            label: "ردود",
            icon: "💬",
            count: stats?.by_type?.pulse_replied || 0,
        },
        {
            value: "friend_request",
            label: "طلبات صداقة",
            icon: "👥",
            count: stats?.by_type?.friend_request || 0,
        },
        {
            value: "friend_accepted",
            label: "صداقات مقبولة",
            icon: "🎉",
            count: stats?.by_type?.friend_accepted || 0,
        },
        {
            value: "system_message",
            label: "رسائل النظام",
            icon: "⚙️",
            count: stats?.by_type?.system_message || 0,
        },
    ];

    // تطبيق الفلاتر والبحث
    useEffect(() => {
        let filtered = notifications;

        // فلترة حسب النوع
        if (selectedType !== "all") {
            filtered = filtered.filter((n) => n.type === selectedType);
        }

        // فلترة حسب الحالة
        if (selectedStatus !== "all") {
            if (selectedStatus === "unread") {
                filtered = filtered.filter((n) => !n.is_read);
            } else if (selectedStatus === "read") {
                filtered = filtered.filter((n) => n.is_read);
            }
        }

        // البحث في المحتوى
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (n) =>
                    n.title
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    n.message
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (n.from_user?.name &&
                        n.from_user.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()))
            );
        }

        setFilteredNotifications(filtered);
    }, [notifications, selectedType, selectedStatus, searchQuery]);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/api/notifications/${notificationId}/mark-read`);

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
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            await axios.post("/api/notifications/mark-all-read");

            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    is_read: true,
                    read_at: new Date().toISOString(),
                }))
            );
        } catch (error) {
            console.error("Error marking all as read:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/api/notifications/${notificationId}`);
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
            );
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    const toggleSelectNotification = (notificationId) => {
        setSelectedNotifications((prev) =>
            prev.includes(notificationId)
                ? prev.filter((id) => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const selectAllNotifications = () => {
        setSelectedNotifications(filteredNotifications.map((n) => n.id));
    };

    const clearSelection = () => {
        setSelectedNotifications([]);
    };

    const deleteSelectedNotifications = async () => {
        try {
            await Promise.all(
                selectedNotifications.map((id) =>
                    axios.delete(`/api/notifications/${id}`)
                )
            );

            setNotifications((prev) =>
                prev.filter((n) => !selectedNotifications.includes(n.id))
            );
            setSelectedNotifications([]);
        } catch (error) {
            console.error("Error deleting selected notifications:", error);
        }
    };

    const getNotificationIcon = (type) => {
        const typeData = notificationTypes.find((t) => t.value === type);
        return typeData?.icon || "🔔";
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

    const refreshNotifications = () => {
        router.reload();
    };

    return (
        <MainLayout>
            <Head title="الإشعارات" />

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Bell className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                الإشعارات
                            </h1>
                            <p className="text-sm text-gray-600">
                                {stats?.unread || 0} إشعار غير مقروء من أصل{" "}
                                {stats?.total || 0}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={refreshNotifications}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                            title="تحديث"
                        >
                            <RefreshCw className="h-5 w-5" />
                        </button>

                        {stats?.unread > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={isLoading}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isLoading ? "جاري..." : "تحديد الكل كمقروء"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="البحث في الإشعارات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Filter className="h-4 w-4" />
                            فلترة
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            {/* Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع الإشعار
                                </label>
                                <select
                                    value={selectedType}
                                    onChange={(e) =>
                                        setSelectedType(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {notificationTypes.map((type) => (
                                        <option
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.icon} {type.label} (
                                            {type.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    حالة القراءة
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) =>
                                        setSelectedStatus(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">جميع الإشعارات</option>
                                    <option value="unread">غير مقروءة</option>
                                    <option value="read">مقروءة</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selection Actions */}
                {selectedNotifications.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-800">
                                تم تحديد {selectedNotifications.length} إشعار
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={deleteSelectedNotifications}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                    حذف المحدد
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                                >
                                    إلغاء التحديد
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا توجد إشعارات
                            </h3>
                            <p className="text-gray-600">
                                {searchQuery ||
                                selectedType !== "all" ||
                                selectedStatus !== "all"
                                    ? "لم يتم العثور على إشعارات تطابق المعايير المحددة"
                                    : "لا توجد إشعارات حتى الآن"}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${
                                    !notification.is_read
                                        ? "border-r-4 border-blue-500 bg-blue-50/30"
                                        : ""
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Selection Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedNotifications.includes(
                                            notification.id
                                        )}
                                        onChange={() =>
                                            toggleSelectNotification(
                                                notification.id
                                            )
                                        }
                                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    {/* Notification Icon */}
                                    <div className="flex-shrink-0">
                                        <span className="text-3xl">
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {notification.title ||
                                                        "إشعار"}
                                                </h3>
                                                <p className="text-gray-700 mb-3 leading-relaxed">
                                                    {notification.message ||
                                                        "لا توجد رسالة"}
                                                </p>

                                                {/* Meta Information */}
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {getTimeAgo(
                                                                notification.created_at
                                                            )}
                                                        </span>
                                                    </div>

                                                    {notification.from_user
                                                        ?.name && (
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            <span>
                                                                من:{" "}
                                                                {
                                                                    notification
                                                                        .from_user
                                                                        .name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}

                                                    {!notification.is_read && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            جديد
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 mr-4">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification.id
                                                            )
                                                        }
                                                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                        title="تحديد كمقروء"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}

                                                {notification.action_url &&
                                                    notification.action_url !==
                                                        null && (
                                                        <Link
                                                            href={`/notifications/${notification.id}/open`}
                                                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                                                            title="فتح"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    )}

                                                <button
                                                    onClick={() =>
                                                        deleteNotification(
                                                            notification.id
                                                        )
                                                    }
                                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                    title="حذف"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {notification.action_url &&
                                            notification.action_url !==
                                                null && (
                                                <div className="mt-4">
                                                    <Link
                                                        href={`/notifications/${notification.id}/open`}
                                                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4 ml-2" />
                                                        عرض التفاصيل
                                                    </Link>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {initialNotifications?.links &&
                    initialNotifications.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center gap-2">
                                {initialNotifications.links.map(
                                    (link, index) => {
                                        if (!link.url && !link.active) {
                                            return (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            );
                                        }

                                        return link.active ? (
                                            <span
                                                key={index}
                                                className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        ) : (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className="px-3 py-2 text-sm rounded-lg bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}
            </div>
        </MainLayout>
    );
};

export default NotificationsPage;
