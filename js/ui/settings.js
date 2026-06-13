/*
 * +------------------------------------------------------------
 * | ui/settings.js
 * +------------------------------------------------------------
 * | settings, nickname, info modal, debug mode
 * +------------------------------------------------------------
 */

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

function clear_storage(type) {
    window._confirmCallback = function() {
        switch(type) {
            case "local":
                localStorage.clear();
                toast(i18n("local_storage_cleared"), "toast-green");
                break;
            case "session":
                sessionStorage.clear();
                toast(i18n("session_storage_cleared"), "toast-green");
                break;
        }
    };
    $('#confirm-modal').modal('show');
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

// generates a random nickname from adjective + noun pairs via Datamuse
async function generate_random_nickname() {
    const [adjs, nouns] = await Promise.all([
        fetch('https://api.datamuse.com/words?rel_jjb=thing&max=1000').then(r => r.json()),
        fetch('https://api.datamuse.com/words?rel_jja=blue&max=1000').then(r => r.json())
    ]);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)].word;
    return `${pick(adjs)}${pick(nouns)}`;
}

// set user nickname
async function set_nickname(startup = false) {
    let nickname = startup ? 
        localStorage.getItem("nickname") :
        $("#nickname-field").val() ||
        null;
    if (!nickname) {
        // TODO: remove network call
        nickname = await generate_random_nickname();
    }
    $("#nickname-field").val(nickname);
    localStorage.setItem("nickname", nickname);
    if (!startup) {
        toast(i18n("toast_nickname_saved"), "toast-green");
    }
}

function show_info() {
    const song_count = JSON.parse(localStorage.getItem("song_count"));
    if (song_count) {
        let most_played_table = $("<table>").addClass("table");
        $.each(
            Object.entries(song_count)
                .sort((a, b) => b[1] - a[1]) // sort by most played
                .slice(0, 10), // limit to top 10 results
            function (_, [code, count]) {
                const $row = $("<tr>")
                    .append($("<td>").text(`〈${count}〉`))
                    .append($("<td>").text(normalize_song(code)));
                most_played_table.append($row);
            }
        );
        $("#most-played").html($("<h4>").text(i18n("most_played_heading")));
        $("#most-played").append(most_played_table);
    }
    $("#info-modal").modal("show");
}

// toggles debugging mode on/off and updates the debug widget visibility
function toggle_debug() {
    // turn on debug mode
    if (sessionStorage.getItem("debug_mode") == null) {
        sessionStorage.setItem("debug_mode", true);
        show_debug_toast();
        $("#debug-div").show();
        $("#session-storage").text(JSON.stringify(sessionStorage, null, 2));
        $("#local-storage").text(parse_local_storage());
        $("#device-info").text(parse_device_info());
    // turn off debug mode
    } else {
        if (DEBUG_TOAST) {
            DEBUG_TOAST.hideToast();
        }
        sessionStorage.removeItem("debug_mode");
        $("#debug-div").hide();
        // no need to empty debug info as it's overwritten on next run
    }
}

function confirm_action() {
    if (window._confirmCallback) {
        window._confirmCallback();
        window._confirmCallback = null;
    }
    $('#confirm-modal').modal('hide');
}
