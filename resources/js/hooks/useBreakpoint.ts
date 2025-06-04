// hooks/useBreakpoint.ts
import { useState, useEffect } from "react";

export const BREAKPOINTS = {
    mobile: 640, // 0-640px
    tablet: 1024, // 641-1024px
    desktop: 1025, // 1025px وأكبر
} as const;

export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState(() => {
        if (typeof window !== "undefined") {
            if (window.innerWidth < BREAKPOINTS.mobile) return "mobile";
            if (window.innerWidth < BREAKPOINTS.tablet) return "tablet";
            return "desktop";
        }
        return "desktop"; // Default for SSR
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleResize = () => {
            if (window.innerWidth < BREAKPOINTS.mobile) setBreakpoint("mobile");
            else if (window.innerWidth < BREAKPOINTS.tablet)
                setBreakpoint("tablet");
            else setBreakpoint("desktop");
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return breakpoint;
}
