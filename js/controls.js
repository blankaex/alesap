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
        Toastify({
            text: `Debug Mode Enabled`,
            duration: 3000,
            position: "center",
        }).showToast();
    } else {
        sessionStorage.removeItem('debug_mode');
        Toastify({
            text: `Debug Mode Disabled`,
            duration: 3000,
            position: "center",
        }).showToast();
    }
}
