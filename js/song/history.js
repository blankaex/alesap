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
