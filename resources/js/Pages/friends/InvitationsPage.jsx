import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import {
    FiArrowLeft,
    FiUsers,
    FiSend,
    FiCheck,
    FiClock,
    FiPhone,
    FiCalendar,
    FiUserCheck,
    FiExternalLink,
    FiCopy,
    FiShare2,
} from "react-icons/fi";

const InvitationsPage = ({ sentInvitations, stats }) => {
    const [copiedCode, setCopiedCode] = useState(null);

    const copyInvitationCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const shareInvitation = (invitation) => {
        const message = `انضم إلى منصة نبض!\n\nكود الدعوة: ${invitation.invitation_code}\nرابط التسجيل: https://pulsse.online/register?invitation=${invitation.invitation_code}`;

        if (navigator.share) {
            navigator.share({
                title: "دعوة للانضمام إلى نبض",
                text: message,
            });
        } else {
            navigator.clipboard.writeText(message);
            alert("تم نسخ رابط الدعوة!");
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "registered":
                return <FiUserCheck className="text-green-500" size={20} />;
            case "sent":
                return <FiClock className="text-yellow-500" size={20} />;
            default:
                return <FiSend className="text-gray-400" size={20} />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "registered":
                return "انضم للمنصة";
            case "sent":
                return "في الانتظار";
            default:
                return "غير معروف";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "registered":
                return "text-green-600 bg-green-50 border-green-200";
            case "sent":
                return "text-yellow-600 bg-yellow-50 border-yellow-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    return (
        <MainLayout>
            <Head title="الدعوات المرسلة - نبض" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/friends"
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <FiArrowLeft
                                    size={20}
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    الدعوات المرسلة
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    تتبع حالة الدعوات التي أرسلتها للأصدقاء
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <FiSend
                                        className="text-blue-600"
                                        size={24}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        إجمالي الدعوات
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.total_sent}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <FiUserCheck
                                        className="text-green-600"
                                        size={24}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        انضموا للمنصة
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.registered}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm border">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <FiClock
                                        className="text-yellow-600"
                                        size={24}
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        في الانتظار
                                    </p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {stats.pending}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invitations List */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FiUsers size={20} />
                                قائمة الدعوات
                            </h2>
                        </div>

                        {sentInvitations.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiSend
                                        className="text-gray-400"
                                        size={24}
                                    />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    لم ترسل أي دعوات بعد
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    ابدأ بدعوة أصدقائك للانضمام إلى منصة نبض
                                </p>
                                <Link
                                    href="/friends"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <FiUsers size={16} />
                                    البحث عن أصدقاء
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {sentInvitations.map((invitation) => (
                                    <div key={invitation.id} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {invitation.invited_user ? (
                                                    <img
                                                        src={
                                                            invitation
                                                                .invited_user
                                                                .avatar
                                                        }
                                                        alt={
                                                            invitation
                                                                .invited_user
                                                                .name
                                                        }
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <FiPhone
                                                            className="text-gray-500"
                                                            size={20}
                                                        />
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="font-medium text-gray-800">
                                                        {invitation.invited_user
                                                            ? invitation
                                                                  .invited_user
                                                                  .name
                                                            : invitation.phone}
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <FiCalendar
                                                                size={14}
                                                            />
                                                            أُرسلت{" "}
                                                            {invitation.sent_at}
                                                        </span>
                                                        {invitation.registered_at && (
                                                            <span className="flex items-center gap-1">
                                                                <FiCheck
                                                                    size={14}
                                                                />
                                                                انضم{" "}
                                                                {
                                                                    invitation.registered_at
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Status Badge */}
                                                <div
                                                    className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                                                        invitation.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(
                                                        invitation.status
                                                    )}
                                                    {getStatusText(
                                                        invitation.status
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                {invitation.status ===
                                                    "sent" && (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                copyInvitationCode(
                                                                    invitation.invitation_code
                                                                )
                                                            }
                                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                                            title="نسخ كود الدعوة"
                                                        >
                                                            {copiedCode ===
                                                            invitation.invitation_code ? (
                                                                <FiCheck
                                                                    className="text-green-500"
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <FiCopy
                                                                    size={16}
                                                                />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                shareInvitation(
                                                                    invitation
                                                                )
                                                            }
                                                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                                            title="مشاركة الدعوة"
                                                        >
                                                            <FiShare2
                                                                size={16}
                                                            />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Invitation Code */}
                                        {invitation.status === "sent" && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">
                                                            كود الدعوة
                                                        </p>
                                                        <p className="font-mono text-sm font-medium text-gray-800">
                                                            {
                                                                invitation.invitation_code
                                                            }
                                                        </p>
                                                    </div>
                                                    <a
                                                        href={`https://pulsse.online/register?invitation=${invitation.invitation_code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                                                    >
                                                        رابط التسجيل
                                                        <FiExternalLink
                                                            size={12}
                                                        />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-medium text-blue-800 mb-2">
                            💡 نصائح مفيدة
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>
                                • عندما ينضم صديقك للمنصة باستخدام كود الدعوة،
                                ستحصل على إشعار فوري
                            </li>
                            <li>
                                • سيتم إضافة الصديق تلقائياً إلى قائمة أصدقائك
                                عند التسجيل
                            </li>
                            <li>
                                • يمكنك مشاركة كود الدعوة أو رابط التسجيل مع
                                أصدقائك
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default InvitationsPage;
