import React, { useState, useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthLayout from "@/Layouts/AuthLayout";
import { X } from "lucide-react";

export default function VerifyOtpPage({
    phone,
    maskedPhone,
    whatsappSent,
    userName,
    countries,
    flash,
}) {
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [message, setMessage] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        phone: phone,
        otp: "",
    });

    const { post: resendPost, processing: resendProcessing } = useForm({
        phone: phone,
    });

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

            // إخفاء الرسالة بعد 5 ثوانٍ
            setTimeout(() => {
                setMessage(null);
            }, 5000);
        }
    }, [flash]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0 && !canResend) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setCanResend(true);
        }
    }, [timeLeft, canResend]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("verify.otp"), {
            onSuccess: () => {
                reset("otp");
            },
            onError: () => {
                reset("otp");
            },
        });
    };

    const handleResend = () => {
        resendPost(route("resend.otp"), {
            onSuccess: (page) => {
                console.log("Resend successful:", page);
                setTimeLeft(60);
                setCanResend(false);

                // معالجة رسالة النجاح من الاستجابة
                if (page.props.flash && page.props.flash.message) {
                    setMessage({
                        type: page.props.flash.type || "success",
                        text:
                            page.props.flash.message.ar ||
                            page.props.flash.message.en ||
                            "تم إعادة إرسال الرمز بنجاح",
                    });

                    setTimeout(() => {
                        setMessage(null);
                    }, 5000);
                }
            },
            onError: (errors) => {
                console.error("Resend failed:", errors);
                setMessage({
                    type: "error",
                    text: "فشل في إعادة إرسال الرمز. يرجى المحاولة مرة أخرى.",
                });

                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            },
        });
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
        setData("otp", value);
    };

    return (
        <AuthLayout>
            <Head title="التحقق من الحساب" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
                <div className="max-w-md w-full space-y-8">
                    {/* Flash Message */}
                    {message && (
                        <div
                            className={`p-4 rounded-lg border ${
                                message.type === "success"
                                    ? "bg-green-500/20 border-green-400 text-green-100"
                                    : message.type === "warning"
                                    ? "bg-yellow-500/20 border-yellow-400 text-yellow-100"
                                    : "bg-red-500/20 border-red-400 text-red-100"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {message.text}
                                </span>
                                <button
                                    onClick={() => setMessage(null)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="h-6 w-6 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            التحقق من الحساب
                        </h2>
                        <p className="text-purple-100 text-sm">
                            مرحباً {userName}! تم إرسال رمز التحقق إلى
                        </p>
                        <p className="text-white font-medium text-lg mt-1">
                            {maskedPhone}
                        </p>
                    </div>

                    {/* WhatsApp Status */}
                    <div
                        className={`p-4 rounded-lg ${
                            whatsappSent
                                ? "bg-green-500/20 border border-green-400"
                                : "bg-yellow-500/20 border border-yellow-400"
                        }`}
                    >
                        <div className="flex items-center">
                            <div
                                className={`h-4 w-4 rounded-full mr-3 ${
                                    whatsappSent
                                        ? "bg-green-400"
                                        : "bg-yellow-400"
                                }`}
                            ></div>
                            <span className="text-white text-sm">
                                {whatsappSent
                                    ? "تم إرسال الرمز عبر الواتساب بنجاح"
                                    : "تم توليد الرمز ولكن فشل إرسال الواتساب"}
                            </span>
                        </div>
                    </div>

                    {/* OTP Form */}
                    <div className="bg-white rounded-xl shadow-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="otp"
                                    className="block text-sm font-medium text-gray-700 mb-2 text-center"
                                >
                                    أدخل رمز التحقق المكون من 4 أرقام
                                </label>
                                <div className="flex justify-center">
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        required
                                        value={data.otp}
                                        onChange={handleOtpChange}
                                        className="w-32 px-4 py-3 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                        placeholder="0000"
                                        maxLength={4}
                                        autoFocus
                                    />
                                </div>
                                {errors.otp && (
                                    <p className="mt-2 text-sm text-red-600 text-center">
                                        {errors.otp}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing || data.otp.length !== 4}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? (
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : null}
                                تحقق من الحساب
                            </button>
                        </form>

                        {/* Resend OTP */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 mb-2">
                                لم تستلم الرمز؟
                            </p>
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={resendProcessing}
                                    className="text-purple-600 hover:text-purple-500 font-medium text-sm disabled:opacity-50"
                                >
                                    {resendProcessing
                                        ? "جاري الإرسال..."
                                        : "إعادة إرسال الرمز"}
                                </button>
                            ) : (
                                <span className="text-gray-500 text-sm">
                                    يمكنك إعادة الإرسال خلال {timeLeft} ثانية
                                </span>
                            )}
                        </div>

                        {/* Back to Login */}
                        <div className="mt-4 text-center">
                            <a
                                href={route("login")}
                                className="text-sm text-gray-600 hover:text-gray-500"
                            >
                                العودة إلى تسجيل الدخول
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
