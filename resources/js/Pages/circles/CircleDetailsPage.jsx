import React, { useState } from "react";
import MainLayout from "../../Layouts/MainLayout";
import { Head, router } from "@inertiajs/react";
import {
    FiUsers,
    FiUserPlus,
    FiTrash2,
    FiArrowLeft,
    FiEdit3,
    FiArrowRight,
} from "react-icons/fi";

// Mock data - replace with actual data from props and API calls
const mockInitialMembers = [
    {
        id: 1,
        name: "أحمد حسين",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&q=60",
    },
    {
        id: 2,
        name: "فاطمة علي",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&q=60",
    },
    {
        id: 3,
        name: "محمد عبد الله",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=40&h=40&fit=crop&q=60",
    },
];

const mockUsersToAdd = [
    {
        id: 4,
        name: "سارة خالد",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=40&h=40&fit=crop&q=60",
    },
    {
        id: 5,
        name: "يوسف محمود",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&q=60",
    },
];

const CircleDetailsPage = ({ circle }) => {
    // Ensure circle and its properties are defined, providing defaults
    const safeCircle = circle || {
        id: "temp",
        name: "اسم الدائرة غير متوفر",
        description: "وصف غير متوفر",
        members: [],
    };
    const initialMembers =
        safeCircle.members && safeCircle.members.length > 0
            ? safeCircle.members
            : mockInitialMembers;

    const [members, setMembers] = useState(initialMembers);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [usersToAdd, setUsersToAdd] = useState(mockUsersToAdd); // This should come from an API to find users
    const [selectedUserToAdd, setSelectedUserToAdd] = useState("");

    const handleRemoveMember = (memberId) => {
        // Replace with: router.delete(`/circles/${safeCircle.id}/members/${memberId}`, { ... });
        console.log(
            `Attempting to remove member ${memberId} from circle ${safeCircle.id}`
        );
        if (window.confirm("هل أنت متأكد أنك تريد إزالة هذا العضو؟")) {
            setMembers((prevMembers) =>
                prevMembers.filter((member) => member.id !== memberId)
            );
            // alert('تمت إزالة العضو (محاكاة). قم بربطها بواجهة برمجة التطبيقات.');
            // router.delete(`/circles/${safeCircle.id}/members/${memberId}`, {
            //     preserveScroll: true,
            //     onSuccess: () => { /* handle success */ },
            //     onError: (errors) => { /* handle error */ console.error('Failed to remove member:', errors); },
            // });
        }
    };

    const handleAddMember = (e) => {
        e.preventDefault();
        if (!selectedUserToAdd) {
            alert("يرجى اختيار مستخدم لإضافته.");
            return;
        }
        // Replace with: router.post(`/circles/${safeCircle.id}/members`, { userId: selectedUserToAdd }, { ... });
        console.log(
            `Attempting to add member ${selectedUserToAdd} to circle ${safeCircle.id}`
        );
        const user = usersToAdd.find(
            (u) => u.id.toString() === selectedUserToAdd
        );
        if (user) {
            if (!members.find((m) => m.id === user.id)) {
                setMembers((prevMembers) => [
                    ...prevMembers,
                    {
                        ...user,
                        avatar:
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name
                            )}&background=random`,
                    },
                ]);
                // alert(`تمت إضافة العضو ${user.name} (محاكاة).`);
            } else {
                alert("هذا العضو موجود بالفعل في الدائرة.");
            }
        }
        setSelectedUserToAdd("");
        setShowAddMemberModal(false);
        // router.post(`/circles/${safeCircle.id}/members`, { userId: selectedUserToAdd }, {
        //     preserveScroll: true,
        //     onSuccess: (page) => {
        //         // Assuming the controller returns updated members or you refetch
        //         // setMembers(page.props.circle.members);
        //         setShowAddMemberModal(false);
        //     },
        //     onError: (errors) => { /* handle error */ console.error('Failed to add member:', errors); },
        // });
    };

    const handleDeleteCircle = () => {
        // Replace with: router.delete(`/circles/${safeCircle.id}`, { ... });
        console.log(`Attempting to delete circle ${safeCircle.id}`);
        if (
            window.confirm(
                `هل أنت متأكد أنك تريد حذف دائرة "${safeCircle.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`
            )
        ) {
            // alert('تم حذف الدائرة (محاكاة). قم بربطها بواجهة برمجة التطبيقات.');
            router.visit("/circles"); // Redirect after (simulated) deletion
            // router.delete(`/circles/${safeCircle.id}`, {
            //     onSuccess: () => router.visit('/circles'),
            //     onError: (errors) => { /* handle error */ console.error('Failed to delete circle:', errors); },
            // });
        }
    };

    if (!circle) {
        // Handles case where circle data might not be loaded yet or is invalid
        return (
            <MainLayout>
                <Head title="الدائرة غير موجودة" />
                <div className="container mx-auto px-4 py-10 text-center">
                    <p className="text-2xl text-gray-700 mb-4">
                        جاري تحميل بيانات الدائرة أو أن الدائرة غير موجودة...
                    </p>
                    <button
                        onClick={() => router.visit("/circles")}
                        className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <FiArrowLeft />
                        <span>العودة إلى قائمة الدوائر</span>
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <>
            <Head title={`تفاصيل: ${safeCircle.name}`} />
            <div className="container mx-auto ">
                {/* Back Button */}

                {/* Circle Header & Actions */}
                <div className="bg-white shadow-xl px-4 py-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="mb-4 sm:mb-0 text-right">
                            <div className="flex items-center gap-3 justify-end">
                                <button
                                    onClick={() => router.visit("/circles")}
                                    className="p-2 -mr-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="العودة للدوائر"
                                >
                                    <FiArrowRight size={20} />
                                </button>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                    {safeCircle.name}
                                </h1>
                                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {members.length} عضو
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1 text-base">
                                {safeCircle.description ||
                                    "لا يوجد وصف لهذه الدائرة."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowAddMemberModal(true)}
                                className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                                title="إضافة عضو جديد"
                            >
                                <FiUserPlus size={20} />
                            </button>
                            <button
                                onClick={() =>
                                    alert("ميزة تعديل الدائرة قيد التطوير!")
                                }
                                className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                                title="تعديل تفاصيل الدائرة"
                            >
                                <FiEdit3 size={20} />
                            </button>
                            <button
                                onClick={handleDeleteCircle}
                                className="p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-100 transition-colors"
                                title="حذف الدائرة"
                            >
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Members Section */}
                <div className="bg-white shadow-xl px-4 py-4">
                    {members.length > 0 ? (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="group flex items-center justify-between p-3 bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow">
                                                <img
                                                    src={
                                                        member.avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            member.name
                                                        )}&background=random&color=fff`
                                                    }
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-base font-semibold text-gray-800">
                                                {member.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                عضو منذ{" "}
                                                {member.joinDate || "3 أشهر"}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleRemoveMember(member.id)
                                        }
                                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                        title="إزالة العضو"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
                                <FiUsers size={28} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700 mb-2">
                                لا يوجد أعضاء
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                قم بإضافة أعضاء لبدء التفاعل في هذه الدائرة
                                وتبادل الأفكار والخبرات
                            </p>
                            <button
                                onClick={() => setShowAddMemberModal(true)}
                                className="p-2 rounded-full text-gray-700 hover:bg-gray-200 hover:text-primary transition-colors"
                                title="إضافة عضو جديد"
                            >
                                <FiUserPlus size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Member Modal */}
                {showAddMemberModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalPopIn">
                            <style jsx>{`
                                .animate-modalPopIn {
                                    animation: modalPopIn 0.3s forwards;
                                }
                                @keyframes modalPopIn {
                                    to {
                                        transform: scale(1);
                                        opacity: 1;
                                    }
                                }
                            `}</style>
                            <h3 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
                                إضافة عضو جديد للدائرة
                            </h3>
                            <form onSubmit={handleAddMember}>
                                <div className="mb-6">
                                    <label
                                        htmlFor="userToAdd"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        اختر مستخدمًا لإضافته:
                                    </label>
                                    <select
                                        id="userToAdd"
                                        value={selectedUserToAdd}
                                        onChange={(e) =>
                                            setSelectedUserToAdd(e.target.value)
                                        }
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                    >
                                        <option value="">
                                            -- حدد مستخدمًا --
                                        </option>
                                        {usersToAdd
                                            .filter(
                                                (u) =>
                                                    !members.some(
                                                        (m) => m.id === u.id
                                                    )
                                            )
                                            .map((user) => (
                                                <option
                                                    key={user.id}
                                                    value={user.id}
                                                >
                                                    {user.name}
                                                </option>
                                            ))}
                                        {usersToAdd.filter(
                                            (u) =>
                                                !members.some(
                                                    (m) => m.id === u.id
                                                )
                                        ).length === 0 && (
                                            <option disabled>
                                                لا يوجد مستخدمين جدد لإضافتهم
                                            </option>
                                        )}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 mt-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAddMemberModal(false)
                                        }
                                        className="px-5 py-2.5 text-sm rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!selectedUserToAdd}
                                        className="px-5 py-2.5 text-sm rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                                    >
                                        إضافة العضو
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// If you are using a global MainLayout for all pages through app.js, you might not need this line.
// However, if this page needs a specific layout or if MainLayout is passed individually:
// CircleDetailsPage.layout = (page) => (
//     <MainLayout children={page} title={page.props.title || "تفاصيل الدائرة"} />
// );

export default MainLayout(CircleDetailsPage);
// export default CircleDetailsPage;
