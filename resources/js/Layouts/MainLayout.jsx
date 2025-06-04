import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import {
    FiActivity,
    FiCircle,
    FiHeart,
    FiHome,
    FiStar,
    FiUser,
    FiUsers,
} from "react-icons/fi";

// MainLayout as a regular React component that receives children
const MainLayout = ({ children }) => {
    const navItems = [
        { path: "/", icon: <FiHome />, label: "الرئيسية" },
        { path: "/circles", icon: <FiCircle />, label: "الدوائر" },
        { path: "/friends", icon: <FiUsers />, label: "الأصدقاء" },
        // { path: "/organizations", icon: <FiHeart />, label: "المؤسسات" },
        { path: "/profile", icon: <FiUser />, label: "الملف الشخصي" },
    ];

    const [activeSection, setActiveSection] = useState("pulses");

    return (
        <div>
            <main>
                {/* Children components will be rendered here */}
                {children}
            </main>
            <div className="bg-white border-b border-gray-100 sticky mt-24 top-0 z-10">
                <nav className="fixed bottom-0 left-0 right-0  bg-white border-t border-gray-100 px-4 py-2">
                    <div className="flex justify-around items-center">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setActiveSection(item.label)}
                                className={`flex flex-col items-center gap-1 p-2 ${
                                    location.pathname === item.path ||
                                    (item.path === "/circles" &&
                                        location.pathname.startsWith(
                                            "/circles/"
                                        ))
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
        </div>
    );
};

export default MainLayout;
