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
    const song_info = [
        { key: "field_title",      id: "title",      value: song_cache[song_code].song },
        { key: "field_artist",     id: "artist",     value: song_cache[song_code].artist },
        { key: "field_genre",      id: "genre",      value: song_cache[song_code].extra.genre_name },
        { key: "field_info",       id: "info",       value: song_cache[song_code].extra.information ??
                                                                 song_cache[song_code].extra.program_name ??
                                                                 song_cache[song_code].extra.tie_up },
        { key: "field_lyrics",     id: "lyrics",     value: song_cache[song_code].extra?.introcha ?
                                                                 `${song_cache[song_code].extra.introcha}…` : null },
        { key: "field_play_count", id: "play-count", value: song_count[song_code] },
        { key: "field_code",       id: "code",       value: song_cache[song_code].code }
    ];
    let modal_data = [];
    song_info.forEach(({ key, id, value }) => {
        if (value) {
            modal_data.push($("<h4>").text(`${i18n(key)}:`));
            const tag = $("<p>").attr("id", `current-song-${id}`);
            modal_data.push(tag.text(value));
        }
    });
    if (sessionStorage.getItem("debug_mode")) {
        modal_data.push($("<hr>"), $("<h4>").text(i18n("debugging_info_heading")));
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
        text: i18n("toast_not_connected_long"),
        duration: -1,
        position: "center",
        gravity: "bottom",
        className: "toast-red",
        onClick: () => CONNECTION_TOAST.hideToast()
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
