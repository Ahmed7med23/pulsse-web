import { Head, Link, router } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import Logo from "../../Components/Logo";
import { ArrowLeft, Lock, Phone, X } from "lucide-react";

function LoginPage({ status, canResetPassword, countries, flash }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: "",
        password: "",
        country: countries[0],
        remember: true,
    });

    const [countryModal, setCountryModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default: السعودية
    const [message, setMessage] = useState(null);

    useEffect(() => {
        console.log("Debug - Received flash:", flash);

        if (flash && flash.message) {
            setMessage({
                type: flash.type || "info",
                text:
                    flash.message.ar ||
                    flash.message.en ||
                    flash.message ||
                    "An error occurred",
            });

            // If already logged in, show message for longer
            if (flash.type === "info") {
                setTimeout(() => {
                    setMessage(null);
                }, 8000); // 8 seconds for info messages
            } else if (flash.type === "success") {
                // If verification was successful, redirect to home after 2 seconds
                setTimeout(() => {
                    router.visit("/");
                }, 2000);
            } else {
                // Error messages disappear after 5 seconds
                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            }
        }
    }, [flash]);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setCountryModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Login attempt with:", {
            phone: data.phone,
            country: selectedCountry,
            password: data.password,
        });

        post(
            "/login",
            {
                phone: data.phone,
                password: data.password,
                country: selectedCountry,
            },
            {
                onSuccess: (response) => {
                    console.log("Login successful:", response);
                },
                onError: (errors) => {
                    console.error("Login failed:", errors);
                    console.log("Validation errors:", errors);
                    reset("password");

                    // التركيز على الحقل الذي به خطأ
                    setTimeout(() => {
                        if (errors.phone) {
                            document.getElementById("phone")?.focus();
                        } else if (errors.password) {
                            document.getElementById("password")?.focus();
                        }
                    }, 100);
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <Head title="تسجيل الدخول " />

            {/* Message Display */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-4 left-4 right-4 max-w-md mx-auto p-4 rounded-lg shadow-lg ${
                        message.type === "error"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : message.type === "info"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {message.text}
                            </p>
                            {message.type === "info" && (
                                <button
                                    onClick={() => {
                                        router.post("/logout");
                                    }}
                                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                                >
                                    تسجيل الخروج
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setMessage(null)}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            <motion.header
                className="lg:hidden fixed top-0 right-0 left-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="px-4 py-3 flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                        }}
                        className="relative shrink-0"
                    >
                        <Logo />
                    </motion.div>

                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-800">
                            نبضة دافئة
                        </h1>
                        <p className="text-xs text-gray-500">
                            في عالم رقمي متسارع
                        </p>
                    </div>
                </div>
            </motion.header>

            {/* عرض أخطاء التحقق */}
            {(errors.phone || errors.password || errors.email) && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-4 left-4 right-4 max-w-md mx-auto p-4 rounded-lg shadow-lg bg-red-50 text-red-700 border border-red-200"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium">
                                {errors.phone ||
                                    errors.password ||
                                    errors.email ||
                                    "خطأ في بيانات تسجيل الدخول"}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                // لا يمكن مسح الأخطاء يدوياً، ستختفي عند إعادة الإرسال
                            }}
                            className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
            {/* Branding Section */}
            <div className="mx-auto w-full max-w-md text-center mb-10 flex flex-col items-center gap-2">
                <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center shadow-lg shadow-primary/10 `}
                >
                    <span className="text-primary text-5xl font-bold">ن</span>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto mt-4">
                    أن بعض العلاقات تحتاج فقط لنبضة لتظل حية! في عالم رقمي
                    متسارع، نقدم جسراً يربط القلوب المشغولة بضغطة زر.
                </p>
            </div>

            <div className="mx-auto w-full max-w-md bg-white py-10 px-8 shadow-xl rounded-xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-semibold text-gray-800">
                        تسجيل الدخول
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        أدخل بياناتك للوصول إلى حسابك
                    </p>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                            💡 ملاحظة: يجب التحقق من رقم هاتفك عبر رمز الواتساب
                            قبل تسجيل الدخول
                        </p>
                    </div>
                </div>

                {status && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                    <div
                        style={{ direction: "ltr" }}
                        className={`border px-4 py-1 rounded-lg items-center justify-center flex flex-row-reverse ${
                            errors.phone
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                        }`}
                    >
                        <input
                            id="phone"
                            type="tel"
                            placeholder="رقم الهاتف"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                            className="block text-left w-full focus:outline-none placeholder-gray-400 p-2 bg-transparent"
                            required
                            autoFocus
                        />
                        <button
                            type="button"
                            className="flex items-center gap-1 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-pink ml-2"
                            onClick={() => setCountryModal(true)}
                            tabIndex={-1}
                        >
                            <img
                                src={selectedCountry.flagUrl}
                                alt={selectedCountry.name}
                                className="w-6 h-4 rounded object-cover"
                            />
                            <span className="text-xs font-bold text-gray-700">
                                {selectedCountry.code}
                            </span>
                            <svg
                                className="w-3 h-3 ml-1 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    </div>
                    {errors.phone && (
                        <p className="mt-2 text-sm text-red-600 text-right">
                            {errors.phone}
                        </p>
                    )}

                    {/* Country Modal */}
                    {countryModal && (
                        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
                            <div className="bg-white w-full max-w-md rounded-t-2xl p-4 pb-8 shadow-lg animate-slide-up">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="font-bold text-lg">
                                        اختر الدولة
                                    </span>
                                    <button
                                        onClick={() => setCountryModal(false)}
                                        className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                                    {countries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            className={`flex items-center w-full px-3 py-2 gap-3 hover:bg-gray-50 rounded transition ${
                                                selectedCountry.code ===
                                                country.code
                                                    ? "bg-brand-pink/10"
                                                    : ""
                                            }`}
                                            onClick={() => {
                                                handleCountrySelect(country);
                                                setCountryModal(false);
                                                setData("country", country);
                                            }}
                                        >
                                            <img
                                                src={country.flagUrl}
                                                alt={country.name}
                                                className="w-6 h-4 rounded object-cover"
                                            />
                                            <span className="text-sm font-bold text-gray-700">
                                                {country.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        className={`border px-4 py-1 rounded-lg items-center justify-center flex ${
                            errors.password || errors.phone
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                        }`}
                    >
                        <Lock className="w-5 h-5 text-gray-400" />
                        <input
                            id="password"
                            type="password"
                            placeholder="كلمة المرور"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            className="block text-right w-full focus:outline-none placeholder-gray-400 p-2 bg-transparent"
                            required
                        />
                    </div>
                    {errors.password && (
                        <p className="mt-2 text-sm text-red-600 text-right">
                            {errors.password}
                        </p>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center items-center py-2 px-2 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-brand-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-60 transition-all duration-150 ease-in-out hover:shadow-lg active:scale-95"
                        >
                            {processing ? (
                                "جاري تسجيل الدخول..."
                            ) : (
                                <>
                                    <span className="ml-1.5">تسجيل الدخول</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-10 text-center space-y-3">
                <p className="text-sm text-gray-600">
                    ليس لديك حساب؟{" "}
                    <Link
                        href={"/register"}
                        className="font-semibold text-primary hover:text-primary-900 transition-colors duration-150 ease-in-out"
                    >
                        سجل الآن
                    </Link>
                </p>
                <p className="text-xs text-gray-500">
                    لم تتحقق من حسابك بعد؟{" "}
                    <Link
                        href={"/register"}
                        className="font-medium text-blue-600 hover:text-blue-700 underline"
                    >
                        اضغط هنا للتحقق
                    </Link>
                </p>
            </div>
        </div>
    );
}

// LoginPage.layout = (page) => <div>{page}</div>;
export default LoginPage;
