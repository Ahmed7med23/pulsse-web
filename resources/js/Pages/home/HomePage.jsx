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
    FiUser,
} from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";

import { motion } from "framer-motion";
import { useAuth } from "../../Contexts/AuthContext";
import { Head, usePage, usePoll } from "@inertiajs/react";
import PulseCard from "./PulseCard";
import PushNotifications from "../../Components/PushNotifications";
import axios from "axios";

function Home() {
    const [activeTab, setActiveTab] = useState("all"); // 'all', 'received', 'sent'
    const [pulses, setPulses] = useState([]);
    const [loading, setLoading] = useState(true); // للتحميل الأولي فقط
    const [isRefreshing, setIsRefreshing] = useState(false); // للتحديث التلقائي
    const [error, setError] = useState(null);

    const pageData = usePage();
    const initialStats = pageData.props.pulseStats;
    const initialPulses = pageData.props.receivedPulses;

    // جلب البيانات من الـ API
    useEffect(() => {
        fetchPulses(true); // التحميل الأولي
    }, []);

    const fetchPulses = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) {
                setLoading(true); // مؤشر التحميل الكامل للتحميل الأولي فقط
            } else {
                setIsRefreshing(true); // مؤشر تحديث صغير للتحديث التلقائي
            }
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
                directRecipientName: pulse.directRecipientName,
                recipients: pulse.recipients || [],
                recipients_count: pulse.recipients_count || 0,
                seen: pulse.seen || false,
                seen_at: pulse.seen_at,
            }));

            setPulses(formattedPulses);
        } catch (err) {
            console.error("Error fetching pulses:", err);
            setError("حدث خطأ في تحميل النبضات");
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    };

    // تصفية النبضات حسب التبويب النشط
    const filteredPulses = pulses.filter((pulse) => {
        if (activeTab === "received") return pulse.type === "received";
        if (activeTab === "sent") return pulse.type === "sent";
        return true; // 'all'
    });

    // تحديث النبضات كل 10 ثوان باستخدام Inertia Polling
    usePoll(
        10000,
        {
            only: ["receivedPulses", "pulseStats"], // تحديث النبضات والإحصائيات
            onSuccess: (response) => {
                // تحديث النبضات المحلية عند نجاح الـ polling
                if (response.props.receivedPulses) {
                    // تحديث صامت دون إظهار مؤشر التحميل الكبير
                    fetchPulses(false); // تحديث تلقائي
                }
            },
        },
        {
            keepAlive: true, // الاستمرار حتى لو أصبح المكون غير نشط
            autoStart: true, // البدء تلقائياً
        }
    );

    // Loading state - للتحميل الأولي فقط
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
                        onClick={() => fetchPulses(true)}
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

            {/* Push Notifications - للاختبار */}
            <div className="mx-2 mb-4">
                <PushNotifications />
            </div>

            {/* Pulse tabs */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="flex justify-around p-2">
                    {[
                        { key: "all", label: "الكل", icon: <FiInbox /> },
                        {
                            key: "received",
                            label: "المستقبلة",
                            icon: <FiActivity />,
                        },
                        { key: "sent", label: "المرسلة", icon: <FiSend /> },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium transition-colors ${
                                activeTab === tab.key
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Control bar */}
            <div className="flex justify-center items-center p-4 bg-white border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">
                    {activeTab === "all" && "جميع النبضات"}
                    {activeTab === "received" && "النبضات المستقبلة"}
                    {activeTab === "sent" && "النبضات المرسلة"}
                </h2>
            </div>

            {/* Pulses list */}
            <div className="pb-20">
                {filteredPulses.length > 0 ? (
                    <div className="space-y-4 p-4">
                        {filteredPulses.map((pulse) => (
                            <PulseCard
                                key={pulse.id}
                                pulse={pulse}
                                onReactionUpdate={() => fetchPulses(false)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4">
                        <div className="text-gray-400 mb-4">
                            <FiInbox size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-500 mb-2">
                            {activeTab === "received" &&
                                "لا توجد نبضات مستقبلة"}
                            {activeTab === "sent" && "لم ترسل أي نبضات بعد"}
                            {activeTab === "all" && "لا توجد نبضات"}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === "received" &&
                                "ستظهر النبضات التي يرسلها أصدقاؤك هنا"}
                            {activeTab === "sent" &&
                                "ستظهر النبضات التي أرسلتها هنا"}
                            {activeTab === "all" && "ستظهر جميع النبضات هنا"}
                        </p>
                    </div>
                )}
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

            const successMessage =
                pulseType === "direct"
                    ? `تم إرسال النبضة إلى ${selectedFriend.name} بنجاح! 🎉`
                    : `تم إرسال النبضة إلى جميع أعضاء الدائرة بنجاح! 🎉`;

            alert(successMessage);
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
                                onClick={() => {
                                    setPulseType("direct");
                                }}
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
                                onClick={() => {
                                    setPulseType("circle");
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-colors ${
                                    pulseType === "circle"
                                        ? "border-primary bg-primary text-white"
                                        : "border-gray-300 text-gray-700 hover:border-primary"
                                }`}
                            >
                                <FiUsers size={16} />
                                <span>دائرة</span>
                            </button>
                        </div>
                    </div>

                    {/* Friend Selection (for direct pulses) */}
                    {pulseType === "direct" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                اختيار الصديق
                            </label>
                            <button
                                onClick={() => {
                                    setSelectedFriend(null);
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg text-right hover:border-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                            >
                                {selectedFriend ? (
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={selectedFriend.avatar}
                                            alt={selectedFriend.name}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <span className="text-gray-900">
                                            {selectedFriend.name}
                                        </span>
                                        {selectedFriend.isOnline && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                متصل
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-500">
                                        اختر صديقاً...
                                    </span>
                                )}
                            </button>
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

const HomePage = () => {
    return (
        <MainLayout>
            <Home />
        </MainLayout>
    );
};

export default HomePage;
