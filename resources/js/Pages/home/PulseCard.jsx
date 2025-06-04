import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    FiHeart,
    FiUsers,
    FiUser,
    FiEye,
    FiMoreHorizontal,
    FiLoader,
} from "react-icons/fi";
import axios from "axios";

/**
 * PulseCard component displays different types of pulses with reactions
 * @param {object} props
 * @param {object} props.pulse - Complete pulse object
 * @param {function} props.onReactionUpdate - Callback when reaction is updated
 */
const PulseCard = ({ pulse, onReactionUpdate }) => {
    const [showReactionsModal, setShowReactionsModal] = useState(false);
    const [selectedReactionType, setSelectedReactionType] = useState(null);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [localReactions, setLocalReactions] = useState(pulse.reactions);
    const [localPulse, setLocalPulse] = useState(pulse);

    // Mapping من reaction types إلى emojis
    const reactionMapping = {
        pray: "🙏",
        sparkles: "✨",
        smile: "😊",
        heart: "❤️",
        thumbs_up: "👍",
        sad: "😢",
        surprised: "😮",
        angry: "😡",
    };

    const handleReactionClick = async (reactionType) => {
        if (reactionLoading) return;

        try {
            setReactionLoading(true);

            // تحديث الحالة المحلية فوراً للاستجابة السريعة
            const updatedReactions = localReactions.map((reaction) => {
                if (reaction.type === reactionType) {
                    const wasActive = reaction.active;
                    return {
                        ...reaction,
                        active: !wasActive,
                        count: wasActive
                            ? reaction.count - 1
                            : reaction.count + 1,
                    };
                }
                // إذا كان المستخدم يغير من تفاعل لآخر، إزالة التفاعل السابق
                if (reaction.active) {
                    return {
                        ...reaction,
                        active: false,
                        count: Math.max(0, reaction.count - 1),
                    };
                }
                return reaction;
            });

            setLocalReactions(updatedReactions);

            // إرسال الطلب إلى الـ API
            const response = await axios.post(
                "/pulses/react",
                {
                    pulseId: pulse.id,
                    reactionType: reactionType,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Reaction updated:", response.data);

            // تحديث البيانات الرئيسية
            if (onReactionUpdate) {
                onReactionUpdate();
            }
        } catch (error) {
            console.error("Error toggling reaction:", error);

            // إعادة الحالة في حالة الخطأ
            setLocalReactions(pulse.reactions);

            // عرض رسالة خطأ
            alert(error.response?.data?.message || "حدث خطأ في تحديث التفاعل");
        } finally {
            setReactionLoading(false);
        }
    };

    const handleReactionCountClick = (reactionType) => {
        setSelectedReactionType(reactionType);
        setShowReactionsModal(true);
    };

    const handleTotalReactionsClick = () => {
        // Show modal for the most popular reaction type
        const mostPopularReaction = localReactions
            .filter((r) => r.count > 0)
            .sort((a, b) => b.count - a.count)[0];

        if (mostPopularReaction) {
            setSelectedReactionType(mostPopularReaction.type);
            setShowReactionsModal(true);
        }
    };

    const handleMarkAsSeen = async (pulseId) => {
        try {
            const response = await axios.post(
                `/pulses/${pulseId}/mark-seen`,
                {},
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );

            // تحديث الحالة المحلية للنبضة
            setLocalPulse((prev) => ({
                ...prev,
                seen: true,
                seen_at: response.data.seen_at,
            }));

            // تحديث البيانات الرئيسية إذا كان هناك callback
            if (onReactionUpdate) {
                onReactionUpdate();
            }

            console.log("Pulse marked as seen:", response.data);
        } catch (error) {
            console.error("Error marking pulse as seen:", error);
            alert(
                error.response?.data?.message ||
                    "حدث خطأ في تحديد النبضة كمقروءة"
            );
        }
    };

    // تحديد النبضة كمقروءة تلقائياً عند النقر عليها
    const handlePulseClick = () => {
        if (!isPulseFromUser && !localPulse.seen) {
            handleMarkAsSeen(localPulse.id);
        }
    };

    const isPulseFromUser = pulse.type === "sent";
    const isDirectPulse = pulse.pulseType === "direct";
    const isCirclePulse = pulse.pulseType === "circle";

    return (
        <>
            <div
                className={`mx-2 bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    !isPulseFromUser && !localPulse.seen
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-pink-200"
                }`}
                onClick={handlePulseClick}
            >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={pulse.user.avatar}
                            alt={pulse.user.name}
                            className="w-12 h-12 rounded-full object-cover border border-pink-200"
                        />
                        {/* Online indicator */}
                        {pulse.user.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}

                        {/* Unread indicator for received pulses */}
                        {!isPulseFromUser && !localPulse.seen && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Pulse type and recipient info for sent pulses */}
                        {isPulseFromUser ? (
                            <div className="mb-2">
                                {isDirectPulse &&
                                pulse.recipients &&
                                pulse.recipients.length > 0 ? (
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <FiUser
                                                size={14}
                                                className="text-blue-500"
                                            />
                                            <span className="font-medium">
                                                نبضة إلى:
                                            </span>
                                            <span className="font-bold text-blue-600">
                                                {pulse.recipients[0].name}
                                            </span>
                                        </div>
                                        {pulse.recipients[0].seen && (
                                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                <FiEye size={10} />
                                                <span>تم المشاهدة</span>
                                            </div>
                                        )}
                                    </div>
                                ) : isCirclePulse ? (
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <FiUsers
                                                size={14}
                                                className="text-purple-500"
                                            />
                                            <span className="font-medium">
                                                نبضة إلى دائرة:
                                            </span>
                                            <span className="font-bold text-purple-600">
                                                {pulse.circleName || "دائرة"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                            <FiUsers size={10} />
                                            <span>
                                                {pulse.recipients_count} أشخاص
                                            </span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* Sender name for sent pulses */}
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">
                                        {pulse.user.name} (أنت)
                                    </span>
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        مرسلة
                                    </span>
                                </div>
                            </div>
                        ) : (
                            // Original display for received pulses
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-800 truncate">
                                    {pulse.user.name}
                                </span>

                                {/* Pulse type indicator for received pulses */}
                                {isDirectPulse && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        <FiUser size={12} />
                                        <span>مباشرة</span>
                                    </div>
                                )}

                                {isCirclePulse && (
                                    <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                        <FiUsers size={12} />
                                        <span>
                                            {pulse.circleName || "دائرة"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Message */}
                        <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                            {pulse.message}
                        </p>

                        {/* Enhanced recipients info for sent pulses */}
                        {isPulseFromUser && pulse.recipients && (
                            <div className="mb-2">
                                {isDirectPulse ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FiEye size={12} />
                                        <span>
                                            {pulse.recipients[0].seen ? (
                                                <span className="text-green-600 font-medium">
                                                    تم مشاهدة النبضة ✓
                                                </span>
                                            ) : (
                                                <span className="text-orange-600">
                                                    لم يتم المشاهدة بعد
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                ) : isCirclePulse ? (
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <FiEye size={12} />
                                            <span>
                                                {
                                                    pulse.recipients.filter(
                                                        (r) => r.seen
                                                    ).length
                                                }{" "}
                                                من {pulse.recipients.length}{" "}
                                                شاهد
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-green-600">
                                                {Math.round(
                                                    (pulse.recipients.filter(
                                                        (r) => r.seen
                                                    ).length /
                                                        pulse.recipients
                                                            .length) *
                                                        100
                                                )}
                                                % معدل المشاهدة
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        {/* Time */}
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{pulse.timeAgo}</span>
                            {isPulseFromUser && (
                                <div className="flex items-center gap-2">
                                    {isDirectPulse && (
                                        <span className="text-blue-600">
                                            نبضة مباشرة
                                        </span>
                                    )}
                                    {isCirclePulse && (
                                        <span className="text-purple-600">
                                            نبضة جماعية
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* More options */}
                    <div className="flex items-center gap-2">
                        {/* Mark as seen button for received unseen pulses */}
                        {!isPulseFromUser && !localPulse.seen && (
                            <button
                                onClick={() => handleMarkAsSeen(localPulse.id)}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full transition-colors"
                                title="تحديد كمقروءة"
                            >
                                <FiEye size={12} />
                                <span>مقروءة</span>
                            </button>
                        )}

                        {/* Show seen status for received pulses */}
                        {!isPulseFromUser && localPulse.seen && (
                            <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <FiEye size={10} />
                                <span>تم القراءة</span>
                            </div>
                        )}

                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <FiMoreHorizontal size={16} />
                        </button>
                    </div>
                </div>

                {/* Reactions Section */}
                <div className="border-t border-gray-100 pt-3">
                    {/* Current reactions display */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            {localReactions
                                .filter((reaction) => reaction.count > 0)
                                .map((reaction) => (
                                    <button
                                        key={reaction.type}
                                        onClick={() =>
                                            handleReactionCountClick(
                                                reaction.type
                                            )
                                        }
                                        className="group flex items-center gap-1.5 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 rounded-full px-3 py-1.5 transition-all duration-200 transform hover:scale-105"
                                        title={`انقر لرؤية من تفاعل بـ ${reaction.icon}`}
                                    >
                                        <span className="text-base group-hover:scale-110 transition-transform">
                                            {reaction.icon}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                                            {reaction.count}
                                        </span>
                                    </button>
                                ))}
                        </div>

                        {/* Total reactions count */}
                        {localReactions.some((r) => r.count > 0) && (
                            <button
                                onClick={handleTotalReactionsClick}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                title="انقر لرؤية جميع التفاعلات"
                            >
                                <FiHeart size={12} className="text-pink-400" />
                                <span className="font-medium">
                                    {localReactions.reduce(
                                        (sum, r) => sum + r.count,
                                        0
                                    )}{" "}
                                    تفاعل
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Reaction buttons */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1 shadow-sm">
                            {localReactions.map((reaction) => (
                                <button
                                    key={reaction.type}
                                    onClick={() =>
                                        handleReactionClick(reaction.type)
                                    }
                                    disabled={reactionLoading}
                                    className={`w-9 h-9 flex items-center justify-center rounded-full text-lg transition-all duration-300 relative ${
                                        reaction.active
                                            ? "bg-gradient-to-r from-pink-500 to-red-500 text-white scale-110 shadow-md"
                                            : "hover:bg-white hover:scale-105 hover:shadow-sm"
                                    } ${
                                        reactionLoading
                                            ? "opacity-70 cursor-not-allowed"
                                            : "cursor-pointer"
                                    }`}
                                    title={`تفاعل بـ ${reaction.icon}`}
                                >
                                    {reactionLoading && reaction.active ? (
                                        <FiLoader className="animate-spin text-xs" />
                                    ) : (
                                        <>
                                            <span
                                                className={
                                                    reaction.active
                                                        ? "animate-pulse"
                                                        : ""
                                                }
                                            >
                                                {reaction.icon}
                                            </span>
                                            {reaction.active && (
                                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                </span>
                                            )}
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reactions Modal */}
            {showReactionsModal && (
                <ReactionsModal
                    pulse={pulse}
                    reactionType={selectedReactionType}
                    onClose={() => setShowReactionsModal(false)}
                />
            )}
        </>
    );
};

/**
 * Modal to show who reacted with specific reaction
 */
const ReactionsModal = ({ pulse, reactionType, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reactionMapping = {
        pray: "🙏",
        sparkles: "✨",
        smile: "😊",
        heart: "❤️",
        thumbs_up: "👍",
        sad: "😢",
        surprised: "😮",
        angry: "😡",
    };

    const reactionNames = {
        pray: "دعاء",
        sparkles: "بريق",
        smile: "ابتسامة",
        heart: "حب",
        thumbs_up: "إعجاب",
        sad: "حزن",
        surprised: "مفاجأة",
        angry: "غضب",
    };

    // جلب المستخدمين الذين تفاعلوا
    useEffect(() => {
        const fetchReactionUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(
                    `/pulses/${pulse.id}/reactions/${reactionType}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                console.log("Reaction users response:", response.data);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching reaction users:", error);
                setError(
                    error.response?.data?.message || "حدث خطأ في جلب المتفاعلين"
                );
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReactionUsers();
    }, [pulse.id, reactionType]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">
                            {reactionMapping[reactionType]}
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                تفاعل {reactionNames[reactionType]}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {loading
                                    ? "جاري التحميل..."
                                    : `${users.length} متفاعل`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-96">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <FiLoader
                                className="animate-spin text-primary mb-3"
                                size={32}
                            />
                            <p className="text-gray-500">
                                جاري تحميل المتفاعلين...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl">❌</span>
                            </div>
                            <p className="text-red-600 text-center mb-2">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="relative">
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        <span className="absolute -bottom-1 -right-1 text-sm">
                                            {reactionMapping[reactionType]}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-800 truncate">
                                            {user.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            تفاعل {user.reacted_at}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <span className="text-2xl text-gray-400">
                                    {reactionMapping[reactionType]}
                                </span>
                            </div>
                            <p className="text-gray-500 text-center">
                                لا يوجد متفاعلون بهذا التفاعل بعد
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && !error && users.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-center text-gray-500">
                            إجمالي {users.length} متفاعل بـ{" "}
                            {reactionNames[reactionType]}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

PulseCard.propTypes = {
    pulse: PropTypes.shape({
        id: PropTypes.number.isRequired,
        type: PropTypes.oneOf(["sent", "received"]).isRequired,
        pulseType: PropTypes.oneOf(["direct", "circle"]).isRequired,
        user: PropTypes.shape({
            name: PropTypes.string.isRequired,
            avatar: PropTypes.string.isRequired,
            isOnline: PropTypes.bool,
        }).isRequired,
        message: PropTypes.string.isRequired,
        timeAgo: PropTypes.string.isRequired,
        reactions: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.string.isRequired,
                icon: PropTypes.string.isRequired,
                active: PropTypes.bool.isRequired,
                count: PropTypes.number.isRequired,
            })
        ).isRequired,
        circleName: PropTypes.string,
        recipients: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.number.isRequired,
                name: PropTypes.string.isRequired,
                seen: PropTypes.bool.isRequired,
            })
        ),
    }).isRequired,
    onReactionUpdate: PropTypes.func,
};

export default PulseCard;
