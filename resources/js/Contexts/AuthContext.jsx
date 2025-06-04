import React, { createContext, useContext } from "react";
import { usePage } from "@inertiajs/react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    let user = null;
    try {
        const page = usePage();
        user = page?.props?.user || null;
    } catch (error) {
        // If usePage is not available yet, we'll use null as the initial value
        console.warn(
            "usePage not available yet, using null as initial auth state"
        );
    }

    return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
