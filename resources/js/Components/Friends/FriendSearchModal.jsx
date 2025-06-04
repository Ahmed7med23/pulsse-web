import React, { useState } from "react";
import {
    FiSearch,
    FiX,
    FiUserPlus,
    FiUserCheck,
    FiSend,
    FiUser,
} from "react-icons/fi";
import axios from "axios";
import { useForm } from "@inertiajs/react";

const FriendSearchModal = ({ isOpen, onClose }) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isFriend, setIsFriend] = useState(false);
    const [isInvitationSent, setIsInvitationSent] = useState(false);
    const [isUserNotFound, setIsUserNotFound] = useState(false);

    const {
        data: invitationPhone,
        setData: setInvitationPhone,
        post,
        processing,
        errors,
    } = useForm({
        phone: "",
    });

    const handleSearch = async () => {
        if (!phoneNumber.trim()) {
            setError("الرجاء إدخال رقم الهاتف");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setSearchResult(null);
            setIsFriend(false);
            setIsInvitationSent(false);
            setIsUserNotFound(false);

            const response = await axios.get("/friends/search-by-phone", {
                params: { phone: phoneNumber },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (response.data.isInvitationSent) {
                setIsInvitationSent(true);
                setError(response.data.message);
            } else if (response.data) {
                setSearchResult(response.data);
                setIsFriend(response.data.isFriend);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setIsUserNotFound(true);
                setError("لم يتم العثور على مستخدم بهذا الرقم");
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
        setInvitationPhone("phone", phoneNumber);
        post(
            "/friends/send-invitation",
            {
                phone: phoneNumber,
            },
            {
                onSuccess: () => {
                    setIsInvitationSent(true);
                    setError("تم إرسال الدعوة بنجاح");
                    setPhoneNumber("");

                    // close modal
                    onClose();
                },
                onError: (err) => {
                    setError(err.response?.data?.message);
                },
            }
        );
    };

    const handleSendFriendRequest = async () => {
        if (!searchResult) return;

        try {
            setIsLoading(true);
            const response = await axios.post(
                "/friends/send-request",
                { userId: searchResult.id },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );
            setError(response.data.message || "تم إرسال طلب الصداقة بنجاح");
        } catch (err) {
            setError(
                err.response?.data?.message || "حدث خطأ أثناء إرسال طلب الصداقة"
            );
            console.error("Friend request error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div
                    className="fixed inset-0 bg-black bg-opacity-50"
                    onClick={onClose}
                ></div>

                <div className="relative bg-white rounded-lg w-full max-w-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            البحث عن صديق
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="أدخل رقم الهاتف..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <button
                        onClick={handleSearch}
                        disabled={isLoading}
                        className="w-full mb-4 py-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50"
                    >
                        {isLoading ? "جاري البحث..." : "بحث"}
                    </button>

                    {error && (
                        <div
                            className={`text-sm mb-4 ${
                                isInvitationSent
                                    ? "text-green-600"
                                    : "text-red-500"
                            }`}
                        >
                            {error}
                        </div>
                    )}

                    {isUserNotFound && !isInvitationSent && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FiUser
                                        size={24}
                                        className="text-gray-500"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-800">
                                        مستخدم جديد
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {phoneNumber}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                هذا المستخدم غير مسجل في المنصة. يمكنك إرسال
                                دعوة له للانضمام.
                            </p>
                            <button
                                onClick={handleSendInvitation}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                            >
                                <FiSend size={16} />
                                <span>إرسال دعوة للانضمام</span>
                            </button>
                        </div>
                    )}

                    {isInvitationSent && (
                        <div className="border rounded-lg p-4 bg-green-50">
                            <div className="flex items-center gap-2 text-green-600 mb-2">
                                <FiSend size={20} />
                                <span className="font-medium">
                                    تم إرسال الدعوة بنجاح
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">
                                تم إرسال دعوة للمستخدم للانضمام إلى المنصة عبر
                                WhatsApp. سيتم إعلامك عندما ينضم.
                            </p>
                        </div>
                    )}

                    {searchResult && (
                        <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={searchResult.avatar}
                                    alt={searchResult.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-medium text-gray-800">
                                        {searchResult.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {searchResult.phone}
                                    </p>
                                </div>
                            </div>

                            {isFriend ? (
                                <div className="mt-4 flex items-center gap-2 text-green-600">
                                    <FiUserCheck size={20} />
                                    <span>
                                        {(() => {
                                            switch (
                                                searchResult.friendship_status
                                            ) {
                                                case "accepted":
                                                    return "أنتما أصدقاء بالفعل";
                                                case "pending":
                                                    return "طلب الصداقة قيد الانتظار";
                                                case "rejected":
                                                    return "تم رفض طلب الصداقة";
                                                case "blocked":
                                                    return "تم الحظر";
                                                default:
                                                    return "حالة غير معروفة";
                                            }
                                        })()}
                                    </span>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSendFriendRequest}
                                    disabled={isLoading}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <FiUserPlus size={16} />
                                    <span>إرسال طلب صداقة</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendSearchModal;
