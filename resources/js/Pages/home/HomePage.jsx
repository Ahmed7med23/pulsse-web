import React, { useState } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { FiActivity, FiCircle, FiHeart, FiUsers } from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";

import { motion } from "framer-motion";
import { useAuth } from "../../Contexts/AuthContext";
import { Head, usePage } from "@inertiajs/react";
import PulseCard from "./PulseCard";
function Home() {
    // const breakpoint = useBreakpoint(); // Removed as useBreakpoint was deleted
    const [stores, setStores] = useState(0);
    const data = usePage();

    const pulses = [
        {
            id: 1,
            user: {
                name: "سارة أحمد",
                avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            },
            message: "أرسلت لك نبضة خاصة",
            timeAgo: "منذ 5 دقائق",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: false },
                { icon: "😊", active: false },
                { icon: "❤️", active: true },
            ],
            influence: 85,
        },
        {
            id: 2,
            user: {
                name: "محمد علي",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            },
            message: "أحببت منشورك الأخير!",
            timeAgo: "منذ 10 دقائق",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: true },
                { icon: "😊", active: false },
                { icon: "❤️", active: false },
            ],
            influence: 72,
        },
        {
            id: 3,
            user: {
                name: "ليلى حسن",
                avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            },
            message: "أرسلت لك دعوة صداقة",
            timeAgo: "منذ 15 دقيقة",
            reactions: [
                { icon: "🙏", active: true },
                { icon: "✨", active: false },
                { icon: "😊", active: false },
                { icon: "❤️", active: false },
            ],
            influence: 60,
        },
        {
            id: 4,
            user: {
                name: "خالد يوسف",
                avatar: "https://randomuser.me/api/portraits/men/4.jpg",
            },
            message: "نبضة جديدة في دائرتك",
            timeAgo: "منذ 20 دقيقة",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: false },
                { icon: "😊", active: true },
                { icon: "❤️", active: false },
            ],
            influence: 50,
        },
        {
            id: 5,
            user: {
                name: "منى إبراهيم",
                avatar: "https://randomuser.me/api/portraits/women/5.jpg",
            },
            message: "تمت إضافة نبضتك للمفضلة",
            timeAgo: "منذ 25 دقيقة",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: false },
                { icon: "😊", active: false },
                { icon: "❤️", active: true },
            ],
            influence: 90,
        },
        {
            id: 6,
            user: {
                name: "أحمد سمير",
                avatar: "https://randomuser.me/api/portraits/men/6.jpg",
            },
            message: "أرسل لك رسالة جديدة",
            timeAgo: "منذ 30 دقيقة",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: true },
                { icon: "😊", active: false },
                { icon: "❤️", active: false },
            ],
            influence: 40,
        },
        {
            id: 7,
            user: {
                name: "دينا فؤاد",
                avatar: "https://randomuser.me/api/portraits/women/7.jpg",
            },
            message: "نبضتك أثرت في الكثير!",
            timeAgo: "منذ 35 دقيقة",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: false },
                { icon: "😊", active: true },
                { icon: "❤️", active: false },
            ],
            influence: 77,
        },
        {
            id: 8,
            user: {
                name: "سامي جابر",
                avatar: "https://randomuser.me/api/portraits/men/8.jpg",
            },
            message: "أرسل لك نبضة دعم",
            timeAgo: "منذ 40 دقيقة",
            reactions: [
                { icon: "🙏", active: true },
                { icon: "✨", active: false },
                { icon: "😊", active: false },
                { icon: "❤️", active: false },
            ],
            influence: 65,
        },
        {
            id: 9,
            user: {
                name: "هالة سعيد",
                avatar: "https://randomuser.me/api/portraits/women/9.jpg",
            },
            message: "نبضتك وصلت للجميع",
            timeAgo: "منذ ساعة",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: true },
                { icon: "😊", active: false },
                { icon: "❤️", active: false },
            ],
            influence: 55,
        },
        {
            id: 10,
            user: {
                name: "رامي عبد الله",
                avatar: "https://randomuser.me/api/portraits/men/10.jpg",
            },
            message: "تمت مشاركة نبضتك",
            timeAgo: "منذ ساعتين",
            reactions: [
                { icon: "🙏", active: false },
                { icon: "✨", active: false },
                { icon: "😊", active: false },
                { icon: "❤️", active: true },
            ],
            influence: 80,
        },
    ];

    return (
        <>
            <Head title="الرئيسية" />
            <UserCardHome />
            <div className="flex flex-col gap-2  mt-4">
                {pulses.map((pulse) => (
                    <PulseCard
                        pulse={pulse}
                        key={pulse.id}
                        user={pulse.user}
                        message={pulse.message}
                        timeAgo={pulse.timeAgo}
                        reactions={pulse.reactions}
                        influence={pulse.influence}
                    />
                ))}
            </div>
        </>
    );
}

const UserCardHome = () => {
    const user = usePage().props.auth.user;
    const pulseScore = {
        score: 75,
        level: 3,
    };

    // إضافة حالة جديدة للتفاعلات
    const [interactions, setInteractions] = useState({
        lastPulseTime: Date.now(),
        streakDays: 5,
        pulseStrength: 85,
    });

    // تحسين قسم النبضات مع إضافة التأثير العاطفي
    const enhancedPulseScore = {
        ...pulseScore,
        streak: interactions.streakDays,
        strength: interactions.pulseStrength,
        nextMilestone: 100,
    };

    // الإنجازات
    const achievements = [
        {
            id: 1,
            title: "باث النبضات",
            count: "156",
            icon: <FiHeart className="text-pink-500" />,
        },
        {
            id: 2,
            title: "الدوائر النشطة",
            count: "5",
            icon: <FiCircle className="text-yellow-400" />,
        },
        {
            id: 3,
            title: "حجم المجتمع",
            count: "23",
            icon: <FiUsers className="text-blue-400" />,
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
                {/* القسم الأيسر - معلومات المستخدم */}
                <div className="flex items-center gap-4">
                    <motion.div
                        className="relative w-16 h-16"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                            {enhancedPulseScore.level}
                        </div>
                        {/* مؤشر دائري للتقدم */}
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                        <motion.div
                            className="absolute inset-0 rounded-full border-4 border-primary"
                            style={{
                                clipPath: `polygon(0 0, ${
                                    (enhancedPulseScore.score /
                                        enhancedPulseScore.nextMilestone) *
                                    100
                                }% 0, ${
                                    (enhancedPulseScore.score /
                                        enhancedPulseScore.nextMilestone) *
                                    100
                                }% 100%, 0 100%)`,
                            }}
                        />
                    </motion.div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">
                            مرحباً، {user.name.split(" ").slice(0, 2).join(" ")}
                            ! 👋
                        </h1>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-primary">
                                <FiActivity className="w-4 h-4" />
                                <span>
                                    {enhancedPulseScore.strength}% قوة النبض
                                </span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-1 text-green-500">
                                <FiTrendingUp className="w-4 h-4" />
                                <span>
                                    {enhancedPulseScore.streak} أيام متتالية
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainLayout(Home);
