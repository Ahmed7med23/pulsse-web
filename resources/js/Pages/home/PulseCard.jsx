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

    const isPulseFromUser = pulse.type === "sent";
    const isDirectPulse = pulse.pulseType === "direct";
    const isCirclePulse = pulse.pulseType === "circle";

    return (
        <>
            <div className="mx-2 bg-white border border-pink-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
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
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* User name and pulse type */}
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800 truncate">
                                {pulse.user.name}
                            </span>

                            {/* Pulse type indicator */}
                            {isDirectPulse && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                    <FiUser size={12} />
                                    <span>مباشرة</span>
                                </div>
                            )}

                            {isCirclePulse && (
                                <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                    <FiUsers size={12} />
                                    <span>{pulse.circleName || "دائرة"}</span>
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <p className="text-gray-700 text-sm mb-2 leading-relaxed">
                            {pulse.message}
                        </p>

                        {/* Recipients info for sent pulses */}
                        {isPulseFromUser && pulse.recipients && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <FiEye size={12} />
                                <span>
                                    {
                                        pulse.recipients.filter((r) => r.seen)
                                            .length
                                    }{" "}
                                    من {pulse.recipients.length} شاهد
                                </span>
                            </div>
                        )}

                        {/* Time */}
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>{pulse.timeAgo}</span>
                            {isPulseFromUser && (
                                <span className="text-green-600">مرسلة</span>
                            )}
                        </div>
                    </div>

                    {/* More options */}
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <FiMoreHorizontal size={16} />
                    </button>
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
                                        className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 rounded-full px-2 py-1 transition-colors"
                                    >
                                        <span className="text-sm">
                                            {reaction.icon}
                                        </span>
                                        <span className="text-xs font-medium text-gray-600">
                                            {reaction.count}
                                        </span>
                                    </button>
                                ))}
                        </div>

                        {/* Total reactions count */}
                        {localReactions.some((r) => r.count > 0) && (
                            <span className="text-xs text-gray-400">
                                {localReactions.reduce(
                                    (sum, r) => sum + r.count,
                                    0
                                )}{" "}
                                تفاعلات
                            </span>
                        )}
                    </div>

                    {/* Reaction buttons */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1">
                            {localReactions.map((reaction) => (
                                <button
                                    key={reaction.type}
                                    onClick={() =>
                                        handleReactionClick(reaction.type)
                                    }
                                    disabled={reactionLoading}
                                    className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-all duration-200 relative ${
                                        reaction.active
                                            ? "bg-pink-500 text-white scale-110"
                                            : "hover:bg-white hover:scale-105"
                                    } ${
                                        reactionLoading
                                            ? "opacity-70 cursor-not-allowed"
                                            : ""
                                    }`}
                                    title={`تفاعل بـ ${reaction.icon}`}
                                >
                                    {reactionLoading ? (
                                        <FiLoader className="animate-spin text-xs" />
                                    ) : (
                                        reaction.icon
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

    // جلب المستخدمين الذين تفاعلوا
    useEffect(() => {
        const fetchReactionUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `/pulses/${pulse.id}/reactions/${reactionType}`,
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching reaction users:", error);
                // استخدام بيانات افتراضية في حالة الخطأ
                setUsers([
                    {
                        id: 1,
                        name: "سارة أحمد",
                        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
                    },
                    {
                        id: 2,
                        name: "محمد علي",
                        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
                    },
                    {
                        id: 3,
                        name: "ليلى حسن",
                        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchReactionUsers();
    }, [pulse.id, reactionType]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        تفاعل {reactionMapping[reactionType]}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <FiLoader
                            className="animate-spin text-primary"
                            size={24}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-3"
                            >
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <span className="font-medium text-gray-800">
                                    {user.name}
                                </span>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <p className="text-center text-gray-500 py-4">
                                لا يوجد متفاعلون بعد
                            </p>
                        )}
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
