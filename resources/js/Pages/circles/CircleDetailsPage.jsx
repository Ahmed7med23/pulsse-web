import React, { useState, useEffect } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { Head, router } from "@inertiajs/react";
import {
    FiArrowLeft,
    FiSettings,
    FiUsers,
    FiPlus,
    FiTrash2,
    FiHeart,
    FiMessageSquare,
    FiStar,
    FiGlobe,
    FiLock,
    FiMoreVertical,
    FiUserMinus,
    FiClock,
    FiUserPlus,
    FiActivity,
    FiSend,
    FiX,
    FiLoader,
    FiArrowRight,
} from "react-icons/fi";
import axios from "axios";

// Mock data for initial members (can be removed when real data is available)
const mockInitialMembers = [
    {
        id: 1,
        name: "أحمد محمد",
        avatar: "https://ui-avatars.com/api/?name=أحمد+محمد&background=6366f1&color=fff",
        added_at: "منذ 3 أيام",
    },
    {
        id: 2,
        name: "فاطمة علي",
        avatar: "https://ui-avatars.com/api/?name=فاطمة+علي&background=8b5cf6&color=fff",
        added_at: "منذ أسبوع",
    },
];

const CircleDetailsPage = ({ circle, members: initialMembers }) => {
    // Ensure circle and its properties are defined, providing defaults
    const safeCircle = circle || {
        id: "temp",
        name: "اسم الدائرة غير متوفر",
        description: "وصف غير متوفر",
        members_count: 0,
        pulses_count: 0,
        color: "from-blue-400 to-indigo-500",
        icon: "users",
        privacy_type: "private",
        is_favorite: false,
        created_at: "غير محدد",
    };

    // Ensure initialMembers is always an array
    const safeInitialMembers = Array.isArray(initialMembers)
        ? initialMembers
        : [];

    const [members, setMembers] = useState(
        safeInitialMembers.length > 0 ? safeInitialMembers : mockInitialMembers
    );
    const [removingMember, setRemovingMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSendPulseModal, setShowSendPulseModal] = useState(false);
    const [circleStats, setCircleStats] = useState({
        members_count: safeCircle.members_count || 0,
        pulses_count: safeCircle.pulses_count || 0,
    });
    const [refreshingStats, setRefreshingStats] = useState(false);

    const iconMapping = {
        star: <FiStar />,
        heart: <FiHeart />,
        chat: <FiMessageSquare />,
        users: <FiUsers />,
        settings: <FiSettings />,
        globe: <FiGlobe />,
    };

    // Fetch circle members on component mount
    useEffect(() => {
        fetchMembers();
    }, [safeCircle.id]);

    // Update circle stats when circle data changes
    useEffect(() => {
        setCircleStats({
            members_count: safeCircle.members_count || 0,
            pulses_count: safeCircle.pulses_count || 0,
        });
    }, [safeCircle]);

    const refreshCircleStats = async () => {
        try {
            setRefreshingStats(true);
            // Refresh the entire page to get updated stats from backend
            router.reload({ only: ["circle"] });
        } catch (error) {
            console.error("Error refreshing circle stats:", error);
        } finally {
            setRefreshingStats(false);
        }
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `/api/circles/${safeCircle.id}/members`,
                {
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            console.log("API Response:", response.data); // للتحقق من البيانات

            // الآن API يرجع البيانات مباشرة كمصفوفة
            const membersData = Array.isArray(response.data)
                ? response.data
                : response.data.members || [];

            console.log("Members Data:", membersData); // للتحقق من البيانات المعالجة

            setMembers(membersData);
        } catch (err) {
            console.error("Error fetching members:", err);
            setError("حدث خطأ في تحميل أعضاء الدائرة");

            // في حالة الخطأ، اعرض رسالة واضحة
            if (err.response?.status === 403) {
                setError("لا يمكنك الوصول لهذه الدائرة");
            } else if (err.response?.status === 404) {
                setError("الدائرة غير موجودة");
            }

            // Keep existing members or use mock data as fallback
            if (members.length === 0) {
                setMembers(mockInitialMembers);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        if (
            !confirm(
                `هل أنت متأكد من إزالة ${memberName} من دائرة "${safeCircle.name}"؟`
            )
        ) {
            return;
        }

        setRemovingMember(memberId);

        try {
            const response = await axios.post(
                "/api/circles/remove-member",
                {
                    circle_id: safeCircle.id,
                    member_id: memberId,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                // Remove member from local state
                setMembers((prev) =>
                    prev.filter((member) => member.id !== memberId)
                );

                // Show success message
                alert(
                    response.data.message.ar ||
                        "تم إزالة العضو من الدائرة بنجاح!"
                );

                // Optionally refresh page to update counters
                // window.location.reload();
            }
        } catch (error) {
            console.error("Error removing member:", error);
            const errorMessage =
                error.response?.data?.message?.ar ||
                "حدث خطأ أثناء إزالة العضو من الدائرة";
            alert(errorMessage);
        } finally {
            setRemovingMember(null);
        }
    };

    const handleDeleteCircle = () => {
        if (
            window.confirm(
                `هل أنت متأكد أنك تريد حذف دائرة "${safeCircle.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            )
        ) {
            router.visit("/circles"); // Redirect after (simulated) deletion
        }
    };

    const handleGoToAddMembers = () => {
        router.visit("/friends"); // Go to friends page to add more members
    };

    if (!circle) {
        // Handles case where circle data might not be loaded yet or is invalid
        return (
            <MainLayout>
                <Head title="الدائرة غير موجودة" />
                <div className="container mx-auto px-4 py-10 text-center">
                    <p className="text-2xl text-gray-700 mb-4">
                        جاري تحميل بيانات الدائرة أو أن الدائرة غير موجودة...
                    </p>
                    <button
                        onClick={() => router.visit("/circles")}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FiArrowLeft />
                        <span>العودة إلى قائمة الدوائر</span>
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Head title={`دائرة ${safeCircle.name}`} />

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit("/circles")}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <FiArrowRight size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                دائرة {safeCircle.name}
                            </h1>
                            <p className="text-gray-600 text-sm">
                                {safeCircle.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSendPulseModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <FiSend size={16} />
                            <span>إرسال نبضة</span>
                        </button>
                        <button
                            onClick={handleDeleteCircle}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <FiTrash2 size={16} />
                            حذف الدائرة
                        </button>
                    </div>
                </div>

                {/* Circle Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Circle Card */}
                    <div
                        className={`bg-gradient-to-r ${safeCircle.color} rounded-xl p-6 text-white`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-3xl">
                                {iconMapping[safeCircle.icon] || <FiUsers />}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl">
                                    {safeCircle.name}
                                </h3>
                                <p className="text-sm opacity-90">
                                    {safeCircle.privacy_type === "private" ? (
                                        <>
                                            <FiLock
                                                className="inline mr-1"
                                                size={12}
                                            />
                                            دائرة خاصة
                                        </>
                                    ) : (
                                        <>
                                            <FiGlobe
                                                className="inline mr-1"
                                                size={12}
                                            />
                                            دائرة عامة
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        {safeCircle.is_favorite && (
                            <div className="mt-3 flex items-center gap-1 text-sm">
                                <FiStar size={14} />
                                دائرة مفضلة
                            </div>
                        )}
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Members Count */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <FiUsers
                                            className="text-blue-600"
                                            size={24}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl text-gray-800">
                                            {Array.isArray(members)
                                                ? members.length
                                                : circleStats.members_count}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            الأعضاء
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={refreshCircleStats}
                                    disabled={refreshingStats}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="تحديث الإحصائيات"
                                >
                                    <FiActivity
                                        size={16}
                                        className={
                                            refreshingStats
                                                ? "animate-spin"
                                                : ""
                                        }
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Pulses Count */}
                        <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-full">
                                        <FiMessageSquare
                                            className="text-purple-600"
                                            size={24}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl text-gray-800">
                                            {circleStats.pulses_count}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            النبضات
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {circleStats.pulses_count > 0 && (
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            نشط
                                        </span>
                                    )}
                                    <button
                                        onClick={refreshCircleStats}
                                        disabled={refreshingStats}
                                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                                        title="تحديث الإحصائيات"
                                    >
                                        <FiActivity
                                            size={16}
                                            className={
                                                refreshingStats
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Additional pulse info */}
                            {circleStats.pulses_count > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500">
                                        آخر نبضة:{" "}
                                        {safeCircle.lastActivity ||
                                            safeCircle.last_activity ||
                                            "غير محدد"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Members Section */}
                <div className="bg-white rounded-xl border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiUsers className="text-blue-600" />
                                أعضاء الدائرة (
                                {Array.isArray(members) ? members.length : 0})
                            </h2>
                            <div className="flex items-center gap-2">
                                {/* Manual refresh button */}
                                <button
                                    onClick={fetchMembers}
                                    disabled={loading}
                                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                                        loading
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-1">
                                            <FiLoader className="animate-spin w-3 h-3" />
                                            <span>تحديث</span>
                                        </div>
                                    ) : (
                                        "🔄 تحديث"
                                    )}
                                </button>

                                {(!Array.isArray(members) ||
                                    members.length === 0) &&
                                    !loading && (
                                        <button
                                            onClick={handleGoToAddMembers}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            إضافة الأعضاء الأوائل
                                        </button>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-3 text-blue-600">
                                    <FiLoader
                                        className="animate-spin"
                                        size={24}
                                    />
                                    <span>جاري تحميل الأعضاء...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <div className="text-red-500 mb-4">
                                    <FiUsers size={48} className="mx-auto" />
                                </div>
                                <p className="text-red-600 font-medium mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={fetchMembers}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    إعادة المحاولة
                                </button>
                            </div>
                        ) : !Array.isArray(members) || members.length === 0 ? (
                            <div className="text-center py-12">
                                <FiUsers
                                    size={48}
                                    className="text-gray-300 mx-auto mb-4"
                                />
                                <h3 className="text-lg font-medium text-gray-500 mb-2">
                                    لا يوجد أعضاء في هذه الدائرة
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    ابدأ بإضافة أصدقائك إلى هذه الدائرة لتتمكن
                                    من إرسال النبضات الجماعية
                                </p>
                                <button
                                    onClick={handleGoToAddMembers}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <FiPlus size={16} />
                                    إضافة أعضاء الآن
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {members.map((member) => (
                                        <MemberCard
                                            key={member.id}
                                            member={member}
                                            onRemove={() =>
                                                handleRemoveMember(
                                                    member.id,
                                                    member.name
                                                )
                                            }
                                            isRemoving={
                                                removingMember === member.id
                                            }
                                        />
                                    ))}
                                </div>

                                {/* Add more members button */}
                                {members.length > 0 && (
                                    <div className="mt-6 text-center">
                                        <button
                                            onClick={handleGoToAddMembers}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <FiUserPlus size={16} />
                                            إضافة المزيد من الأعضاء
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Circle Info */}
                <div className="mt-6 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FiClock size={14} />
                        تم إنشاء الدائرة {safeCircle.created_at}
                    </div>
                </div>
            </div>

            {/* Send Pulse Modal */}
            {showSendPulseModal && (
                <SendCirclePulseModal
                    circle={safeCircle}
                    onClose={() => setShowSendPulseModal(false)}
                    onPulseSent={(success) => {
                        setShowSendPulseModal(false);
                        // Refresh circle stats after sending pulse
                        refreshCircleStats();
                    }}
                />
            )}
        </MainLayout>
    );
};

// Member Card Component
const MemberCard = ({ member, onRemove, isRemoving }) => {
    return (
        <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-medium text-gray-800">
                            {member.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiClock size={12} />
                            انضم {member.added_at}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onRemove}
                    disabled={isRemoving}
                    className={`p-2 rounded-full transition-colors ${
                        isRemoving
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:bg-red-50"
                    }`}
                    title="إزالة من الدائرة"
                >
                    {isRemoving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                    ) : (
                        <FiUserMinus size={16} />
                    )}
                </button>
            </div>
        </div>
    );
};

// Send Circle Pulse Modal
const SendCirclePulseModal = ({ circle, onClose, onPulseSent }) => {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showDefaultPulses, setShowDefaultPulses] = useState(true);

    // النبضات الافتراضية للدوائر
    const defaultPulses = [
        {
            id: 1,
            emoji: "🎉",
            title: "تهنئة عيد الأضحى",
            message:
                "كل عام وأنتم بخير بمناسبة عيد الأضحى المبارك! عساكم من عواده 🎉🐑",
            color: "bg-green-50 border-green-200 text-green-700",
        },
        {
            id: 2,
            emoji: "💭",
            title: "تذكير ودعاء",
            message:
                "مرحباً جميعاً! أردت أن أذكركم وأدعو لكم بالخير والبركة 💙",
            color: "bg-blue-50 border-blue-200 text-blue-700",
        },
        {
            id: 3,
            emoji: "🤲",
            title: "دعوة للدعاء",
            message:
                "تذكروا أن تدعوا لبعضكم البعض في صلاتكم، ندعو لكم جميعاً 🤲✨",
            color: "bg-purple-50 border-purple-200 text-purple-700",
        },
        {
            id: 4,
            emoji: "☕",
            title: "دعوة لقاء جماعي",
            message: "ما رأيكم نتقابل قريباً لشرب القهوة والتحدث جميعاً؟ ☕😊",
            color: "bg-amber-50 border-amber-200 text-amber-700",
        },
        {
            id: 5,
            emoji: "❤️",
            title: "تقدير للمجموعة",
            message:
                "أقدر وجودكم جميعاً في هذه الدائرة، شكراً لكم على كل شيء ❤️",
            color: "bg-pink-50 border-pink-200 text-pink-700",
        },
        {
            id: 6,
            emoji: "🌅",
            title: "صباح الخير للجميع",
            message:
                "صباح الخير أحبائي! أتمنى لكم جميعاً يوماً مليئاً بالسعادة والبركة 🌅✨",
            color: "bg-orange-50 border-orange-200 text-orange-700",
        },
    ];

    // وظيفة لاختيار نبضة افتراضية
    const handleSelectDefaultPulse = async (defaultPulse) => {
        const shouldSendDirectly = confirm(
            `هل تريد إرسال "${defaultPulse.title}" مباشرة لجميع أعضاء الدائرة؟\n\nالرسالة: ${defaultPulse.message}`
        );

        if (shouldSendDirectly) {
            await sendPulseWithMessage(defaultPulse.message);
        } else {
            setMessage(defaultPulse.message);
            setShowDefaultPulses(false);
        }
    };

    const sendPulseWithMessage = async (pulseMessage) => {
        try {
            setLoading(true);

            const response = await axios.post("/pulses/send", {
                type: "circle",
                message: pulseMessage.trim(),
                circle_id: circle.id,
            });

            if (response.data.message) {
                alert("تم إرسال النبضة إلى جميع أعضاء الدائرة بنجاح! 🎉");
                onPulseSent(true);
            }
        } catch (error) {
            console.error("Error sending circle pulse:", error);
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
                        إرسال نبضة لدائرة {circle.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Circle Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                            <FiUsers className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-800">
                                {circle.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                سيتم إرسال النبضة لجميع الأعضاء
                            </p>
                        </div>
                    </div>

                    {/* النبضات الافتراضية */}
                    {showDefaultPulses && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    نبضات سريعة للدائرة ⚡
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
                            rows={4}
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

export default CircleDetailsPage;
