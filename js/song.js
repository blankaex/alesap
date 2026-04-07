/*
 * +------------------------------------------------------------
 * | song.js
 * +------------------------------------------------------------
 * | pure data formatting helpers for song objects retrieved
 * | from the cache; no DOM manipulation or API calls
 * +------------------------------------------------------------
 */

// appends extra content type info to a song title if not already present
function normalize_song(song_code) {
    const song_cache = JSON.parse(localStorage.getItem('song_cache'));
    let song = song_cache[song_code]['song'];
    if (
        // check for extra info
        song_cache[song_code]['extra']['content_type'] != null &&
        // ignore if extra info already included in title
        !song.toLowerCase().includes(song_cache[song_code]['extra']['content_type'].toLowerCase())
    ) {
        // append extra info to title
        song += `【${song_cache[song_code]['extra']['content_type']}】`;
    }
    return song;
}

// builds the list of modal body elements for a given song
function build_song_modal_data(song_code) {
    const song_cache = JSON.parse(localStorage.getItem('song_cache')) ?? {};
    const modal_data = [];
    modal_data.push(
        $('<p>').append($('<b>').text('Title:'), $('<br>'), $('#song-modal-title').text())
    );
    modal_data.push(
        $('<p>').append($('<b>').text('Artist:'), $('<br>'), song_cache[song_code]['artist'])
    );
    if (song_cache[song_code]['extra']['tie_up'] != null) {
        modal_data.push(
            $('<p>').append($('<b>').text('Franchise:'), $('<br>'), song_cache[song_code]['extra']['tie_up'])
        );
    }
    modal_data.push(
        $('<p>').append($('<b>').text('Code:'), $('<br>'), $('<span>').attr('id', 'current-song-code').text(song_code))
    );
    if (sessionStorage.getItem('debug_mode')) {
        modal_data.push($('<hr>'));
        modal_data.push($('<p>').append($('<b>').text('Debugging info:')));
        modal_data.push($('<pre>').text(JSON.stringify(song_cache[song_code], null, 2)));
    }
    return modal_data;
}
