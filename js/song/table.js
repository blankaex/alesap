/*
 * +------------------------------------------------------------
 * | song/table.js
 * +------------------------------------------------------------
 * | song table rendering
 * +------------------------------------------------------------
 */

// appends a single search result row to the song table
function append_search_results(song_code) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    if (song_code in song_cache) {
        let row = $("<tr>").attr("id", song_code).attr("onclick", "fill_song_modal(this)");
        row.append($("<td>").text(normalize_song(song_code)));
        row.append($("<td>").text(song_cache[song_code].artist));
        $("#search-table-body").append(row);
    }
}
