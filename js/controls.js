/*
 * +------------------------------------------------------------
 * | controls.js
 * +------------------------------------------------------------
 * | user-initiated actions that send commands to the API,
 * | such as queuing and stopping songs
 * +------------------------------------------------------------
 */

// sends a queue request to the API for the given song code
function queue_song(song_code) {
    if (session_is_active()) {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/queue/",
            data: JSON.stringify({
                akey: sessionStorage.getItem('akey'),
                skey: sessionStorage.getItem('skey'),
                scd: sessionStorage.getItem('scd'),
                ecd: song_code
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function(data) {
            $('#song-modal').modal('hide');
            Toastify({
                text: "Sent to queue",
                duration: 3000,
                position: "center"
            }).showToast();
            append_history(song_code);
        });
    } else {
        $('#song-modal').modal('hide');
        err_not_connected();
    }
}

function append_history(song_code) {
    let song_history = JSON.parse(localStorage.getItem('song_history')) ?? [];
    const today = new Date;
    song_history.push([song_code, today.toLocaleDateString('ja-JP'), today.toLocaleTimeString('ja-JP')]);
    if (song_history.length > HISTORY_MAX_LENGTH) {
        song_history.shift();
    }
    localStorage.setItem('song_history', JSON.stringify(song_history));
    fill_song_history();
}

// queues a random song selected from the song history
function queue_random() {
    const song_history = JSON.parse(localStorage.getItem('song_history'));
    queue_song(song_history[Math.floor(Math.random() * song_history.length)]['code']);
}

// sends a stop request to the API to halt the current song
function stop_song() {
    if (session_is_active()) {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/stop/",
            data: JSON.stringify({
                akey: sessionStorage.getItem('akey'),
                skey: sessionStorage.getItem('skey'),
                scd: sessionStorage.getItem('scd'),
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function(data) {
            Toastify({
                text: "Sent stop request",
                duration: 3000,
                position: "center"
            }).showToast();
        });
    } else {
        err_not_connected();
    }
}

// toggles debugging mode on/off and updates the debug widget visibility
function toggle_debug() {
    // turn on debug mode
    if (sessionStorage.getItem('debug_mode') == null) {
        sessionStorage.setItem('debug_mode', true);
        $('#debug-widget').css("display", "block");
        $('#debug-div').css("display", "block");
        $('#session-storage').text(JSON.stringify(sessionStorage, null, 2));
        $('#local-storage').text(parse_local_storage());
        $('#device-info').text(parse_device_info());
    // turn off debug mode
    } else {
        sessionStorage.removeItem('debug_mode');
        $('#debug-widget').css("display", "none");
        $('#debug-div').css("display", "none");
        // no need to empty debug info as it's overwritten on next run
    }
}
