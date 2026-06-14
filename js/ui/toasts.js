/*
 * +------------------------------------------------------------
 * | ui/toasts.js
 * +------------------------------------------------------------
 * | toast notification helpers
 * +------------------------------------------------------------
 */

const TOAST_DURATION = 2000;
let CONNECTION_TOAST;
let DEBUG_TOAST;
let STALE_TOAST;

function toast(message, class_name) {
    return Toastify({
        text: message,
        duration: TOAST_DURATION,
        position: "center",
        className: class_name,
    }).showToast();
}

function show_connection_toast() {
    CONNECTION_TOAST = Toastify({
        text: i18n("toast_not_connected_long"),
        duration: -1,
        position: "center",
        gravity: "bottom",
        className: "toast-red",
        onClick: () => CONNECTION_TOAST.hideToast()
    }).showToast();
}

function show_stale_toast() {
    STALE_TOAST = Toastify({
        text: i18n("toast_stale_session"),
        duration: -1,
        position: "center",
        gravity: "bottom",
        className: "toast-red",
        onClick: () => STALE_TOAST.hideToast()
    }).showToast();
}

function show_debug_toast() {
    DEBUG_TOAST = Toastify({
        text: i18n("toast_debug_enabled"),
        duration: -1,
        position: "center",
        className: "toast-yellow",
        onClick: () => DEBUG_TOAST.hideToast()
    }).showToast();
}
