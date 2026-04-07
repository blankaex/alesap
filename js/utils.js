/*
 * +------------------------------------------------------------
 * | utils.js
 * +------------------------------------------------------------
 * | shared constants, error handlers, and debug formatting
 * | utilities used across multiple modules
 * +------------------------------------------------------------
 */

// initialize globals
const HISTORY_MAX_LENGTH = 20;

// error handler displayed when no active session exists
// pulled out for extensibility
function err_not_connected() {
    Toastify({
        text: "Not connected",
        duration: 3000,
        position: "center",
        style: {
            background: "#ed5565",
        }
    }).showToast();
}

// formats localStorage data as a pretty-printed JSON string
function parse_local_storage() {
    const local_storage = {};
    Object.keys(localStorage).forEach(key => {
        const value = localStorage.getItem(key);
        try {
            local_storage[key] = JSON.parse(value);
        } catch (e) {
            local_storage[key] = value;
        }
    });
    return JSON.stringify(local_storage, null, 2);
}

// formats device and browser info as a pretty-printed JSON string
function parse_device_info() {
    const device_info = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio,
        platform: navigator.platform,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory
    };
    return JSON.stringify(device_info, null, 2);
}
