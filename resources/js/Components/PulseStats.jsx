import React, { useState } from "react";
import { usePoll } from "@inertiajs/react";
import { FiActivity, FiUsers, FiHeart, FiTrendingUp } from "react-icons/fi";

const PulseStats = ({ initialStats }) => {
    const [stats, setStats] = useState(initialStats);
    const [isPolling, setIsPolling] = useState(true);

    // تحديث الإحصائيات كل 10 ثوان
    const { stop, start } = usePoll(
        10000,
        {
            only: ["pulseStats"], // فقط تحديث الإحصائيات
            onSuccess: (response) => {
                if (response.props.pulseStats) {
                    setStats(response.props.pulseStats);
                    console.log(
                        "تم تحديث الإحصائيات:",
                        response.props.pulseStats
                    );
                }
            },
            onError: (error) => {
                console.error("خطأ في تحديث الإحصائيات:", error);
            },
        },
        {
            keepAlive: true,
            autoStart: true,
        }
    );

    const togglePolling = () => {
        if (isPolling) {
            stop();
        } else {
            start();
        }
        setIsPolling(!isPolling);
    };

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
            title: "الأصدقاء النشطون",
            value: stats?.activeFriends || 0,
            icon: <FiUsers className="text-green-500" />,
            color: "bg-green-50 border-green-200",
        },
        {
            title: "معدل التفاعل",
            value: `${stats?.engagementRate || 0}%`,
            icon: <FiTrendingUp className="text-purple-500" />,
            color: "bg-purple-50 border-purple-200",
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    إحصائيات النبضات
                </h2>

                <div className="flex items-center gap-3">
                    {/* مؤشر التحديث */}
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                isPolling
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-gray-400"
                            }`}
                        ></div>
                        <span className="text-xs text-gray-500">
                            {isPolling ? "مباشر" : "متوقف"}
                        </span>
                    </div>

                    {/* زر التحكم */}
                    <button
                        onClick={togglePolling}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                            isPolling
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                    >
                        {isPolling ? "إيقاف" : "تشغيل"}
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Last Update */}
            <div className="mt-4 text-xs text-gray-500 text-center">
                آخر تحديث: {new Date().toLocaleTimeString("ar-SA")}
            </div>
        </div>
    );
};

export default PulseStats;
