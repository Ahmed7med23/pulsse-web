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
            description: "مجموعة للمبدعين في مختلف المجالات",
            members: 234,
            pulses: 567,
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        },
        {
            id: 4,
            name: "دوائر رواد الأعمال",
            description: "مجموعة لرواد الأعمال والمستثمرين",
            members: 178,
            pulses: 345,
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        },
    ];

    const circleInvites = [
        {
            id: 5,
            name: "دوائر المطورين العرب",
            description: "مجموعة للمطورين العرب",
            members: 445,
            pulses: 789,
            invitedBy: "أحمد محمد",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
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
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
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
                </div>

                {/* Circles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeTab === "my-circles" &&
                        safeCircles.map((circle) => (
                            <CircleCard
                                key={circle.id}
                                circle={circle}
                                type="my-circle"
                                onSettingsClick={() =>
                                    handleNavigateToCircleDetails(circle.id)
                                }
                            />
                        ))}
                    {activeTab === "discover" &&
                        discoverCircles.map((circle) => (
                            <CircleCard
                                key={circle.id}
                                circle={circle}
                                type="discover"
                                onSettingsClick={() =>
                                    handleNavigateToCircleDetails(circle.id)
                                }
                            />
                        ))}
                    {activeTab === "invites" &&
                        circleInvites.map((circle) => (
                            <CircleCard
                                key={circle.id}
                                circle={circle}
                                type="invite"
                                onSettingsClick={() =>
                                    handleNavigateToCircleDetails(circle.id)
                                }
                            />
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

const CircleCard = ({ circle, type = "my-circle", onSettingsClick }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
        <div className="relative h-32">
            <img
                src={
                    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                }
                alt={circle.name}
                className="w-full h-full object-cover"
            />
            {
                <div className="absolute top-2 right-2">
                    <button
                        onClick={onSettingsClick}
                        className="p-2 bg-white/80 rounded-full hover:bg-white transition-all"
                    >
                        <FiSettings size={18} className="text-gray-600" />
                    </button>
                </div>
            }
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-gray-800 text-lg mb-1">
                {circle.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{circle.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    <FiUsers size={16} />
                    <span>{circle.members_count || 0} عضو</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiMessageSquare size={16} />
                    <span>{circle.pulses_count || 0} نبضة</span>
                </div>
            </div>

            {type === "invite" && (
                <div className="text-sm text-gray-500 mb-4">
                    دعوة من:{" "}
                    <span className="font-medium text-gray-700">
                        {circle.invitedBy}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {circle.lastActivity || "منذ قليل"}
                </span>
                {type === "my-circle" ? (
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90">
                        <FiMessageSquare size={16} />
                        <span>إرسال نبضة</span>
                    </button>
                ) : type === "discover" ? (
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary/90">
                        <FiPlus size={16} />
                        <span>الانضمام</span>
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600">
                            <FiHeart size={16} />
                            <span>قبول</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600">
                            <FiUsers size={16} />
                            <span>رفض</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const WrappedCirclesPage = ({ circles }) => {
    return (
        <MainLayout>
            <CirclesPage circles={circles} />
        </MainLayout>
    );
};

export default WrappedCirclesPage;
