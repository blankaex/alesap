/*
 * +------------------------------------------------------------
 * | i18n/index.js
 * +------------------------------------------------------------
 * | internationalization functions
 * +------------------------------------------------------------
 */

const UI_LANGUAGE = location.pathname.replace(/\/$/, "").split("/").pop() || "en";
const LANGUAGE_ROUTES = {
    "English": "/",
    "日本語": "/ja/"
};
let UI_STRINGS = {};

function load_i18n_strings() {
    return fetch("/strings.json", { cache: "no-cache" })
        .then(r => r.json())
        .then(data => { UI_STRINGS = data; })
        .catch(err => {
            console.error("Failed to load strings.json", err);
        });
}

function i18n(key) {
    const entry = UI_STRINGS[key];
    let value;
    if (!entry || typeof entry !== "object") {
        value = `⚠️ ${key}`;
    } else {
        value = entry[UI_LANGUAGE];
    }
    return value;
}
