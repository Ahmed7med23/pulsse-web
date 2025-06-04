import React from "react";

function Logo({ className = "" }) {
    return (
        <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-r from-primary/20 to-primary/30 flex items-center justify-center shadow-lg shadow-primary/10 ${className}`}
        >
            <span className="text-primary text-4xl font-bold">ن</span>
        </div>
    );
}

export default Logo;
