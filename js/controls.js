/*
 * +------------------------------------------------------------
 * | controls.js
 * +------------------------------------------------------------
 * | functions that run when user interacts with the UI
 * +------------------------------------------------------------
 */

// handles adding songs to the queue
function queue_song(song_code)
{
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
            $('#song_modal').modal('hide');
            Toastify({
                text: "Sent to queue",
                duration: 3000,
                position: "center"
            }).showToast();
            var song_cache = JSON.parse(localStorage.getItem('song_cache'));
            var song_history = JSON.parse(localStorage.getItem('song_history')) ?? [];
            song_history.push(song_cache[song_code]);
            if (song_history.length > HISTORY_MAX_LENGTH) {
                song_history.shift();
            }
            localStorage.setItem('song_history', JSON.stringify(song_history));
        })
    } else {
        $('#song_modal').modal('hide');
        err_not_connected();
    }
}

function queue_random() {
    const song_history = JSON.parse(localStorage.getItem('song_history'));
    queue_song(song_history[Math.floor(Math.random() * song_history.length)]['code']);
}

// handles stopping the current song in the queue
function stop_song()
{
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
        })
    } else {
        err_not_connected();
    }
}

function toggle_debug()
{
    if (sessionStorage.getItem('debug_mode') == null) {
        sessionStorage.setItem('debug_mode', true);
        $('#debug-div').css("display", "block");
        $('#debugging-info').append(`<p><b>Session Storage:</b></p>`);
        $('#debugging-info').append(`<pre>${JSON.stringify(sessionStorage, null, 2)}</pre>`);
        $('#debugging-info').append(`<p><b>Local Storage:</b></p>`);
        var local_storage_info = {};
        Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key);
            try {
                local_storage_info[key] = JSON.parse(value);
            } catch (e) {
                local_storage_info[key] = value;
            }
        });
        $('#debugging-info').append(`<pre>${JSON.stringify(local_storage_info, null, 2)}</pre>`);
        const nav_data = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio,
            platform: navigator.platform,
            onLine: navigator.onLine,
            cookieEnabled: navigator.cookieEnabled,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory
        };
        $('#debugging-info').append(`<p><b>Device Info:</b></p>`);
        $('#debugging-info').append(`<pre>${JSON.stringify(nav_data, null, 2)}</pre>`);
    } else {
        sessionStorage.removeItem('debug_mode');
        $('#debug-div').css("display", "none");
        $('#debugging-info').empty();
    }
}

function err_not_connected() {
    Toastify({
        text: "Not connected",
        duration: 3000,
        position: "center",
        style: {
            background: "#ed5565",
        }
    }).showToast();
}
