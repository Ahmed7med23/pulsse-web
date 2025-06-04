/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";

export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.jsx",
    ],
    theme: {
        extend: {
            colors: {
                "brand-pink": "#FF4785",
                primary: "#FF4785",
            },
            fontFamily: {
                // sans: ["Figtree", ...defaultTheme.fontFamily.sans],
                sans: ["Baloo Bhaijaan 2", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
};
