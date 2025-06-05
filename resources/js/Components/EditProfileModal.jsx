import React, { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import {
    FiCamera,
    FiX,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const EditProfileModal = ({ user, isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        city: user?.city || "",
        bio: user?.bio || "",
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("يرجى اختيار ملف صورة صحيح");
                return;
            }

            setAvatar(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });

        if (avatar) {
            data.append("avatar", avatar);
        }

        router.post("/profile/update", data, {
            onSuccess: () => {
                onClose();
                setIsLoading(false);
            },
            onError: (errors) => {
                console.error("Profile update errors:", errors);
                setIsLoading(false);
            },
            forceFormData: true,
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">
                            تعديل الملف الشخصي
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <FiX className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Profile preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                                            {user?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
                                >
                                    <FiCamera className="h-4 w-4" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                اضغط على الكاميرا لتغيير الصورة
                                <br />
                                (حد أقصى 5 ميجابايت)
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiUser className="inline h-4 w-4 ml-1" />
                                    الاسم
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل اسمك"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiMail className="inline h-4 w-4 ml-1" />
                                    البريد الإلكتروني
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل بريدك الإلكتروني"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiPhone className="inline h-4 w-4 ml-1" />
                                    رقم الهاتف
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل رقم هاتفك"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FiMapPin className="inline h-4 w-4 ml-1" />
                                    المدينة
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل مدينتك"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نبذة شخصية
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    placeholder="اكتب نبذة عن نفسك..."
                                    maxLength={200}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.bio.length}/200 حرف
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium"
                            >
                                {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default EditProfileModal;
