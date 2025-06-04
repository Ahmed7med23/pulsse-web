import axios from "axios";
window.axios = axios;

// تكوين axios base URL - استخدام البورت الحالي
window.axios.defaults.baseURL = window.location.origin;
window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
window.axios.defaults.withCredentials = true;

// إضافة CSRF token من meta tag إذا كان متوفر
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token.content;
    console.log("CSRF Token loaded:", token.content.substring(0, 10) + "...");
} else {
    console.error(
        "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
    );
}

// إضافة interceptor للتحقق من CSRF errors
window.axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 419) {
            console.error("CSRF token mismatch! Reloading page...");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);
