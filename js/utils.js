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
const SEARCH_RESULTS_LIMIT = 20;
const SEARCH_PAGE_LIMIT = 1000;
const SEARCH_INTERVAL = 1000;
let TOAST_DURATION = 2000;
let CURRENT_SEARCH = null;
let CONNECTION_TOAST;
let DEBUG_TOAST;

// helper function to extract values from song cache
function song_cache_get(song_code, key) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    return song_cache[song_code][key] ?? song_cache[song_code].extra[key] ?? null;
}

// appends extra content type info to a song title if not already present
function normalize_song(song_code) {
    let normalized = song_cache_get(song_code, "song");

    const extra_content =
        song_cache_get(song_code, "tag_bv") ??
        song_cache_get(song_code, "content_type");

    const should_append = 
        extra_content &&
        !normalized.toLowerCase().includes(extra_content.toLowerCase());

    if (should_append) {
        normalized += `【${extra_content}】`;
    }

    return normalized;
}

// builds the list of modal body elements for a given song
function build_song_modal_data(song_code) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    const song_count = JSON.parse(localStorage.getItem("song_count")) ?? {};
    const song_info = {
        Title: song_cache[song_code].song,
        Artist: song_cache[song_code].artist,
        Genre: song_cache[song_code].extra.genre_name,
        Info: song_cache[song_code].extra.information ?? 
            song_cache[song_code].extra.program_name ?? 
            song_cache[song_code].extra.tie_up,
        Lyrics: song_cache[song_code].extra?.introcha ?
            `${song_cache[song_code].extra.introcha}…` : null,
        "Play Count": song_count[song_code],
        Code: song_cache[song_code].code
    };
    let modal_data = [];
    Object.keys(song_info).forEach(key => {
        if (song_info[key]) {
            modal_data.push($("<h4>").text(`${key}:`));
            const tag = $("<p>").attr("id", `current-song-${key.toLowerCase()}`);
            modal_data.push(tag.text(song_info[key]));
        }
    });
    if (sessionStorage.getItem("debug_mode")) {
        modal_data.push($("<hr>"), $("<h4>").text("Debugging info:"));
        modal_data.push($("<pre>").text(JSON.stringify(song_cache[song_code], null, 2)));
    }
    return modal_data;
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

// helper functions to manage search query history stack
function search_history_push(query) {
    let search_history = JSON.parse(sessionStorage.getItem("search_history")) ?? [];
    search_history.push(query);
    sessionStorage.setItem("search_history", JSON.stringify(search_history));
}

function search_history_pop() {
    let search_history = JSON.parse(sessionStorage.getItem("search_history")) ?? [];
    let query = search_history.pop();
    // pop another one if query is the one we just added
    if (query == $("#search-field").val()) {
        query = search_history.pop();
    }
    sessionStorage.setItem("search_history", JSON.stringify(search_history));
    return query;
}

// helper functions to display standard toasts
function toast(message, class_name) {
    return Toastify({
        text: message,
        duration: 2000,
        position: "center",
        className: class_name,
    }).showToast();
}

function show_connection_toast() {
    CONNECTION_TOAST = Toastify({
        text: "Not connected—scan QR code to get started",
        duration: -1,
        position: "center",
        gravity: "bottom",
        className: "toast-red",
        onClick: () => CONNECTION_TOAST.hideToast()
    }).showToast();
}

function show_debug_toast() {
    DEBUG_TOAST = Toastify({
        text: "🐞 Debugging Enabled",
        duration: -1,
        position: "center",
        className: "toast-yellow",
        onClick: () => DEBUG_TOAST.hideToast()
    }).showToast();
}
