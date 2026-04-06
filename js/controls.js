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
        })
    } else {
        $('#song_modal').modal('hide');
        Toastify({
            text: `Not connected`,
            duration: 3000,
            position: "center",
            style: {
                background: "#ed5565",
            }
        }).showToast();
    }
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
        $('#song_modal').modal('hide');
        Toastify({
            text: "Not connected",
            duration: 3000,
            position: "center",
            style: {
                background: "#ed5565",
            }
        }).showToast();
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
        $('#debugging-info').append(`<pre>${JSON.stringify(localStorage, null, 2)}</pre>`);
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
