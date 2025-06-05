import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { FiEdit2, FiLogOut, FiCamera } from "react-icons/fi";
import { motion } from "framer-motion";
import { Head, usePage } from "@inertiajs/react";
import MainLayout from "../../Layouts/MainLayout";
import PulseStats from "../../Components/PulseStats";
import EditProfileModal from "../../Components/EditProfileModal";

const ProfilePage = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);

    // الحصول على إحصائيات النبضات
    const pageData = usePage();
    const initialStats = pageData.props.pulseStats;

    const pulseScore = {
        score: 75,
        level: 3,
        nextMilestone: 100,
    };

    return (
        <>
            <Head title="الملف الشخصي" />
            <div className="max-w-6xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-col items-center">
                                <motion.div
                                    className="relative w-32 h-32 mb-4"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center text-white text-5xl font-bold relative">
                                        {user?.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0)
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                            <FiCamera
                                                className="text-white opacity-0 hover:opacity-100 transition-opacity duration-200"
                                                size={24}
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                                    <motion.div
                                        className="absolute inset-0 rounded-full border-4 border-primary"
                                        style={{
                                            clipPath: `polygon(0 0, ${
                                                (pulseScore.score /
                                                    pulseScore.nextMilestone) *
                                                100
                                            }% 0, ${
                                                (pulseScore.score /
                                                    pulseScore.nextMilestone) *
                                                100
                                            }% 100%, 0 100%)`,
                                        }}
                                    />
                                </motion.div>

                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {user?.name}
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    {user?.email}
                                </p>

                                {/* Additional Profile Info */}
                                <div className="w-full space-y-2 mb-4">
                                    {user?.phone && (
                                        <div className="text-sm text-gray-600 text-center">
                                            📞 {user.phone}
                                        </div>
                                    )}
                                    {user?.city && (
                                        <div className="text-sm text-gray-600 text-center">
                                            📍 {user.city}
                                        </div>
                                    )}
                                    {user?.bio && (
                                        <div className="text-sm text-gray-700 text-center bg-gray-50 p-3 rounded-lg">
                                            {user.bio}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark bg-primary/10 p-2 rounded-lg transition-colors"
                                    >
                                        <FiEdit2 />
                                        <span>تعديل الملف</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            router.post(route("logout"))
                                        }
                                        className="flex items-center justify-center gap-2 text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        <FiLogOut />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats and Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pulse Statistics */}
                        {initialStats && (
                            <PulseStats initialStats={initialStats} />
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                user={user}
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
            />
        </>
    );
};

const WrappedProfilePage = ({ user }) => {
    return (
        <MainLayout>
            <ProfilePage user={user} />
        </MainLayout>
    );
};

export default WrappedProfilePage;
