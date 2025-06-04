import React from "react";
import PropTypes from "prop-types";

/**
 * PulseCard component displays a user's pulse with reactions and influence bar.
 * @param {object} props
 * @param {object} props.user - User info { name, avatar }
 * @param {string} props.message - Pulse message
 * @param {string} props.timeAgo - Time since pulse
 * @param {Array} props.reactions - Array of { icon, active }
 * @param {number} props.influence - Influence percentage (0-100)
 */
const PulseCard = ({ user, message, timeAgo, reactions, influence, pulse }) => {
    const reaction = async () => {
        const response = await axios.post("/api/reactions", {
            pulse_id: pulse.id,
        });
    };
    return (
        <div className="mx-2 bg-white border border-pink-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm">
            <div className="flex justify-between items-start">
                <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover border border-pink-200"
                />
                <div className="flex items-center gap-2">
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-md text-gray-800">
                            {user.name}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                            {message}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    {reactions.map((r, i) => (
                        <span
                            key={i}
                            className={`w-8 h-8 flex items-center justify-center rounded-full bg-pink-50 text-xl shadow ${
                                r.active ? "opacity-100" : "opacity-40"
                            }`}
                            aria-label={r.label || "reaction"}
                        >
                            {r.icon}
                        </span>
                    ))}
                </div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-pink-500 font-semibold">
                    تأثير النبضة: %{influence}
                </span>
                <span className="text-xs text-gray-400">{timeAgo}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div
                    className="h-full bg-pink-400 rounded-full transition-all"
                    style={{ width: `${influence}%` }}
                ></div>
            </div>
        </div>
    );
};

PulseCard.propTypes = {
    user: PropTypes.shape({
        name: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
    }).isRequired,
    message: PropTypes.string.isRequired,
    timeAgo: PropTypes.string.isRequired,
    reactions: PropTypes.arrayOf(
        PropTypes.shape({
            icon: PropTypes.node.isRequired,
            active: PropTypes.bool,
            label: PropTypes.string,
        })
    ).isRequired,
    influence: PropTypes.number.isRequired,
};

export default PulseCard;
