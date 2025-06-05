import React, { useState } from "react";
import { usePoll } from "@inertiajs/react";
import { FiActivity, FiUsers, FiHeart, FiTrendingUp } from "react-icons/fi";

const PulseStats = ({ initialStats }) => {
    const [stats, setStats] = useState(initialStats);

    // تحديث الإحصائيات كل 10 ثوان
    usePoll(
        10000,
        {
            only: ["pulseStats"], // فقط تحديث الإحصائيات
            onSuccess: (response) => {
                if (response.props.pulseStats) {
                    setStats(response.props.pulseStats);
                }
            },
        },
        {
            keepAlive: true,
            autoStart: true,
        }
    );

    const statItems = [
        {
            title: "النبضات المرسلة",
            value: stats?.totalSent || 0,
            icon: <FiActivity className="text-blue-500" />,
            color: "bg-blue-50 border-blue-200",
        },
        {
            title: "النبضات المستقبلة",
            value: stats?.totalReceived || 0,
            icon: <FiHeart className="text-pink-500" />,
            color: "bg-pink-50 border-pink-200",
        },
        {
            title: "غير المقروءة",
            value: stats?.unreadCount || 0,
            icon: <FiActivity className="text-orange-500" />,
            color: "bg-orange-50 border-orange-200",
        },
        {
            title: "معدل التفاعل",
            value: `${stats?.engagementRate || 0}%`,
            icon: <FiTrendingUp className="text-purple-500" />,
            color: "bg-purple-50 border-purple-200",
        },
    ];

    const additionalStats = [
        {
            title: "إجمالي الأصدقاء",
            value: stats?.totalFriends || 0,
            icon: <FiUsers className="text-indigo-500" />,
        },
        {
            title: "الأصدقاء النشطون",
            value: stats?.activeFriends || 0,
            icon: <FiUsers className="text-green-500" />,
        },
        {
            title: "الدوائر",
            value: stats?.circlesCount || 0,
            icon: <FiUsers className="text-pink-500" />,
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Header */}
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    إحصائيات النبضات
                </h2>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {statItems.map((item, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${item.color}`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {item.icon}
                            <span className="text-sm font-medium text-gray-700">
                                {item.title}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional Stats */}
            <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">
                    إحصائيات إضافية
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {additionalStats.map((item, index) => (
                        <div key={index} className="text-center">
                            <div className="flex justify-center mb-2">
                                {item.icon}
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                                {item.value}
                            </div>
                            <div className="text-xs text-gray-600">
                                {item.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PulseStats;
