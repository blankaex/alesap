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
    if (session_is_active() && song_code) {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/queue/",
            data: JSON.stringify({
                // nickname: localStorage.getItem("nickname"),
                akey: sessionStorage.getItem("akey"),
                skey: sessionStorage.getItem("skey"),
                scd: sessionStorage.getItem("scd"),
                ecd: song_code
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function(data) {
            $("#song-modal").modal("hide");
            Toastify({
                text: "Sent to queue",
                duration: TOAST_DURATION,
                position: "center",
                className: "toast-green",
            }).showToast();
            append_history(song_code);
        });
    } else {
        const toast_text = !session_is_active() ?
            "Not connected" :
            "Invalid song code";
        $("#song-modal").modal("hide");
        Toastify({
            text: toast_text,
            duration: TOAST_DURATION,
            position: "center",
            className: "toast-red",
        }).showToast();
    }
}

// queues a random song selected from the song history
function queue_random(table) {
    if (table === "history") {
        const song_history = JSON.parse(localStorage.getItem("song_history"));
        queue_song(song_history[Math.floor(Math.random() * song_history.length)]["song_code"]);
    } else if (table === "favourites") {
        const favourites = JSON.parse(localStorage.getItem("favourites"));
        const songs = Object.keys(favourites).filter(key => favourites[key]);
        queue_song(songs[Math.floor(Math.random() * songs.length)]);
    }
}

// sends a stop request to the API to halt the current song
function stop_song() {
    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/stop/",
        data: JSON.stringify({
            // nickname: localStorage.getItem("nickname"),
            akey: sessionStorage.getItem("akey"),
            skey: sessionStorage.getItem("skey"),
            scd: sessionStorage.getItem("scd"),
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        Toastify({
            text: "Sent stop request",
            duration: TOAST_DURATION,
            position: "center",
            className: "toast-green",
        }).showToast();
    });
}

function add_favourite(song_code) {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || {};
    $("#favourite-button")
        .toggleClass("btn-default", favourites[song_code])
        .toggleClass("btn-danger", !favourites[song_code]);
    favourites[song_code] = !favourites[song_code];
    localStorage.setItem("favourites", JSON.stringify(favourites));
    fill_favourites();
}
