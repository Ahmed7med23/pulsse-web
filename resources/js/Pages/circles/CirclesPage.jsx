import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    FiPlus,
    FiSearch,
    FiUsers,
    FiSettings,
    FiMessageSquare,
    FiHeart,
    FiMoreHorizontal,
    FiLock,
    FiGlobe,
    FiStar,
} from "react-icons/fi";
import CreateCircleSheet from "./CreateCircleSheet";
import MainLayout from "../../Layouts/MainLayout";

const CIRCLE_COLORS = [
    { color: "#FFD600" },
    { color: "#4DD637" },
    { color: "#00B8D9" },
    { color: "#7C4DFF" },
    { color: "#F06292" },
];

const availableColors = [
    { id: 1, value: "from-rose-400 to-red-500", label: "أحمر" },
    { id: 2, value: "from-violet-400 to-purple-500", label: "بنفسجي" },
    { id: 3, value: "from-blue-400 to-indigo-500", label: "أزرق" },
    { id: 4, value: "from-emerald-400 to-green-500", label: "أخضر" },
    { id: 5, value: "from-amber-400 to-yellow-500", label: "ذهبي" },
    { id: 6, value: "from-cyan-400 to-teal-500", label: "تركوازي" },
    { id: 7, value: "from-pink-400 to-rose-500", label: "وردي" },
    { id: 8, value: "from-orange-400 to-red-500", label: "برتقالي" },
    { id: 9, value: "from-indigo-400 to-blue-500", label: "نيلي" },
    { id: 10, value: "from-purple-400 to-indigo-500", label: "أرجواني" },
];
const CIRCLE_ICONS = [
    { icon: <FiStar />, value: "star" },
    { icon: <FiHeart />, value: "heart" },
    { icon: <FiMessageSquare />, value: "chat" },
    { icon: <FiUsers />, value: "users" },
    { icon: <FiSettings />, value: "settings" },
    { icon: <FiGlobe />, value: "globe" },
];

