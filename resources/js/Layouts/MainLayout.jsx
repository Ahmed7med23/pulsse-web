import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    FiActivity,
    FiBell,
    FiCircle,
    FiHeart,
    FiHome,
    FiStar,
    FiUser,
    FiUsers,
} from "react-icons/fi";
import NotificationBell from "../Components/NotificationBell";

// MainLayout as a regular React component that receives children
const MainLayout = ({ children }) => {
    const navItems = [
        { path: "/", icon: <FiHome />, label: "الرئيسية" },
        { path: "/circles", icon: <FiCircle />, label: "الدوائر" },
        { path: "/friends", icon: <FiUsers />, label: "الأصدقاء" },
        { path: "/notifications", icon: <FiBell />, label: "الإشعارات" },
        { path: "/profile", icon: <FiUser />, label: "الملف الشخصي" },
    ];

    const [activeSection, setActiveSection] = useState("pulses");

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header with Notifications */}
            <header className="fixed top-0 left-0 right-0 z-20 bg-white border-b border-gray-100 px-4 py-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-primary">نبض</h1>
                    <NotificationBell />
                </div>
            </header>

            {/* Main Content with padding to account for fixed header and bottom nav */}
            <main className="pt-16 pb-20">{children}</main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2">
                <div className="flex justify-around items-center">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setActiveSection(item.label)}
                            className={`flex flex-col items-center gap-1 p-2 ${
                                location.pathname === item.path ||
                                (item.path === "/circles" &&
                                    location.pathname.startsWith("/circles/"))
                                    ? "text-primary"
                                    : "text-gray-600"
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
