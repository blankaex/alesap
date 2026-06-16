/*
 * +------------------------------------------------------------
 * | song/song.js
 * +------------------------------------------------------------
 * | song cache management, display helpers, and row builder
 * +------------------------------------------------------------
 */

// helper function to extract values from song cache
function song_cache_get(song_code, key) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    return song_cache[song_code][key] ?? song_cache[song_code].extra[key] ?? null;
}

// stores a full song object into the local song cache
function song_cache_set(song_code, data) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache")) ?? {};
    song_cache[song_code] = data;
    localStorage.setItem("song_cache", JSON.stringify(song_cache));
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

// builds a single song table row with title and artist cells
function build_song_row(song_cache, song_code, extra_columns = []) {
    if (song_cache?.[song_code]) {
        let row = $("<tr>").attr("id", song_code).attr("onclick", "fill_song_modal(this)");
        row.append($("<td>").text(normalize_song(song_code)));
        row.append($("<td>").text(song_cache[song_code].artist));
        extra_columns.forEach(col => row.append($("<td>").text(col)));
        return row;
    } else {
        return null;
    }
}
