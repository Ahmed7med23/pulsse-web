import React from "react";
import {
    FiGlobe,
    FiLock,
    FiStar,
    FiHeart,
    FiMessageSquare,
    FiUsers,
    FiSettings,
} from "react-icons/fi";

import { useForm } from "@inertiajs/react";
// import { toast } from "react-hot-toast";
// import { route } from "laravel-routes";
// import { Alert } from "@headlessui/react";

const CIRCLE_ICONS = [
    { icon: <FiStar />, value: "star" },
    { icon: <FiHeart />, value: "heart" },
    { icon: <FiMessageSquare />, value: "chat" },
    { icon: <FiUsers />, value: "users" },
    { icon: <FiSettings />, value: "settings" },
    { icon: <FiGlobe />, value: "globe" },
];

const availableColors = [
    { id: 1, value: "from-rose-400 to-red-500", label: "أحمر" },
    { id: 2, value: "from-violet-400 to-purple-500", label: "بنفسجي" },
    { id: 3, value: "from-blue-400 to-indigo-500", label: "أزرق" },
    { id: 4, value: "from-emerald-400 to-green-500", label: "أخضر" },
    { id: 5, value: "from-amber-400 to-yellow-500", label: "ذهبي" },
];

/**
 * @typedef {Object} CircleFormData
 * @property {string} name - Circle name
 * @property {string} description - Circle description
 * @property {string} color - Circle color gradient
 * @property {string} icon - Circle icon
 * @property {string} privacy - Circle privacy setting ('public' | 'private')
 */

/**
 * @typedef {Object} CreateCircleSheetProps
 * @property {boolean} isOpen - Whether the sheet is open
 * @property {function} onClose - Function to close the sheet
 * @property {CircleFormData} formData - Current form data
 * @property {function} onFormChange - Function to handle form changes
 * @property {function} onSubmit - Function to handle form submission
 */

/**
 * CreateCircleSheet Component
 * @param {CreateCircleSheetProps} props
 */
const CreateCircleSheet = ({
    isOpen,
    onClose,
    formData,
    onFormChange,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        description: "",
        color: "from-rose-400 to-red-500",
        icon: "star",
        privacy_type: "public",
    });
    const handleSubmit = async (e) => {
        e.preventDefault();

        post(route("circles.store"), {
            headers: {
                Accept: "application/json",
            },
            onSuccess: (page) => {
                console.log("Success:", page);
                onClose();
            },
            onError: (errors) => {
                console.error("Validation errors:", errors);
            },
        });
    };
    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-white rounded-t-2xl shadow-xl p-6 relative animate-slideUp"
                style={{ direction: "rtl" }}
            >
                <div className="flex flex-col items-center mb-4">
                    <span className="w-12 h-1.5 bg-gray-200 rounded-full mb-2"></span>
                </div>
                <button
                    type="button"
                    className="absolute left-4 top-4 text-gray-400 hover:text-gray-600 text-xl"
                    onClick={onClose}
                >
                    ×
                </button>
                <h2 className="text-xl font-bold mb-1">إنشاء دائرة جديدة</h2>
                <p className="text-gray-500 mb-4 text-sm">
                    أنشئ مساحة خاصة للتواصل مع من تحب
                </p>
                <label className="block mb-2 text-sm font-medium">
                    اسم الدائرة
                </label>
                <input
                    type="text"
                    className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary bg-gray-50"
                    placeholder="مثال: العائلة، الأصدقاء المقربين"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    required
                />
                <label className="block mb-2 text-sm font-medium">
                    وصف الدائرة
                </label>
                <textarea
                    className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary bg-gray-50"
                    placeholder="اكتب وصفاً مختصراً للدائرة..."
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    rows={2}
                />
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        لون الدائرة
                    </label>
                    <div className="flex gap-3">
                        {availableColors.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-gradient-to-tr ${
                                    c.value
                                } ${
                                    data.color === c.value
                                        ? "border-primary ring-2 ring-primary"
                                        : "border-gray-100"
                                }`}
                                onClick={() => setData("color", c.value)}
                            >
                                {data.color === c.value && (
                                    <span className="text-white text-lg">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        خصوصية الدائرة
                    </label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                data.privacy_type === "public"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}
                            onClick={() => setData("privacy_type", "public")}
                        >
                            <FiGlobe />
                            <span>عامة</span>
                        </button>
                        <button
                            type="button"
                            className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                                data.privacy_type === "private"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-gray-200 bg-white text-gray-600"
                            }`}
                            onClick={() => setData("privacy_type", "private")}
                        >
                            <FiLock />
                            <span>خاصة</span>
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">
                        أيقونة الدائرة
                    </label>
                    <div className="flex gap-3 flex-wrap">
                        {CIRCLE_ICONS.map((c) => (
                            <button
                                key={c.value}
                                type="button"
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all ${
                                    data.icon === c.value
                                        ? "border-primary bg-primary/10"
                                        : "border-gray-200 bg-white"
                                }`}
                                onClick={() => setData("icon", c.value)}
                            >
                                {c.icon}
                                {data.icon === c.value && (
                                    <span className="absolute left-1 top-1 text-primary">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between gap-2 mt-6">
                    <button
                        type="button"
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                        onClick={onClose}
                    >
                        إلغاء
                    </button>
                    <button
                        disabled={processing}
                        type="submit"
                        className={`flex-1 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 ${
                            processing ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {processing ? "جاري الإنشاء..." : "إنشاء الدائرة +"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCircleSheet;
