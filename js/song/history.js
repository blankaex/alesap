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
        const filtered = song_history.filter(e => song_filter(e.song_code, filter));
        $("#history-controls h4")
            .text(i18n("song_filter_heading")
            .replace("{count}", `(${filtered.length}/${song_history.length})`));
        $("#history-controls").show();
        $("#empty-history").hide();
        $("#history").show();
        let rows = filtered
            .map(e => {
                const row = build_song_row(e.song_code, [format_last_played(e.last_played)]);
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

// formats a last_played epoch timestamp for display
function format_last_played(last_played) {
    const played = new Date(last_played);
    return played.toLocaleDateString("ja-JP") === new Date().toLocaleDateString("ja-JP")
        ? played.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", hour12: false })
        : played.toLocaleDateString("ja-JP", { year: "2-digit", month: "2-digit", day: "2-digit" });
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
    song_history.unshift({
        song_code: song_code,
        last_played: Date.now()
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
            const key = entry.song_code + "|" + entry.last_played;
            if (seen.has(key)) {
                return false;
            } else {
                seen.add(key);
                return true;
            }
        })
        .sort(function(a, b) {
            return b.last_played - a.last_played;
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
            (data.cache || []).forEach(result => {
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
                        data.song_history || []
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
