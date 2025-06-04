import React, { useState } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { router } from "@inertiajs/react";
import {
    FiActivity,
    FiCircle,
    FiHeart,
    FiUsers,
    FiEdit2,
    FiSettings,
    FiLogOut,
    FiAward,
    FiCalendar,
    FiTrendingUp,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { Head } from "@inertiajs/react";

const ProfilePage = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState("activity");

    const stats = [
        {
            id: 1,
            title: "نبضات مرسلة",
            count: "156",
            icon: <FiHeart className="text-pink-500" />,
        },
        {
            id: 2,
            title: "الدوائر",
            count: "5",
            icon: <FiCircle className="text-yellow-400" />,
        },
        {
            id: 3,
            title: "المتابعون",
            count: "23",
            icon: <FiUsers className="text-blue-400" />,
        },
    ];

    const pulseScore = {
        score: 75,
        level: 3,
        nextMilestone: 100,
    };

    const achievements = [
        {
            id: 1,
            title: "نباض نشط",
            description: "أرسلت 100 نبضة",
            icon: <FiAward className="text-yellow-500" />,
        },
        {
            id: 2,
            title: "مؤثر",
            description: "حصلت على 50 متابع",
            icon: <FiTrendingUp className="text-green-500" />,
        },
    ];

    const recentActivities = [
        {
            id: 1,
            type: "pulse",
            title: "آخر نبضة",
            time: "منذ 5 دقائق",
            icon: <FiActivity className="text-primary" />,
        },
        {
            id: 2,
            type: "follower",
            title: "متابع جديد",
            time: "منذ ساعة",
            icon: <FiUsers className="text-blue-400" />,
        },
        {
            id: 3,
            type: "achievement",
            title: "إنجاز جديد",
            time: "منذ يومين",
            icon: <FiAward className="text-yellow-500" />,
        },
    ];

    return (
        <>
            <Head title="الملف الشخصي" />
            <div className="max-w-6xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="relative w-32 h-32 mb-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center text-white text-5xl font-bold">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-primary"
                                        style={{
                                            clipPath: `polygon(0 0, ${
                                                (pulseScore.score /
                                                    pulseScore.nextMilestone) *
                                                100
                                            }% 0, ${
                                                (pulseScore.score /
                                                    pulseScore.nextMilestone) *
                                                100
                                            }% 100%, 0 100%)`,
                                        }}
                                    />
                                </motion.div>

                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {user?.name}
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    {user?.email}
                                </p>

                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark bg-primary/10 p-2 rounded-lg"
                                    >
                                        <FiEdit2 />
                                        <span>تعديل الملف</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            router.post(route("logout"))
                                        }
                                        className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-lg"
                                    >
                                        <FiLogOut />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Achievements Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FiAward className="text-yellow-500" />
                                الإنجازات
                            </h2>
                            <div className="space-y-4">
                                {achievements.map((achievement) => (
                                    <div
                                        key={achievement.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                    >
                                        {achievement.icon}
                                        <div>
                                            <p className="font-medium">
                                                {achievement.title}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {achievement.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats and Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <motion.div
                                    key={stat.id}
                                    className="bg-white rounded-lg shadow-md p-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600">
                                                {stat.title}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-800">
                                                {stat.count}
                                            </p>
                                        </div>
                                        <div className="text-2xl">
                                            {stat.icon}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Activity Tabs */}
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="border-b border-gray-200">
                                <nav className="flex gap-4 p-4">
                                    <button
                                        onClick={() => setActiveTab("activity")}
                                        className={`px-4 py-2 rounded-lg ${
                                            activeTab === "activity"
                                                ? "bg-primary text-white"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        النشاط
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("calendar")}
                                        className={`px-4 py-2 rounded-lg ${
                                            activeTab === "calendar"
                                                ? "bg-primary text-white"
                                                : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        التقويم
                                    </button>
                                </nav>
                            </div>

                            <div className="p-6">
                                {activeTab === "activity" && (
                                    <div className="space-y-4">
                                        {recentActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                            >
                                                {activity.icon}
                                                <div>
                                                    <p className="font-medium">
                                                        {activity.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === "calendar" && (
                                    <div className="text-center py-8">
                                        <FiCalendar className="text-4xl text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">
                                            سيتم إضافة التقويم قريباً
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MainLayout(ProfilePage);
