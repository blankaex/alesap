/*
 * +------------------------------------------------------------
 * | song/history.js
 * +------------------------------------------------------------
 * | song history management
 * +------------------------------------------------------------
 */

const HISTORY_MAX_LENGTH = 100;

// reads song history from localStorage and renders it into the history table
function fill_song_history() {
    if (localStorage.getItem("song_history") != null) {
        const song_history = JSON.parse(localStorage.getItem("song_history"));
        $("#empty-history").hide();
        $("#history").show();
        $("#history-table-body").empty();
        const today = new Date().toLocaleDateString("ja-JP");
        song_history.forEach(entry => {
            const date_time = entry.last_played_date == today ?
                entry.last_played_time :
                entry.last_played_date;
            append_table(
                "#history-table-body",
                entry.song_code,
                date_time
            );
        });
        // sort table in reverse chronological
        const rows = $("#history-table-body tr").get().reverse();
        $(rows).appendTo("#history-table-body");
    } else {
        $("#history").hide();
        $("#empty-history").show();
    }
}

// increments the play count for a given song
function update_song_stats(song_code) {
    let song_count = JSON.parse(localStorage.getItem("song_count")) || {};
    song_count[song_code] = (song_count[song_code] ?? 0) + 1;
    localStorage.setItem("song_count", JSON.stringify(song_count));
}

// append queued songs to the song history
function append_history(song_code) {
    let song_history = JSON.parse(localStorage.getItem("song_history")) ?? [];
    const today = new Date();
    song_history.push({
        song_code: song_code,
        last_played_date: today.toLocaleDateString("ja-JP"),
        last_played_time: today.toLocaleTimeString("ja-JP")
    });
    if (song_history.length > HISTORY_MAX_LENGTH) {
        song_history.shift();
    }
    localStorage.setItem("song_history", JSON.stringify(song_history));

    fill_song_history();
}

function import_history() {
    window._confirmCallback = function() {
        $.ajax({
            type: "GET",
            url: API_URL + "/api/v1/command/import_history/",
            data: {
                nickname: localStorage.getItem("nickname")
            }
        }).then(function(data) {
            if(data) {
                // add "new" songs to local song cache
                data.cache.forEach(result => {
                    song_cache_set(result.code, result);
                });
                // append history
                const old_history = JSON.parse(
                    localStorage.getItem("song_history") || "[]"
                );
                localStorage.setItem(
                    "song_history",
                    JSON.stringify([
                        ...old_history,
                        ...data.song_history
                    ])
                );
                // send ui confirmation message
                toast(i18n("imported_history"), "toast-green");
            } else {
                toast(i18n("import_failed"), "toast-red");
            }
        });
    };
    $('#confirm-modal').modal('show');
}

function export_history() {
    window._confirmCallback = function() {
        const history = JSON.parse(localStorage.getItem("song_history")) || null;
        if(history) {
            $.ajax({
                type: "POST",
                url: API_URL + "/api/v1/command/export_history/",
                data: JSON.stringify({
                    nickname: localStorage.getItem("nickname"),
                    data: history
                }),
                contentType: "application/json; charset=utf-8"
            }).then(function(data) {
                toast(i18n("exported_history"), "toast-green");
            });
        } else {
            toast(i18n("export_failed"), "toast-red");
        }
    };
    $('#confirm-modal').modal('show');
}

function clear_history() {
    window._confirmCallback = function() {
        localStorage.removeItem("song_history");
        toast(i18n("toast_history_cleared"), "toast-green");
        fill_song_history();
    };
    $('#confirm-modal').modal('show');
}
