/*
 * +------------------------------------------------------------
 * | settings.js
 * +------------------------------------------------------------
 * | functionality related to settings tab
 * +------------------------------------------------------------
 */

// set user nickname
async function set_nickname(startup = false) {
    let nickname = startup ? 
        localStorage.getItem("nickname") :
        $("#nickname-field").val() ||
        null;
    if (!nickname) {
        // TODO: remove network call
        const [adjs, nouns] = await Promise.all([
            fetch('https://api.datamuse.com/words?rel_jjb=thing&max=1000').then(r => r.json()),
            fetch('https://api.datamuse.com/words?rel_jja=blue&max=1000').then(r => r.json())
        ]);
        const pick = arr => arr[Math.floor(Math.random() * arr.length)].word;
        nickname = `${pick(adjs)}${pick(nouns)}`;
    }
    $("#nickname-field").val(nickname);
    localStorage.setItem("nickname", nickname);
    if (!startup) {
        Toastify({
            text: "Nickname saved",
            duration: TOAST_DURATION,
            position: "center",
            className: "toast-green",
        }).showToast();
    }
}

function show_info() {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    const most_played = Object.values(song_cache)
        .filter(obj => obj.count != null)
        .map(obj => [obj.count, obj.song])
        .sort((a, b) => b[0] - a[0]);
    if (most_played) {
        let most_played_table = $("<table>").addClass("table");
        $.each(most_played.slice(0, 10), function (_, [count, song]) {
            const $row = $("<tr>")
                .append($("<td>").text(count))
                .append($("<td>").text(song));
            most_played_table.append($row);
        });
        $("#most-played").html($("<h4>").text("Most Played:"));
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
