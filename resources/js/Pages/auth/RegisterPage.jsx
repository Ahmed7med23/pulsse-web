import { Head, Link, router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import Logo from "../../Components/Logo";
import { ArrowLeft, Lock, Phone, User, X } from "lucide-react";

function RegisterPage({ status, canResetPassword, countries, flash }) {
    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            country: "",
            name: "",
            phone: "",
            password: "",
            remember: true,
            invitation_code: "",
        });

    const [countryModal, setCountryModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default: السعودية
    const [message, setMessage] = useState(null);

    // قراءة كود الدعوة من URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const invitationCode = urlParams.get("invitation");
        if (invitationCode) {
            setData("invitation_code", invitationCode);
            setMessage({
                type: "info",
                text: `تم تطبيق كود الدعوة: ${invitationCode} 🎉`,
            });
        }
    }, []);

    // معالجة رسائل flash
    useEffect(() => {
        if (flash && flash.message) {
            setMessage({
                type: flash.type || "info",
                text:
                    flash.message.ar ||
                    flash.message.en ||
                    flash.message ||
                    "رسالة",
            });

            // عرض رسائل المعلومات لفترة أطول
            if (flash.type === "info") {
                setTimeout(() => {
                    setMessage(null);
                }, 8000);
            } else {
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

    useEffect(() => {
        selectedCountry
            ? setData("country", selectedCountry)
            : setData("country", countries[0]);
    }, [selectedCountry]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Selected country:", selectedCountry);
        console.log("Form data:", data);

        // مسح الأخطاء السابقة قبل إرسال طلب جديد
        clearErrors();

        // التأكد من أن جميع البيانات المطلوبة موجودة
        if (
            !selectedCountry ||
            !selectedCountry.code ||
            !selectedCountry.name
        ) {
            alert("يرجى اختيار الدولة أولاً");
            return;
        }

        if (!data.name.trim()) {
            document.getElementById("name")?.focus();
            return;
        }

        if (!data.phone.trim()) {
            document.getElementById("phone")?.focus();
            return;
        }

        if (!data.password.trim()) {
            document.getElementById("password")?.focus();
            return;
        }

        // إنشاء البيانات النهائية مباشرة بدون الاعتماد على setData
        const finalData = {
            name: data.name.trim(),
            phone: data.phone.trim(),
            password: data.password,
            country: selectedCountry,
            invitation_code: data.invitation_code || null,
        };

        console.log("Final data being sent:", finalData);

        setData("country", selectedCountry);

        // إرسال البيانات مباشرة
        post("/register", finalData, {
            onStart: () => {
                console.log("بدء عملية التسجيل...");
            },
            onSuccess: (response) => {
                console.log("Registration successful:", response);
                // سيتم التوجيه تلقائياً لصفحة OTP من الـ backend
            },
            onError: (errors) => {
                console.error("Registration failed:", errors);
                console.log("Errors received:", errors);

                // مسح كلمة المرور فقط عند وجود خطأ
                reset("password");

                // التركيز على الحقل الذي به خطأ
                setTimeout(() => {
                    if (errors.phone) {
                        document.getElementById("phone")?.focus();
                    } else if (errors.name) {
                        document.getElementById("name")?.focus();
                    } else if (errors.password) {
                        document.getElementById("password")?.focus();
                    }
                }, 100);
            },
            onFinish: () => {
                console.log("انتهاء عملية التسجيل");
            },
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
            <Head title="إنشاء حساب جديد" />

            {/* Flash Message */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-4 left-4 right-4 max-w-md mx-auto p-4 rounded-lg shadow-lg z-50 ${
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
                        إنشاء حساب جديد
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        أدخل بياناتك لإنشاء حساب جديد
                    </p>
                </div>

                {status && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                        {status}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-7">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <div className="border border-gray-200 px-4 py-1 rounded-lg items-center justify-center flex">
                            <User className="w-5 h-5 text-gray-400" />
                            <input
                                id="name"
                                type="text"
                                placeholder="الاسم الكامل"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="block text-right w-full focus:outline-none placeholder-gray-400 p-2"
                                required
                                autoFocus
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-red-600 text-right">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-2">
                        <div
                            style={{ direction: "ltr" }}
                            className="border border-gray-200 px-4 py-1 rounded-lg items-center justify-center flex flex-row-reverse"
                        >
                            <input
                                id="phone"
                                type="tel"
                                placeholder="رقم الهاتف"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                className="block text-left w-full focus:outline-none placeholder-gray-400 p-2 bg-transparent"
                                required
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
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-start">
                                    <svg
                                        className="flex-shrink-0 w-4 h-4 text-red-500 mt-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <div className="mr-3">
                                        <p className="text-sm text-red-800 text-right">
                                            {errors.phone}
                                        </p>
                                        <p className="text-xs text-red-600 mt-1 text-right">
                                            يمكنك{" "}
                                            <Link
                                                href="/login"
                                                className="underline font-medium hover:text-red-700"
                                            >
                                                تسجيل الدخول
                                            </Link>{" "}
                                            إذا كان لديك حساب بالفعل
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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
                                            onClick={() =>
                                                handleCountrySelect(country)
                                            }
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

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="border border-gray-200 px-4 py-1 rounded-lg items-center justify-center flex">
                            <Lock className="w-5 h-5 text-gray-400" />
                            <input
                                id="password"
                                type="password"
                                placeholder="كلمة المرور"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className="block text-right w-full focus:outline-none placeholder-gray-400 p-2"
                                required
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-600 text-right">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex justify-center items-center py-2 px-2 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-brand-pink hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-pink disabled:opacity-60 transition-all duration-150 ease-in-out hover:shadow-lg active:scale-95"
                        >
                            {processing ? (
                                "جاري التسجيل..."
                            ) : (
                                <>
                                    <span className="ml-1.5">تسجيل</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="mt-10 text-center">
                <p className="text-sm text-gray-600">
                    لديك حساب بالفعل؟{" "}
                    <Link
                        href={"/login"}
                        className="font-semibold text-primary hover:text-primary-900 transition-colors duration-150 ease-in-out"
                    >
                        تسجيل الدخول
                    </Link>
                </p>
            </div>
        </div>
    );
}

// LoginPage.layout = (page) => <div>{page}</div>;
export default RegisterPage;
