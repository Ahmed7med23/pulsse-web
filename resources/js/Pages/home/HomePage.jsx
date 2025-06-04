import React, { useState, useEffect } from "react";
import MainLayout from "../../Layouts/MainLayout";
import {
    FiActivity,
    FiCircle,
    FiHeart,
    FiUsers,
    FiSend,
    FiInbox,
    FiLoader,
    FiPlus,
    FiUser,
} from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";

import { motion } from "framer-motion";
import { useAuth } from "../../Contexts/AuthContext";
import { Head, usePage } from "@inertiajs/react";
import PulseCard from "./PulseCard";
import axios from "axios";

function Home() {
    const [activeTab, setActiveTab] = useState("all"); // 'all', 'received', 'sent'
    const [pulses, setPulses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSendPulseModal, setShowSendPulseModal] = useState(false);

    const data = usePage();

    // جلب البيانات من الـ API
    useEffect(() => {
        fetchPulses();
    }, []);

    const fetchPulses = async () => {
        try {
            setLoading(true);
            setError(null);

            // جلب جميع النبضات (مرسلة ومستقبلة)
            const response = await axios.get("/pulses/all", {
                headers: {
                    Accept: "application/json",
                },
            });

            // تحويل البيانات إلى التنسيق المطلوب للواجهة
            const formattedPulses = response.data.map((pulse) => ({
                id: pulse.id,
                type: pulse.type, // 'sent' or 'received'
                pulseType: pulse.pulse_type || "direct", // 'direct' or 'circle'
                user: {
                    name: pulse.user.name,
                    avatar: pulse.user.avatar,
                    isOnline: pulse.user.isOnline || false,
                },
                message: pulse.message,
                timeAgo: pulse.timeAgo,
                reactions: pulse.reactions || [],
                circleName: pulse.circleName,
                recipients: pulse.recipients || [],
            }));

            setPulses(formattedPulses);
        } catch (err) {
            console.error("Error fetching pulses:", err);
            setError("حدث خطأ في تحميل النبضات");

            // استخدام البيانات الافتراضية في حالة الخطأ
            setPulses(getMockPulses());
        } finally {
            setLoading(false);
        }
    };

    // البيانات الافتراضية للاحتياطي
    const getMockPulses = () => [
        // النبضات المستقبلة
        {
            id: 1,
            type: "received",
            pulseType: "direct",
            user: {
                name: "سارة أحمد",
                avatar: "https://randomuser.me/api/portraits/women/1.jpg",
                isOnline: true,
            },
            message: "أرسلت لك نبضة خاصة! 💙 أتمنى أن تكون بخير",
            timeAgo: "منذ 5 دقائق",
            reactions: [
                { type: "pray", icon: "🙏", active: false, count: 0 },
                { type: "sparkles", icon: "✨", active: false, count: 0 },
                { type: "smile", icon: "😊", active: false, count: 0 },
                { type: "heart", icon: "❤️", active: true, count: 1 },
                { type: "thumbs_up", icon: "👍", active: false, count: 0 },
                { type: "sad", icon: "😢", active: false, count: 0 },
                { type: "surprised", icon: "😮", active: false, count: 0 },
                { type: "angry", icon: "😡", active: false, count: 0 },
            ],
        },
        {
            id: 2,
            type: "received",
            pulseType: "circle",
            user: {
                name: "محمد علي",
                avatar: "https://randomuser.me/api/portraits/men/2.jpg",
                isOnline: false,
            },
            message:
                "مرحباً بالجميع في دائرة أصدقاء العمل! 🎉 لنبدأ أسبوعاً رائعاً",
            timeAgo: "منذ 15 دقيقة",
            circleName: "أصدقاء العمل",
            reactions: [
                { type: "pray", icon: "🙏", active: false, count: 2 },
                { type: "sparkles", icon: "✨", active: true, count: 5 },
                { type: "smile", icon: "😊", active: false, count: 3 },
                { type: "heart", icon: "❤️", active: false, count: 1 },
                { type: "thumbs_up", icon: "👍", active: false, count: 8 },
                { type: "sad", icon: "😢", active: false, count: 0 },
                { type: "surprised", icon: "😮", active: false, count: 0 },
                { type: "angry", icon: "😡", active: false, count: 0 },
            ],
        },
        // نبضة مرسلة
        {
            id: 4,
            type: "sent",
            pulseType: "direct",
            user: {
                name: "أنت",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                isOnline: true,
            },
            message: "مساء الخير! كيف حالكم اليوم؟ 😊",
            timeAgo: "منذ ساعة",
            recipients: [{ id: 1, name: "خالد يوسف", seen: true }],
            reactions: [
                { type: "pray", icon: "🙏", active: false, count: 0 },
                { type: "sparkles", icon: "✨", active: false, count: 1 },
                { type: "smile", icon: "😊", active: false, count: 2 },
                { type: "heart", icon: "❤️", active: false, count: 0 },
                { type: "thumbs_up", icon: "👍", active: false, count: 1 },
                { type: "sad", icon: "😢", active: false, count: 0 },
                { type: "surprised", icon: "😮", active: false, count: 0 },
                { type: "angry", icon: "😡", active: false, count: 0 },
            ],
        },
    ];

    // تصفية النبضات حسب التبويب النشط
    const filteredPulses = pulses.filter((pulse) => {
        if (activeTab === "received") return pulse.type === "received";
        if (activeTab === "sent") return pulse.type === "sent";
        return true; // 'all'
    });

    // Loading state
    if (loading) {
        return (
            <>
                <Head title="الرئيسية" />
                <UserCardHome />
                <div className="flex justify-center items-center py-12">
                    <div className="flex items-center gap-3 text-primary">
                        <FiLoader className="animate-spin" size={24} />
                        <span>جاري تحميل النبضات...</span>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error) {
        return (
            <>
                <Head title="الرئيسية" />
                <UserCardHome />
                <div className="mx-2 bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-500 mb-2">
                        <FiHeart size={48} className="mx-auto" />
                    </div>
                    <p className="text-red-600 font-medium mb-2">{error}</p>
                    <button
                        onClick={fetchPulses}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="الرئيسية" />
            <UserCardHome />

            {/* Tabs */}
            <div className="mx-2 mt-4 mb-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                            activeTab === "all"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        <FiActivity size={16} />
                        <span className="font-medium">جميع النبضات</span>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {pulses.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("received")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                            activeTab === "received"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        <FiInbox size={16} />
                        <span className="font-medium">مستقبلة</span>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {pulses.filter((p) => p.type === "received").length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                            activeTab === "sent"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        <FiSend size={16} />
                        <span className="font-medium">مرسلة</span>
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {pulses.filter((p) => p.type === "sent").length}
                        </span>
                    </button>
                </div>
            </div>

            {/* النبضات */}
            <div className="flex flex-col gap-3 mt-4">
                {filteredPulses.length > 0 ? (
                    filteredPulses.map((pulse) => (
                        <PulseCard
                            key={pulse.id}
                            pulse={pulse}
                            onReactionUpdate={fetchPulses}
                        />
                    ))
                ) : (
                    <div className="mx-2 bg-gray-50 rounded-lg p-8 text-center">
                        <div className="text-gray-400 mb-2">
                            <FiHeart size={48} className="mx-auto" />
                        </div>
                        <p className="text-gray-600 font-medium">
                            {activeTab === "received" &&
                                "لا توجد نبضات مستقبلة"}
                            {activeTab === "sent" && "لم ترسل أي نبضات بعد"}
                            {activeTab === "all" && "لا توجد نبضات"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            ابدأ بإرسال نبضة لأصدقائك!
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <motion.button
                onClick={() => setShowSendPulseModal(true)}
                className="fixed bottom-6 right-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <FiPlus size={24} />
            </motion.button>

            {/* Send Pulse Modal */}
            {showSendPulseModal && (
                <SendPulseModal
                    onClose={() => setShowSendPulseModal(false)}
                    onPulseSent={fetchPulses}
                />
            )}
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

/**
 * Modal for sending a new pulse
 */
const SendPulseModal = ({ onClose, onPulseSent }) => {
    const [message, setMessage] = useState("");
    const [pulseType, setPulseType] = useState("direct");
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [loading, setLoading] = useState(false);
    const [friendsLoading, setFriendsLoading] = useState(true);

    // جلب قائمة الأصدقاء
    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setFriendsLoading(true);
                const response = await axios.get("/friends", {
                    headers: {
                        Accept: "application/json",
                    },
                });

                // استخراج الأصدقاء المقبولين من البيانات
                const acceptedFriends =
                    response.data.props?.acceptedFriends || [];
                setFriends(acceptedFriends);
            } catch (error) {
                console.error("Error fetching friends:", error);
                setFriends([]);
            } finally {
                setFriendsLoading(false);
            }
        };

        fetchFriends();
    }, []);

    const handleSendPulse = async () => {
        if (!message.trim()) {
            alert("الرجاء كتابة رسالة النبضة");
            return;
        }

        if (pulseType === "direct" && !selectedFriend) {
            alert("الرجاء اختيار صديق لإرسال النبضة إليه");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                type: pulseType,
                message: message.trim(),
            };

            if (pulseType === "direct") {
                payload.friend_id = selectedFriend.id;
            }

            const response = await axios.post("/pulses/send", payload, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            alert("تم إرسال النبضة بنجاح! 🎉");
            onClose();

            // تحديث قائمة النبضات
            if (onPulseSent) {
                onPulseSent();
            }
        } catch (error) {
            console.error("Error sending pulse:", error);
            alert(error.response?.data?.message || "حدث خطأ في إرسال النبضة");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        إرسال نبضة جديدة
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Pulse Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع النبضة
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPulseType("direct")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                                    pulseType === "direct"
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-300 text-gray-700 hover:border-primary"
                                }`}
                            >
                                <FiUser size={16} />
                                <span>مباشرة</span>
                            </button>
                            <button
                                onClick={() => setPulseType("circle")}
                                disabled
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                            >
                                <FiUsers size={16} />
                                <span>دائرة (قريباً)</span>
                            </button>
                        </div>
                    </div>

                    {/* Friend Selection (for direct pulses) */}
                    {pulseType === "direct" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اختر صديق
                            </label>
                            {friendsLoading ? (
                                <div className="flex items-center justify-center py-4">
                                    <FiLoader
                                        className="animate-spin text-primary"
                                        size={20}
                                    />
                                    <span className="mr-2 text-gray-600">
                                        جاري تحميل الأصدقاء...
                                    </span>
                                </div>
                            ) : friends.length > 0 ? (
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {friends.map((friend) => (
                                        <button
                                            key={friend.id}
                                            onClick={() =>
                                                setSelectedFriend(friend)
                                            }
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                selectedFriend?.id === friend.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-gray-200 hover:border-primary/50"
                                            }`}
                                        >
                                            <img
                                                src={friend.avatar}
                                                alt={friend.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <span className="text-sm font-medium text-gray-800">
                                                {friend.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    لا يوجد أصدقاء متاحين
                                </div>
                            )}
                        </div>
                    )}

                    {/* Message Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            رسالة النبضة
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="اكتب رسالة نبضتك هنا... 💫"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                            rows={3}
                            maxLength={255}
                        />
                        <div className="text-xs text-gray-400 mt-1 text-left">
                            {message.length}/255
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSendPulse}
                        disabled={
                            loading ||
                            !message.trim() ||
                            (pulseType === "direct" && !selectedFriend)
                        }
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? (
                            <>
                                <FiLoader className="animate-spin" size={16} />
                                <span>جاري الإرسال...</span>
                            </>
                        ) : (
                            <>
                                <FiSend size={16} />
                                <span>إرسال النبضة</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MainLayout(Home);
