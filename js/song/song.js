/*
 * +------------------------------------------------------------
 * | song/song.js
 * +------------------------------------------------------------
 * | song cache management, display helpers, and row builder
 * +------------------------------------------------------------
 */

let SONG_CACHE = null;

function load_song_cache() {
    if (!SONG_CACHE) {
        SONG_CACHE = JSON.parse(localStorage.getItem("song_cache")) ?? {};
    }
    return SONG_CACHE;
}

function song_cache_get(song_code, key) {
    const cache = load_song_cache();
    return cache[song_code]?.[key] ?? cache[song_code]?.extra?.[key] ?? null;
}

function song_cache_set(song_code, data) {
    const cache = load_song_cache();
    cache[song_code] = data;
    localStorage.setItem("song_cache", JSON.stringify(cache));
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

// returns true if the song's title or artist contains the filter substring (case-insensitive)
function song_filter(song_code, filter) {
    if (filter) {
        const search_string = filter.toLowerCase();
        const title = (normalize_song(song_code) || "").toLowerCase();
        const artist = (song_cache_get(song_code, "artist") || "").toLowerCase();
        return title.includes(search_string) || artist.includes(search_string);
    } else {
        return true;
    }
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
