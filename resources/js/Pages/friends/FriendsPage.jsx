import React, { useState } from "react";
import {
    FiUser,
    FiCalendar,
    FiEye,
    FiUserCheck,
    FiUserPlus,
    FiUserX,
    FiHeart,
    FiCircle,
    FiSearch,
    FiClock,
    FiTrendingUp,
    FiTrash2,
    FiSend,
    FiLoader,
    FiArrowRight,
    FiEdit3,
} from "react-icons/fi";
import { Head, router, Link } from "@inertiajs/react";
import FriendSearchModal from "../../Components/Friends/FriendSearchModal";
import AddToCircleModal from "../../Components/Friends/AddToCircleModal";
import axios from "axios";
import MainLayout from "../../Layouts/MainLayout";

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

const FriendsPage = ({
    acceptedFriends,
    receivedRequests,
    sentRequests,
    favoriteFriends,
    friendsStats,
}) => {
    const [activeTab, setActiveTab] = useState("accepted");
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [sendingPulse, setSendingPulse] = useState(null);
    const [showSendPulseModal, setShowSendPulseModal] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showAddToCircleModal, setShowAddToCircleModal] = useState(false);
    const [selectedFriendForCircle, setSelectedFriendForCircle] =
        useState(null);

    // Use real data from Controller
    const friends = acceptedFriends || [];
    const receivedRequestsData = receivedRequests || [];
    const sentRequestsData = sentRequests || [];
    const favoriteFriendsData = favoriteFriends || [];

    // Mock suggestions data for now - will be replaced with real API later
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

    const handleSendPulse = async (friend) => {
        setSelectedFriend(friend);
        setShowSendPulseModal(true);
    };

    const closeSendPulseModal = () => {
        setShowSendPulseModal(false);
        setSelectedFriend(null);
    };

    const onPulseSent = () => {
        closeSendPulseModal();
        // يمكن إضافة تحديث للبيانات هنا إذا لزم الأمر
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await axios.post(
                "/friends/accept-request",
                {
                    requestId: requestId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            // إعادة تحميل البيانات أو تحديث الحالة
            window.location.reload(); // للآن، سنعيد التحميل
        } catch (error) {
            console.error("Error accepting request:", error);
            alert(error.response?.data?.message || "حدث خطأ أثناء قبول الطلب");
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await axios.post(
                "/friends/reject-request",
                {
                    requestId: requestId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            // إعادة تحميل البيانات أو تحديث الحالة
            window.location.reload(); // للآن، سنعيد التحميل
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert(error.response?.data?.message || "حدث خطأ أثناء رفض الطلب");
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            const response = await axios.post(
                "/friends/cancel-request",
                {
                    requestId: requestId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            // إعادة تحميل البيانات أو تحديث الحالة
            window.location.reload(); // للآن، سنعيد التحميل
        } catch (error) {
            console.error("Error cancelling request:", error);
        }
    };

    const handleAddToCircle = async (friend) => {
        setSelectedFriendForCircle(friend);
        setShowAddToCircleModal(true);
    };

    const closeAddToCircleModal = () => {
        setShowAddToCircleModal(false);
        setSelectedFriendForCircle(null);
    };

    const onAddToCircleSuccess = () => {
        // يمكن إضافة تحديث للبيانات هنا إذا لزم الأمر
        closeAddToCircleModal();
    };

    const FriendCard = ({ friend, type = "friend" }) => {
        const [isPulsing, setIsPulsing] = useState(false);

        const handlePulseClick = async (friend) => {
            setIsPulsing(true);
            try {
                handleSendPulse(friend);
            } finally {
                setTimeout(() => setIsPulsing(false), 300);
            }
        };

        // Handle field name mapping between Controller and Frontend
        const friendData = {
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar,
            mutualFriends: friend.mutualFriends || 0,
            status: friend.isOnline ? "online" : "offline", // Convert boolean to string
            lastPulseSent: friend.lastPulse, // Map lastPulse to lastPulseSent
            sentAt: friend.sentAt,
            isOnline: friend.isOnline,
            lastActive: friend.lastActive,
            friendshipStarted: friend.friendshipStarted,
            totalPulses: friend.totalPulses,
            isFavorite: friend.isFavorite,
            phone: friend.phone, // masked phone number
        };

        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={friendData.avatar}
                            alt={friendData.name}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        {type === "friend" && (
                            <span
                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                    friendData.status === "online"
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                }`}
                            />
                        )}
                        {friendData.isFavorite && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <FiHeart size={10} className="text-white" />
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">
                            {friendData.name}
                        </h3>

                        {/* Show different info based on type */}
                        {type === "friend" && (
                            <>
                                <p className="text-sm text-gray-500">
                                    {friendData.mutualFriends} أصدقاء مشتركين
                                </p>
                                {friendData.lastPulseSent && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        آخر نبضة: {friendData.lastPulseSent}
                                    </p>
                                )}
                                {friendData.totalPulses && (
                                    <p className="text-xs text-blue-600 mt-1">
                                        إجمالي النبضات: {friendData.totalPulses}
                                    </p>
                                )}
                                {friendData.lastActive &&
                                    !friendData.isOnline && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            آخر نشاط: {friendData.lastActive}
                                        </p>
                                    )}
                            </>
                        )}

                        {(type === "received-request" ||
                            type === "sent-request") && (
                            <>
                                <p className="text-sm text-gray-500">
                                    {friendData.mutualFriends} أصدقاء مشتركين
                                </p>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <FiClock size={14} />
                                    {friendData.sentAt}
                                </p>
                            </>
                        )}
                    </div>
                    {type === "friend" && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePulseClick(friend)}
                                disabled={isPulsing}
                                className={`relative p-2 rounded-full transition-all ${
                                    isPulsing
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
                                onClick={() => handleAddToCircle(friend)}
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
                                onClick={() =>
                                    handleAcceptRequest(
                                        friend.requestId || friend.id
                                    )
                                }
                                className="p-2 rounded-full text-green-500 hover:bg-green-50 transition-all"
                                title="قبول الطلب"
                            >
                                <FiUserCheck size={20} />
                            </button>
                            <button
                                onClick={() =>
                                    handleRejectRequest(
                                        friend.requestId || friend.id
                                    )
                                }
                                className="p-2 rounded-full text-red-500 hover:bg-red-50 transition-all"
                                title="رفض الطلب"
                            >
                                <FiUserX size={20} />
                            </button>
                        </div>
                    )}
                    {type === "sent-request" && (
                        <button
                            onClick={() =>
                                handleCancelRequest(
                                    friend.requestId || friend.id
                                )
                            }
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
                            onClick={() => setShowSearchModal(true)}
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                            title="بحث عن أصدقاء"
                        >
                            <FiSearch size={20} />
                        </button>
                        <Link
                            href="/friends/invitations"
                            className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                            title="الدعوات المرسلة"
                        >
                            <FiSend size={20} />
                        </Link>
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
                        onClick={() => setActiveTab("accepted")}
                        className={`px-4 py-1 rounded-full whitespace-nowrap ${
                            activeTab === "accepted"
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
                    {/* <button
                        onClick={() => setActiveTab("suggestions")}
                        className={`px-4 py-1 rounded-full whitespace-nowrap ${
                            activeTab === "suggestions"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        اقتراحات
                    </button> */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === "accepted" &&
                        friends.map((friend) => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                type="friend"
                            />
                        ))}
                    {activeTab === "received-requests" &&
                        receivedRequestsData.map((request) => (
                            <FriendCard
                                key={request.id}
                                friend={request}
                                type="received-request"
                            />
                        ))}
                    {activeTab === "sent-requests" &&
                        sentRequestsData.map((request) => (
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
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                />

                {/* Send Pulse Modal */}
                {showSendPulseModal && selectedFriend && (
                    <SendPulseModal
                        friend={selectedFriend}
                        onClose={closeSendPulseModal}
                        onPulseSent={onPulseSent}
                    />
                )}

                {/* Add To Circle Modal */}
                {showAddToCircleModal && selectedFriendForCircle && (
                    <AddToCircleModal
                        friend={selectedFriendForCircle}
                        isOpen={showAddToCircleModal}
                        onClose={closeAddToCircleModal}
                        onSuccess={onAddToCircleSuccess}
                    />
                )}
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

/**
 * Modal for sending a pulse to a specific friend
 */
const SendPulseModal = ({ friend, onClose, onPulseSent }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDefaultPulses, setShowDefaultPulses] = useState(true);

    // النبضات الافتراضية
    const defaultPulses = [
        {
            id: 1,
            emoji: "🎉",
            title: "تهنئة عيد الأضحى",
            message:
                "كل عام وأنت بخير بمناسبة عيد الأضحى المبارك! عساكم من عواده 🎉🐑",
            color: "bg-green-50 border-green-200 text-green-700",
        },
        {
            id: 2,
            emoji: "💭",
            title: "تذكرتك",
            message: "مرحباً! فقط أردت أن أذكرك وأطمئن عليك 💙",
            color: "bg-blue-50 border-blue-200 text-blue-700",
        },
        {
            id: 3,
            emoji: "🤲",
            title: "دعوة للدعاء",
            message: "تذكر أن تدعو لي في صلاتك، وأنا سأدعو لك أيضاً 🤲✨",
            color: "bg-purple-50 border-purple-200 text-purple-700",
        },
        {
            id: 4,
            emoji: "☕",
            title: "دعوة لقاء",
            message: "ما رأيك نتقابل قريباً لشرب القهوة والتحدث؟ ☕😊",
            color: "bg-amber-50 border-amber-200 text-amber-700",
        },
        {
            id: 5,
            emoji: "❤️",
            title: "محبة وتقدير",
            message: "أقدر وجودك في حياتي، شكراً لك على كل شيء ❤️",
            color: "bg-pink-50 border-pink-200 text-pink-700",
        },
        {
            id: 6,
            emoji: "🌅",
            title: "صباح الخير",
            message: "صباح الخير! أتمنى لك يوماً مليئاً بالسعادة والبركة 🌅✨",
            color: "bg-orange-50 border-orange-200 text-orange-700",
        },
    ];

    // وظيفة لاختيار نبضة افتراضية
    const handleSelectDefaultPulse = async (defaultPulse) => {
        // إما إرسال النبضة مباشرة أو وضعها في النص
        const shouldSendDirectly = confirm(
            `هل تريد إرسال "${defaultPulse.title}" مباشرة؟\n\nالرسالة: ${defaultPulse.message}`
        );

        if (shouldSendDirectly) {
            await sendPulseWithMessage(defaultPulse.message);
        } else {
            // وضع النص في الحقل للتعديل
            setMessage(defaultPulse.message);
            setShowDefaultPulses(false);
        }
    };

    const sendPulseWithMessage = async (pulseMessage) => {
        try {
            setLoading(true);

            const response = await axios.post(
                "/pulses/send",
                {
                    type: "direct",
                    message: pulseMessage.trim(),
                    friend_id: friend.id,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            alert("تم إرسال النبضة بنجاح! 🎉");
            onClose();

            // إشعار المكون الأب بالإرسال الناجح
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

    const handleSendPulse = async () => {
        if (!message.trim()) {
            alert("الرجاء كتابة رسالة النبضة");
            return;
        }

        await sendPulseWithMessage(message);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        إرسال نبضة لـ {friend.name}
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
                    {/* Friend Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-medium text-gray-800">
                                {friend.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {friend.isOnline ? "متصل الآن" : "غير متصل"}
                            </p>
                        </div>
                    </div>

                    {/* النبضات الافتراضية */}
                    {showDefaultPulses && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    نبضات سريعة ⚡
                                </label>
                                <button
                                    onClick={() => setShowDefaultPulses(false)}
                                    className="text-xs text-gray-500 hover:text-gray-700"
                                >
                                    إخفاء
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {defaultPulses.map((pulse) => (
                                    <button
                                        key={pulse.id}
                                        onClick={() =>
                                            handleSelectDefaultPulse(pulse)
                                        }
                                        disabled={loading}
                                        className={`p-3 rounded-lg border text-right hover:shadow-md transition-all ${pulse.color} hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg">
                                                {pulse.emoji}
                                            </span>
                                            <div>
                                                <div className="font-medium text-xs mb-1">
                                                    {pulse.title}
                                                </div>
                                                <div className="text-xs opacity-75 truncate">
                                                    {pulse.message.substring(
                                                        0,
                                                        30
                                                    )}
                                                    ...
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* إظهار النبضات الافتراضية مرة أخرى */}
                    {!showDefaultPulses && (
                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowDefaultPulses(true)}
                                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                            >
                                <span>⚡</span>
                                إظهار النبضات السريعة
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
                        disabled={loading || !message.trim()}
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

const WrappedFriendsPage = ({
    acceptedFriends,
    receivedRequests,
    sentRequests,
    favoriteFriends,
    friendsStats,
}) => {
    return (
        <MainLayout>
            <FriendsPage
                acceptedFriends={acceptedFriends}
                receivedRequests={receivedRequests}
                sentRequests={sentRequests}
                favoriteFriends={favoriteFriends}
                friendsStats={friendsStats}
            />
        </MainLayout>
    );
};

export default WrappedFriendsPage;
