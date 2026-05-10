/*
 * +------------------------------------------------------------
 * | song/table.js
 * +------------------------------------------------------------
 * | song table rendering
 * +------------------------------------------------------------
 */

// appends a single song row to a given table body element
function append_table(table_body, song_code, last_played = null) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    if (song_code in song_cache) {
        const row = $(`<tr id=${song_code} onclick="fill_song_modal(this)">`);
        row.append($("<td>").text(normalize_song(song_code)));
        row.append($("<td>").text(song_cache[song_code].artist));
        if (table_body == "#history-table-body") {
            row.append($("<td>").text(last_played));
        }
        $(table_body).append(row);
    }
}
