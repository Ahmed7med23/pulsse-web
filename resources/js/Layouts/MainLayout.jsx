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

// TODO: Add responsive styling (e.g., using CSS with media queries)
const MainLayout = (WrappedComponent) => {
    // This is a Higher-Order Component (HOC) that wraps another component.
    // It returns a new component that includes the main layout structure.
    return function WithMainLayout(props) {
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
                    {/* The WrappedComponent (e.g., a specific page) will be rendered here */}
                    <WrappedComponent {...props} />
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
                                    <span className="text-xs">
                                        {item.label}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            </div>
        );
    };
};

export default MainLayout;
