/*
 * +------------------------------------------------------------
 * | song/history.js
 * +------------------------------------------------------------
 * | song history management
 * +------------------------------------------------------------
 */

const HISTORY_MAX_LENGTH = 100;

// reads song history from localStorage and renders it into the history table
function fill_song_history(filter) {
    const song_history = JSON.parse(localStorage.getItem("song_history"));
    if (song_history) {
        const song_cache = load_song_cache();
        const total = song_history.length;
        const filtered = song_history.filter(e => song_filter(e.song_code, filter));
        const visible = filtered.length;
        $("#history-controls h4").text(i18n("song_filter_heading").replace("{count}", `(${visible}/${total})`));
        $("#history-controls").show();
        $("#empty-history").hide();
        $("#history").show();
        const today = new Date().toLocaleDateString("ja-JP");
        let rows = filtered
            .map(e => {
                const date_time = e.last_played_date == today
                    ? e.last_played_time
                    : e.last_played_date;
                const row = build_song_row(song_cache, e.song_code, [date_time]);
                return row ? row.prop("outerHTML") : null;
            }).filter(Boolean).join("");
        $("#history-table-body").html(rows);
    } else {
        $("#history-controls h4").text(i18n("song_filter_heading").replace("{count}", "(0/0)"));
        $("#history-controls").hide();
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
    song_history.unshift({
        song_code: song_code,
        last_played_date: today.toLocaleDateString("ja-JP"),
        last_played_time: today.toLocaleTimeString("ja-JP")
    });
    if (song_history.length > HISTORY_MAX_LENGTH) {
        song_history.pop();
    }
    localStorage.setItem("song_history", JSON.stringify(song_history));

    fill_song_history($("#history-filter-field").val());
}

// merge, dedup, sort, and truncate imported history with local history
function merge_history(old_history, imported_history) {
    const seen = new Set();
    return [...old_history, ...imported_history]
        .filter(function(entry) {
            const key = entry.song_code + "|" +
                entry.last_played_date + "|" +
                entry.last_played_time;
            if(seen.has(key)) { return false; }
            seen.add(key);
            return true;
        })
        .sort(function(a, b) {
            return new Date(b.last_played_date + " " + b.last_played_time) -
                   new Date(a.last_played_date + " " + a.last_played_time);
        })
        .slice(0, HISTORY_MAX_LENGTH);
}

function import_history() {
    show_confirm().then(function() {
        $.ajax({
            type: "GET",
            url: API_URL + "/api/v1/command/import_history/",
            data: {
                nickname: localStorage.getItem("nickname")
            }
        }).then(function(data) {
            // add "new" songs to local song cache
            data.cache.forEach(result => {
                song_cache_set(result.code, result);
            });
            // merge, dedup, and sort history
            const old_history = JSON.parse(
                localStorage.getItem("song_history") || "[]"
            );
            localStorage.setItem(
                "song_history",
                JSON.stringify(
                    merge_history(
                        old_history,
                        data.song_history
                    )
                )
            );
            localStorage.setItem("song_count", JSON.stringify(data.song_count));
            // send ui confirmation message
            toast(i18n("imported_history"), "toast-green");
        }).fail(function() {
            toast(i18n("import_failed"), "toast-red");
        });
    });
}

function export_history() {
    show_confirm().then(function() {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/export_history/",
            data: JSON.stringify({
                nickname: localStorage.getItem("nickname"),
                song_history: JSON.parse(localStorage.getItem("song_history")),
                song_count: JSON.parse(localStorage.getItem("song_count"))
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function() {
            toast(i18n("exported_history"), "toast-green");
        }).fail(function() {
            toast(i18n("export_failed"), "toast-red");
        });
    });
}

function clear_history() {
    show_confirm().then(function() {
        localStorage.removeItem("song_history");
        toast(i18n("toast_history_cleared"), "toast-green");
        fill_song_history($("#history-filter-field").val());
    });
}
