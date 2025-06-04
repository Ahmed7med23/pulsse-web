import React, { useState } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { Head } from "@inertiajs/react";
import {
    FiUserPlus,
    FiUserCheck,
    FiUserX,
    FiSearch,
    FiClock,
    FiSend,
    FiArrowRight,
    FiEdit3,
    FiUsers,
    FiTrash2,
    FiHeart,
    FiUser,
    FiCircle,
} from "react-icons/fi";
import { router } from "@inertiajs/react";
import FriendSearchModal from "../../Components/Friends/FriendSearchModal";

const styles = `
@keyframes pulse-scale {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
}

.animate-pulse-scale {
    animation: pulse-scale 1s ease-in-out;
}
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const FriendsPage = ({ friends, receivedRequests, sentRequests }) => {
    const [activeTab, setActiveTab] = useState("friends"); // friends, received-requests, sent-requests, suggestions
    const [sendingPulse, setSendingPulse] = useState(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Mock data - Replace with actual API calls
    const friendsx = [
        {
            id: 1,
            name: "سارة أحمد",
            avatar: "https://randomuser.me/api/portraits/women/1.jpg",
            mutualFriends: 5,
            status: "online",
            lastPulseSent: "منذ يومين",
        },
        {
            id: 2,
            name: "محمد علي",
            avatar: "https://randomuser.me/api/portraits/men/2.jpg",
            mutualFriends: 3,
            status: "offline",
            lastPulseSent: "منذ أسبوع",
        },
    ];

    const receivedRequestsx = [
        {
            id: 1,
            name: "ليلى حسن",
            avatar: "https://randomuser.me/api/portraits/women/3.jpg",
            mutualFriends: 4,
            sentAt: "منذ ساعتين",
        },
        {
            id: 2,
            name: "أحمد محمود",
            avatar: "https://randomuser.me/api/portraits/men/5.jpg",
            mutualFriends: 2,
            sentAt: "منذ 3 ساعات",
        },
    ];

    const sentRequestsx = [
        {
            id: 1,
            name: "خالد يوسف",
            avatar: "https://randomuser.me/api/portraits/men/4.jpg",
            mutualFriends: 7,
            sentAt: "منذ يوم",
        },
        {
            id: 2,
            name: "نورا محمد",
            avatar: "https://randomuser.me/api/portraits/women/6.jpg",
            mutualFriends: 3,
            sentAt: "منذ يومين",
        },
    ];

    const suggestions = [
        {
            id: 1,
            name: "عمر أحمد",
            avatar: "https://randomuser.me/api/portraits/men/7.jpg",
            mutualFriends: 7,
        },
        {
            id: 2,
            name: "فاطمة علي",
            avatar: "https://randomuser.me/api/portraits/women/8.jpg",
            mutualFriends: 5,
        },
    ];

    const handleSendPulse = async (friendId) => {
        try {
            setSendingPulse(friendId);
            // Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call
            router.post("/pulses/send", {
                friend_id: friendId,
                message: "أرسلت لك نبضة! 👋",
            });
        } catch (error) {
            console.error("Error sending pulse:", error);
        } finally {
            setSendingPulse(null);
        }
    };

    const FriendCard = ({ friend, type = "friend" }) => {
        const [isPulsing, setIsPulsing] = useState(false);

        const handlePulseClick = async (friendId) => {
            setIsPulsing(true);
            try {
                await handleSendPulse(friendId);
            } finally {
                setTimeout(() => setIsPulsing(false), 1000);
            }
        };

        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        {type === "friend" && (
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                    friend.status === "online"
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                }`}
                            />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                            {friend.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {friend.mutualFriends} أصدقاء مشتركين
                        </p>
                        {type === "friend" && friend.lastPulseSent && (
                            <p className="text-xs text-gray-400 mt-1">
                                آخر نبضة: {friend.lastPulseSent}
                            </p>
                        )}
                        {(type === "received-request" ||
                            type === "sent-request") && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <FiClock size={14} />
                                {friend.sentAt}
                            </p>
                        )}
                    </div>
                    {type === "friend" && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePulseClick(friend.id)}
                                disabled={
                                    sendingPulse === friend.id || isPulsing
                                }
                                className={`relative p-2 rounded-full transition-all ${
                                    sendingPulse === friend.id || isPulsing
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-red-500 hover:bg-red-50"
                                }`}
                                title="إرسال نبضة"
                            >
                                <FiHeart
                                    size={24}
                                    className={`${
                                        isPulsing ? "animate-pulse-scale" : ""
                                    }`}
                                />
                                {isPulsing && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-20"></span>
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() =>
                                    alert("ميزة إضافة إلى دائرة قيد التطوير!")
                                }
                                className="group relative p-2 rounded-full text-blue-500 hover:bg-blue-50 transition-all"
                                title="إضافة إلى دائرة"
                            >
                                <FiCircle size={24} />
                                <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    إضافة إلى دائرة
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    alert("هل أنت متأكد من حذف هذا الصديق؟")
                                }
                                className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-all"
                                title="حذف الصديق"
                            >
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                    )}
                    {type === "received-request" && (
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 rounded-full text-green-500 hover:bg-green-50 transition-all"
                                title="قبول الطلب"
                            >
                                <FiUserCheck size={20} />
                            </button>
                            <button
                                className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-all"
                                title="رفض الطلب"
                            >
                                <FiUserX size={20} />
                            </button>
                        </div>
                    )}
                    {type === "sent-request" && (
                        <button
                            className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-all"
                            title="إلغاء الطلب"
                        >
                            <FiUserX size={20} />
                        </button>
                    )}
                    {type === "suggestion" && (
                        <button
                            className="p-2 rounded-full text-primary hover:bg-primary/10 transition-all"
                            title="إضافة صديق"
                        >
                            <FiCircle size={20} />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="الأصدقاء" />
            {/* Header Section */}
            <div className="bg-white px-4 py-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="mb-4 sm:mb-0 text-right">
                        <div className="flex items-center gap-3 justify-start">
                            <button
                                onClick={() => router.visit("/")}
                                className="p-2 -mr-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                                title="العودة للرئيسية"
                            >
                                <FiArrowRight size={20} />
                            </button>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                الأصدقاء
                            </h1>
                            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                {friends.length} صديق
                            </span>
                        </div>
                        <p className="text-gray-600 mt-1 text-base">
                            تواصل مع أصدقائك وشاركهم نبضاتك اليومية
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSearchModalOpen(true)}
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                            title="بحث عن أصدقاء"
                        >
                            <FiSearch size={20} />
                        </button>
                        <button
                            onClick={() =>
                                alert("ميزة تعديل الإعدادات قيد التطوير!")
                            }
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                            title="إعدادات الأصدقاء"
                        >
                            <FiEdit3 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="container px-4">
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={`px-4 py-1 rounded-full whitespace-nowrap ${
                            activeTab === "friends"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        الأصدقاء
                    </button>
                    <button
                        onClick={() => setActiveTab("received-requests")}
                        className={`px-4 py-1 rounded-full whitespace-nowrap ${
                            activeTab === "received-requests"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        الطلبات المستلمة
                    </button>
                    <button
                        onClick={() => setActiveTab("sent-requests")}
                        className={`px-4 py-1 rounded-full whitespace-nowrap ${
                            activeTab === "sent-requests"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        الطلبات المرسلة
                    </button>
                    <button
                        onClick={() => setActiveTab("suggestions")}
                        className={`px-4 py-1 rounded-full whitespace-nowrap ${
                            activeTab === "suggestions"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        اقتراحات
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === "friends" &&
                        friends.map((friend) => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                type="friend"
                            />
                        ))}
                    {activeTab === "received-requests" &&
                        receivedRequests.map((request) => (
                            <FriendCard
                                key={request.id}
                                friend={request}
                                type="received-request"
                            />
                        ))}
                    {activeTab === "sent-requests" &&
                        sentRequests.map((request) => (
                            <FriendCard
                                key={request.id}
                                friend={request}
                                type="sent-request"
                            />
                        ))}
                    {activeTab === "suggestions" &&
                        suggestions.map((suggestion) => (
                            <FriendCard
                                key={suggestion.id}
                                friend={suggestion}
                                type="suggestion"
                            />
                        ))}
                </div>

                <FriendSearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                />
            </div>
        </>
    );
};

const TabButton = ({ label, onClick, isActive }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1 rounded-full whitespace-nowrap ${
                isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
        >
            {label}
        </button>
    );
};

export default MainLayout(FriendsPage);
