/*
 * +------------------------------------------------------------
 * | song/cache.js
 * +------------------------------------------------------------
 * | song cache helpers
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
