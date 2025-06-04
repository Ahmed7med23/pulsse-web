import React, { useState, useEffect } from "react";
import { FiX, FiPlus, FiUsers, FiCheck, FiMinus } from "react-icons/fi";
import axios from "axios";

const AddToCircleModal = ({ friend, isOpen, onClose, onSuccess }) => {
    const [circles, setCircles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [selectedCircle, setSelectedCircle] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchFriendCircles();
        }
    }, [isOpen]);

    const fetchFriendCircles = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/circles/friend-circles", {
                params: { friend_id: friend.id },
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            setCircles(response.data.circles || []);
        } catch (error) {
            console.error("Error fetching circles:", error);
            setCircles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCircle = async (circleId) => {
        if (!friend?.id || !circleId) return;

        setProcessing(true);
        setSelectedCircle(circleId);

        try {
            const response = await axios.post(
                "/api/circles/add-member",
                {
                    circle_id: circleId,
                    friend_id: friend.id,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                // Update the circle's membership status locally
                setCircles((prev) =>
                    prev.map((circle) =>
                        circle.id === circleId
                            ? {
                                  ...circle,
                                  is_member: true,
                                  members_count: circle.members_count + 1,
                              }
                            : circle
                    )
                );

                // Show success message
                alert(
                    response.data.message.ar ||
                        "تم إضافة الصديق إلى الدائرة بنجاح!"
                );
                onSuccess && onSuccess();
            }
        } catch (error) {
            console.error("Error adding friend to circle:", error);
            const errorMessage =
                error.response?.data?.message?.ar ||
                "حدث خطأ أثناء إضافة الصديق إلى الدائرة";
            alert(errorMessage);
        } finally {
            setProcessing(false);
            setSelectedCircle(null);
        }
    };

    const handleRemoveFromCircle = async (circleId) => {
        if (!friend?.id || !circleId) return;

        if (!confirm(`هل أنت متأكد من إزالة ${friend.name} من هذه الدائرة؟`)) {
            return;
        }

        setProcessing(true);
        setSelectedCircle(circleId);

        try {
            const response = await axios.post(
                "/api/circles/remove-member",
                {
                    circle_id: circleId,
                    member_id: friend.id,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.success) {
                // Update the circle's membership status locally
                setCircles((prev) =>
                    prev.map((circle) =>
                        circle.id === circleId
                            ? {
                                  ...circle,
                                  is_member: false,
                                  members_count: Math.max(
                                      0,
                                      circle.members_count - 1
                                  ),
                              }
                            : circle
                    )
                );

                // Show success message
                alert(
                    response.data.message.ar ||
                        "تم إزالة الصديق من الدائرة بنجاح!"
                );
                onSuccess && onSuccess();
            }
        } catch (error) {
            console.error("Error removing friend from circle:", error);
            const errorMessage =
                error.response?.data?.message?.ar ||
                "حدث خطأ أثناء إزالة الصديق من الدائرة";
            alert(errorMessage);
        } finally {
            setProcessing(false);
            setSelectedCircle(null);
        }
    };

    const iconMapping = {
        star: "⭐",
        heart: "❤️",
        chat: "💬",
        users: "👥",
        settings: "⚙️",
        globe: "🌍",
    };

    const getGradientClass = (color) => {
        return color || "from-blue-400 to-indigo-500";
    };

    if (!isOpen) return null;

    // Separate member and non-member circles
    const memberCircles = circles.filter((circle) => circle.is_member);
    const availableCircles = circles.filter((circle) => !circle.is_member);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 text-right">
                            إدارة دوائر {friend?.name}
                        </h2>
                        <p className="text-sm text-gray-500 text-right">
                            إضافة أو إزالة من الدوائر
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <FiX size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="mr-3 text-gray-600">
                                جاري تحميل الدوائر...
                            </span>
                        </div>
                    ) : circles.length === 0 ? (
                        <div className="text-center py-8">
                            <FiUsers
                                size={48}
                                className="text-gray-300 mx-auto mb-4"
                            />
                            <h3 className="text-lg font-medium text-gray-500 mb-2">
                                لا توجد دوائر
                            </h3>
                            <p className="text-gray-400 mb-4">
                                أنشئ دائرة جديدة لتتمكن من إضافة الأصدقاء إليها
                            </p>
                            <button
                                onClick={() =>
                                    (window.location.href = "/circles")
                                }
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                            >
                                <FiPlus size={16} />
                                إنشاء دائرة جديدة
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Current Circles */}
                            {memberCircles.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiCheck
                                            className="text-green-500"
                                            size={16}
                                        />
                                        الدوائر الحالية ({memberCircles.length})
                                    </h3>
                                    <div className="grid gap-3">
                                        {memberCircles.map((circle) => (
                                            <CircleCard
                                                key={circle.id}
                                                circle={circle}
                                                isMember={true}
                                                processing={
                                                    processing &&
                                                    selectedCircle === circle.id
                                                }
                                                onAction={() =>
                                                    handleRemoveFromCircle(
                                                        circle.id
                                                    )
                                                }
                                                iconMapping={iconMapping}
                                                getGradientClass={
                                                    getGradientClass
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Available Circles */}
                            {availableCircles.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <FiPlus
                                            className="text-blue-500"
                                            size={16}
                                        />
                                        الدوائر المتاحة (
                                        {availableCircles.length})
                                    </h3>
                                    <div className="grid gap-3">
                                        {availableCircles.map((circle) => (
                                            <CircleCard
                                                key={circle.id}
                                                circle={circle}
                                                isMember={false}
                                                processing={
                                                    processing &&
                                                    selectedCircle === circle.id
                                                }
                                                onAction={() =>
                                                    handleAddToCircle(circle.id)
                                                }
                                                iconMapping={iconMapping}
                                                getGradientClass={
                                                    getGradientClass
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All circles are occupied */}
                            {memberCircles.length > 0 &&
                                availableCircles.length === 0 && (
                                    <div className="text-center py-4 bg-green-50 rounded-lg">
                                        <FiCheck
                                            className="text-green-500 mx-auto mb-2"
                                            size={24}
                                        />
                                        <p className="text-green-600 font-medium">
                                            {friend?.name} موجود في جميع دوائرك!
                                            🎉
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="w-full px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};

// Separate Circle Card Component for better organization
const CircleCard = ({
    circle,
    isMember,
    processing,
    onAction,
    iconMapping,
    getGradientClass,
}) => {
    return (
        <div
            className="relative group cursor-pointer"
            onClick={processing ? undefined : onAction}
        >
            <div
                className={`
                    bg-gradient-to-r ${getGradientClass(circle.color)}
                    rounded-xl p-4 text-white transform transition-all duration-200
                    ${
                        processing
                            ? "scale-95 opacity-50 cursor-not-allowed"
                            : "hover:scale-105 hover:shadow-lg"
                    }
                    ${isMember ? "ring-2 ring-green-400 ring-opacity-50" : ""}
                `}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">
                            {iconMapping[circle.icon] || "⭐"}
                        </span>
                        <div>
                            <h3 className="font-semibold text-lg">
                                {circle.name}
                            </h3>
                            <p className="text-sm opacity-90 flex items-center gap-1">
                                <FiUsers size={12} />
                                {circle.members_count || 0} عضو
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isMember && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                                عضو
                            </span>
                        )}

                        {processing ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : isMember ? (
                            <FiMinus
                                size={20}
                                className="opacity-70 group-hover:opacity-100 transition-opacity"
                                title="إزالة من الدائرة"
                            />
                        ) : (
                            <FiPlus
                                size={20}
                                className="opacity-70 group-hover:opacity-100 transition-opacity"
                                title="إضافة إلى الدائرة"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddToCircleModal;