const CirclesPage = ({ circles }) => {
    // Debug: Check if circles data is received
    console.log("Circles data received:", circles);

    const [activeTab, setActiveTab] = useState("my-circles"); // my-circles, discover, invites
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [circleForm, setCircleForm] = useState({
        name: "",
        description: "",
        color: availableColors[0].value,
        icon: CIRCLE_ICONS[0].value,
        privacy: "private",
    });

    // Ensure circles is always an array
    const safeCircles = circles || [];

    const discoverCircles = [
        {
            id: 3,
            name: "دوائر المبدعين",
            description:
                "مجموعة للمبدعين في مختلف المجالات الفنية والإبداعية لتبادل الأفكار والخبرات",
            members: 234,
            pulses: 567,
            icon: "star",
            color: "from-purple-500 to-pink-500",
            privacy: "public",
        },
        {
            id: 4,
            name: "رواد الأعمال",
            description:
                "شبكة لرواد الأعمال والمستثمرين لمشاركة الفرص والتجارب التجارية",
            members: 178,
            pulses: 345,
            icon: "globe",
            color: "from-blue-500 to-indigo-600",
            privacy: "public",
        },
        {
            id: 5,
            name: "محبي التكنولوجيا",
            description:
                "مجتمع للمهتمين بأحدث التطورات التكنولوجية والابتكارات",
            members: 456,
            pulses: 823,
            icon: "settings",
            color: "from-green-500 to-teal-500",
            privacy: "public",
        },
    ];

    const circleInvites = [
        {
            id: 6,
            name: "دوائر المطورين العرب",
            description:
                "مجموعة للمطورين العرب لمشاركة المعرفة التقنية والمشاريع",
            members: 445,
            pulses: 789,
            invitedBy: "أحمد محمد",
            icon: "chat",
            color: "from-orange-500 to-red-500",
            privacy: "private",
        },
        {
            id: 7,
            name: "مجتمع القراءة",
            description: "دائرة لمحبي القراءة ومناقشة الكتب والأدب",
            members: 289,
            pulses: 654,
            invitedBy: "فاطمة أحمد",
            icon: "heart",
            color: "from-rose-400 to-pink-500",
            privacy: "private",
        },
    ];

    const handleFormChange = (field, value) => {
        setCircleForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateCircle = (e) => {
        e.preventDefault();
        // TODO: API call to create circle
        setShowModal(false);
    };

    const handleNavigateToCircleDetails = (circleId) => {
        router.visit(`/circles/${circleId}`);
    };

    return (
        <>
            <Head title="الدوائر" />
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-4 mb-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-800">
                                الدوائر
                            </h1>
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <FiMoreHorizontal
                                        size={20}
                                        className="text-gray-600"
                                    />
                                </button>
                                {showMenu && (
                                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-10">
                                        <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <FiSettings size={16} />
                                            <span>إعدادات الدوائر</span>
                                        </button>
                                        <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <FiUsers size={16} />
                                            <span>إدارة الأعضاء</span>
                                        </button>
                                        <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                            <FiMessageSquare size={16} />
                                            <span>إدارة النبضات</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90"
                            onClick={() => setShowModal(true)}
                        >
                            <FiPlus size={16} />
                            <span>إنشاء دائرة</span>
                        </button>
                    </div>

                    {/* Search Section */}
                    <div className="relative max-w-xl mx-auto w-full">
                        <input
                            type="text"
                            placeholder="ابحث عن دوائر، أعضاء، أو نبضات..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary"
                        />
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Tabs Section */}
                {/* <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab("my-circles")}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${
                            activeTab === "my-circles"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        دوائري
                    </button>
                    <button
                        onClick={() => setActiveTab("discover")}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${
                            activeTab === "discover"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        اكتشف دوائر
                    </button>
                    <button
                        onClick={() => setActiveTab("invites")}
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${
                            activeTab === "invites"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                    >
                        دعوات
                    </button>
                </div> */}

                {/* Circles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
                    {activeTab === "my-circles" &&
                        (safeCircles.length > 0 ? (
                            safeCircles.map((circle) => (
                                <CircleCard
                                    key={circle.id}
                                    circle={circle}
                                    type="my-circle"
                                    onSettingsClick={() =>
                                        handleNavigateToCircleDetails(circle.id)
                                    }
                                />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                                    <FiUsers
                                        size={32}
                                        className="text-gray-400"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    لا توجد دوائر بعد
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md">
                                    ابدأ بإنشاء دائرتك الأولى لتتواصل مع أصدقائك
                                    وتشارك النبضات معهم
                                </p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    <FiPlus size={18} />
                                    <span>إنشاء دائرة جديدة</span>
                                </button>
                            </div>
                        ))}

                    {activeTab === "discover" &&
                        discoverCircles.map((circle) => (
                            <CircleCard
                                key={circle.id}
                                circle={circle}
                                type="discover"
                            />
                        ))}

                    {activeTab === "invites" &&
                        (circleInvites.length > 0 ? (
                            circleInvites.map((circle) => (
                                <CircleCard
                                    key={circle.id}
                                    circle={circle}
                                    type="invite"
                                />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mb-6">
                                    <FiHeart
                                        size={32}
                                        className="text-blue-500"
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    لا توجد دعوات
                                </h3>
                                <p className="text-gray-500 max-w-md">
                                    عندما يدعوك أصدقاؤك للانضمام إلى دوائرهم،
                                    ستظهر الدعوات هنا
                                </p>
                            </div>
                        ))}
                </div>
            </div>

            <CreateCircleSheet
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                formData={circleForm}
                onFormChange={handleFormChange}
                onSubmit={handleCreateCircle}
            />
        </>
    );
};

const CircleCard = ({ circle, type = "my-circle", onSettingsClick }) => {
    // Icon mapping
    const iconMapping = {
        star: <FiStar />,
        heart: <FiHeart />,
        chat: <FiMessageSquare />,
        users: <FiUsers />,
        settings: <FiSettings />,
        globe: <FiGlobe />,
    };

    // Get the icon component
    const IconComponent = iconMapping[circle.icon] || <FiUsers />;

    // Color fallback - assign random color if none exists
    let circleColor = circle.color;
    if (!circleColor) {
        const randomIndex = (circle.id || 0) % availableColors.length;
        circleColor = availableColors[randomIndex].value;
    }

    // Handle different data structures for members/pulses count
    const membersCount = circle.members_count || circle.members || 0;
    const pulsesCount =
        circle.pulses_count || circle.pulses || circle.total_pulses || 0;

    // Format last activity for better readability
    const formatLastActivity = (activity) => {
        if (!activity) return "لم يتم تحديد وقت النشاط";

        // If it's already formatted in Arabic, return as is
        if (typeof activity === "string" && activity.includes("منذ")) {
            return activity;
        }

        // Otherwise use default
        return activity || "منذ قليل";
    };

    return (
        <div
            className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() =>
                type === "my-circle" && onSettingsClick && onSettingsClick()
            }
        >
            {/* Gradient Header with Icon */}
            <div
                className={`relative h-24 bg-gradient-to-r ${circleColor} flex items-center justify-center`}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>

                {/* Icon */}
                <div className="relative z-10 text-white text-3xl drop-shadow-lg">
                    {IconComponent}
                </div>

                {/* Privacy Badge */}
                <div className="absolute top-2 left-2">
                    <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full flex items-center gap-1">
                        {circle.privacy_type === "private" ||
                        circle.privacy === "private" ? (
                            <FiLock size={12} className="text-white" />
                        ) : (
                            <FiGlobe size={12} className="text-white" />
                        )}
                        <span className="text-xs text-white font-medium">
                            {circle.privacy_type === "private" ||
                            circle.privacy === "private"
                                ? "خاصة"
                                : "عامة"}
                        </span>
                    </div>
                </div>

                {/* Settings Button */}
                {type === "my-circle" && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSettingsClick && onSettingsClick();
                            }}
                            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                        >
                            <FiSettings size={16} className="text-white" />
                        </button>
                    </div>
                )}

                {/* Favorite Star (if applicable) */}
                {circle.is_favorite && (
                    <div className="absolute bottom-2 left-2">
                        <div className="p-1 bg-yellow-400/90 rounded-full">
                            <FiStar
                                size={12}
                                className="text-white fill-current"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title and Description */}
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                        {circle.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {circle.description || "لا يوجد وصف"}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-blue-600">
                            <FiUsers size={16} />
                            <span className="text-sm font-medium">
                                {membersCount}
                            </span>
                            <span className="text-xs text-gray-500">عضو</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600">
                            <FiMessageSquare size={16} />
                            <span className="text-sm font-medium">
                                {pulsesCount}
                            </span>
                            <span className="text-xs text-gray-500">نبضة</span>
                        </div>
                    </div>

                    {/* Activity Indicator */}
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">نشط</span>
                    </div>
                </div>

                {/* Invite Info (for invites) */}
                {type === "invite" && circle.invitedBy && (
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <FiUsers size={12} className="text-white" />
                            </div>
                            <span className="text-sm text-gray-700">
                                دعوة من:{" "}
                                <span className="font-medium text-blue-700">
                                    {circle.invitedBy}
                                </span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                    {type === "my-circle" ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSettingsClick && onSettingsClick();
                            }}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all bg-gradient-to-r ${circleColor} text-white hover:shadow-lg hover:scale-105`}
                        >
                            <FiMessageSquare size={16} />
                            <span>إدارة الدائرة</span>
                        </button>
                    ) : type === "discover" ? (
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105 transition-all"
                        >
                            <FiPlus size={16} />
                            <span>طلب الانضمام</span>
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-md transition-all"
                            >
                                <FiHeart size={14} />
                                <span>قبول</span>
                            </button>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-md transition-all"
                            >
                                <span>رفض</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Last Activity - Made more prominent and readable */}
                <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">
                                آخر نشاط
                            </span>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                            {formatLastActivity(
                                circle.lastActivity ||
                                    circle.last_activity ||
                                    circle.created_at
                            )}
                        </span>
                    </div>
                    {membersCount > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                            {membersCount} من الأصدقاء متصلين
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const WrappedCirclesPage = ({ circles }) => {
    return (
        <MainLayout>
            <CirclesPage circles={circles} />
        </MainLayout>
    );
};

export default WrappedCirclesPage;
