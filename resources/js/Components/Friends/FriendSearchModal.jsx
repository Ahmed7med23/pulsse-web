import React, { useState } from "react";
import {
    FiSearch,
    FiX,
    FiUserPlus,
    FiUserCheck,
    FiSend,
    FiUser,
    FiClock,
    FiHeart,
    FiUserX,
    FiShield,
    FiMessageCircle,
    FiExternalLink,
    FiLoader,
} from "react-icons/fi";
import axios from "axios";
import { useForm, router } from "@inertiajs/react";

const FriendSearchModal = ({ isOpen, onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showSendPulseModal, setShowSendPulseModal] = useState(false);

    const {
        data: invitationData,
        setData: setInvitationData,
        post,
        processing,
        errors,
    } = useForm({
        phone: "",
    });

    const resetStates = () => {
        setSearchResult(null);
        setError("");
        setSuccessMessage("");
    };

    const handleSearch = async () => {
        if (!phoneNumber.trim()) {
            setError("الرجاء إدخال رقم الهاتف");
            return;
        }

        try {
            setIsLoading(true);
            resetStates();

            const response = await axios.get("/friends/search-by-phone", {
                params: { phone: phoneNumber },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (response.data) {
                setSearchResult(response.data);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                // User not found - show invitation option
                setSearchResult({
                    not_found: true,
                    phone: phoneNumber,
                });
            } else {
                setError(
                    err.response?.data?.message ||
                        "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى."
                );
            }
            console.error("Search error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendInvitation = async () => {
        if (!phoneNumber.trim()) {
            setError("الرجاء إدخال رقم الهاتف");
            return;
        }

        setInvitationData("phone", phoneNumber);
        post("/friends/send-invitation", {
            onSuccess: () => {
                setSuccessMessage("تم إرسال الدعوة بنجاح عبر WhatsApp! 📱");
                setPhoneNumber("");
                setTimeout(() => onClose(), 2000);
            },
            onError: (err) => {
                setError(err.phone || "حدث خطأ أثناء إرسال الدعوة");
            },
        });
    };

    const handleSendFriendRequest = async () => {
        if (!searchResult || !searchResult.id) return;

        try {
            setIsLoading(true);
            const response = await axios.post(
                "/friends/send-request",
                {
                    userId: searchResult.id,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage("تم إرسال طلب الصداقة بنجاح! ⏳");
            // Update the search result to reflect new status
            setSearchResult((prev) => ({
                ...prev,
                relationshipStatus: "pending_sent",
            }));
        } catch (err) {
            setError(
                err.response?.data?.message || "حدث خطأ أثناء إرسال طلب الصداقة"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!searchResult || !searchResult.requestId) return;

        try {
            setIsLoading(true);
            const response = await axios.post(
                "/friends/accept-request",
                {
                    request_id: searchResult.requestId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage("تم قبول طلب الصداقة! 🎉");
            setSearchResult((prev) => ({
                ...prev,
                relationshipStatus: "accepted",
            }));
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء قبول الطلب");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!searchResult || !searchResult.requestId) return;

        try {
            setIsLoading(true);
            const response = await axios.post(
                "/friends/reject-request",
                {
                    request_id: searchResult.requestId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage("تم رفض طلب الصداقة");
            setSearchResult((prev) => ({
                ...prev,
                relationshipStatus: "none",
            }));
        } catch (err) {
            setError(err.response?.data?.message || "حدث خطأ أثناء رفض الطلب");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!searchResult || !searchResult.requestId) return;

        try {
            setIsLoading(true);
            const response = await axios.post(
                "/friends/cancel-request",
                {
                    request_id: searchResult.requestId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage("تم إلغاء طلب الصداقة");
            setSearchResult((prev) => ({
                ...prev,
                relationshipStatus: "none",
            }));
        } catch (err) {
            setError(
                err.response?.data?.message || "حدث خطأ أثناء إلغاء الطلب"
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendPulse = async () => {
        if (!searchResult || !searchResult.id) return;
        setShowSendPulseModal(true);
    };

    const closeSendPulseModal = () => {
        setShowSendPulseModal(false);
    };

    const onPulseSent = () => {
        setSuccessMessage("تم إرسال النبضة بنجاح! 💙");
        closeSendPulseModal();
        setTimeout(() => onClose(), 1500);
    };

    // Helper function to get status info
    const getStatusInfo = (status) => {
        switch (status) {
            case "accepted":
                return {
                    icon: FiUserCheck,
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                    text: "أنتما أصدقاء",
                    description: "يمكنك إرسال النبضات والتواصل",
                };
            case "pending_sent":
                return {
                    icon: FiClock,
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                    text: "طلب صداقة مرسل",
                    description: "في انتظار موافقة الطرف الآخر",
                };
            case "pending_received":
                return {
                    icon: FiUserPlus,
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                    text: "طلب صداقة مستقبل",
                    description: "يمكنك قبول أو رفض الطلب",
                };
            case "none":
                return {
                    icon: FiUser,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                    text: "ليس صديقاً",
                    description: "يمكنك إرسال طلب صداقة",
                };
            default:
                return {
                    icon: FiUser,
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                    text: "حالة غير معروفة",
                    description: "",
                };
        }
    };

    const renderUserResult = () => {
        if (!searchResult || searchResult.not_found) return null;

        const statusInfo = getStatusInfo(searchResult.relationshipStatus);
        const StatusIcon = statusInfo.icon;

        return (
            <div
                className={`border rounded-lg p-4 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
            >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                    <img
                        src={searchResult.avatar}
                        alt={searchResult.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-lg">
                            {searchResult.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {searchResult.phone}
                        </p>
                        {searchResult.mutualFriends > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                                {searchResult.mutualFriends} أصدقاء مشتركين
                            </p>
                        )}
                    </div>
                </div>

                {/* Status */}
                <div
                    className={`flex items-center gap-2 mb-4 ${statusInfo.color}`}
                >
                    <StatusIcon size={18} />
                    <div>
                        <span className="font-medium">{statusInfo.text}</span>
                        {statusInfo.description && (
                            <p className="text-xs text-gray-600 mt-1">
                                {statusInfo.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {searchResult.relationshipStatus === "accepted" && (
                        <>
                            <button
                                onClick={handleSendPulse}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                <FiHeart size={16} />
                                <span>إرسال نبضة</span>
                            </button>
                            <button
                                onClick={() =>
                                    alert("ميزة المحادثة قيد التطوير")
                                }
                                className="px-4 py-2 rounded-full text-primary border border-primary hover:bg-primary/10"
                            >
                                <FiMessageCircle size={16} />
                            </button>
                        </>
                    )}

                    {searchResult.relationshipStatus === "pending_sent" && (
                        <button
                            onClick={handleCancelRequest}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            <FiUserX size={16} />
                            <span>إلغاء الطلب</span>
                        </button>
                    )}

                    {searchResult.relationshipStatus === "pending_received" && (
                        <>
                            <button
                                onClick={handleAcceptRequest}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                <FiUserCheck size={16} />
                                <span>قبول</span>
                            </button>
                            <button
                                onClick={handleRejectRequest}
                                disabled={isLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <FiUserX size={16} />
                                <span>رفض</span>
                            </button>
                        </>
                    )}

                    {searchResult.relationshipStatus === "none" && (
                        <button
                            onClick={handleSendFriendRequest}
                            disabled={isLoading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                        >
                            <FiUserPlus size={16} />
                            <span>إرسال طلب صداقة</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderInvitationResult = () => {
        if (!searchResult || !searchResult.not_found) return null;

        return (
            <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser size={24} className="text-gray-500" />
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-800">
                            مستخدم جديد
                        </h3>
                        <p className="text-sm text-gray-500">
                            {searchResult.phone}
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <FiMessageCircle size={18} />
                        <span className="font-medium">دعوة للانضمام</span>
                    </div>
                    <p className="text-sm text-blue-600">
                        هذا المستخدم غير مسجل في منصة نبض. يمكنك دعوته للانضمام
                        عبر WhatsApp!
                    </p>
                </div>

                <button
                    onClick={handleSendInvitation}
                    disabled={processing || isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                    <FiSend size={16} />
                    <span>إرسال دعوة عبر WhatsApp</span>
                    <FiExternalLink size={14} />
                </button>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    onClick={onClose}
                ></div>

                <div className="relative bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            البحث عن صديق
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 p-1"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-4">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleSearch()
                            }
                            placeholder="أدخل رقم الهاتف (مثل: 1234567890)..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="w-full mb-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50 font-medium"
                    >
                        {isLoading ? "جاري البحث..." : "بحث"}
                    </button>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
                            <p className="text-sm text-green-600">
                                {successMessage}
                            </p>
                        </div>
                    )}

                    {/* Results */}
                    {searchResult &&
                        !searchResult.not_found &&
                        renderUserResult()}
                    {searchResult &&
                        searchResult.not_found &&
                        renderInvitationResult()}

                    {/* Helper Text */}
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 text-center">
                            💡 نصيحة: تأكد من إدخال رقم الهاتف بشكل صحيح للحصول
                            على أفضل النتائج
                        </p>
                    </div>

                    {/* Send Pulse Modal */}
                    {showSendPulseModal && searchResult && (
                        <SendPulseModal
                            friend={{
                                id: searchResult.id,
                                name: searchResult.name,
                                avatar: searchResult.avatar,
                                isOnline: searchResult.isOnline || false,
                            }}
                            onClose={closeSendPulseModal}
                            onPulseSent={onPulseSent}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Modal for sending a pulse to a specific friend (reused from FriendsPage)
 */
const SendPulseModal = ({ friend, onClose, onPulseSent }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendPulse = async () => {
        if (!message.trim()) {
            alert("الرجاء كتابة رسالة النبضة");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "/pulses/send",
                {
                    type: "direct",
                    message: message.trim(),
                    friend_id: friend.id,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
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

export default FriendSearchModal;
