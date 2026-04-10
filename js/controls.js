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
                duration: 3000,
                position: "center",
                className: "toast-green",
            }).showToast();
            append_history(song_code);
        });
    } else {
        $("#song-modal").modal("hide");
        Toastify({
            text: "Not connected",
            duration: 3000,
            position: "center",
            className: "toast-red",
        }).showToast();
    }
}

// queues a random song selected from the song history
function queue_random(table) {
    if (table == "history") {
        const song_history = JSON.parse(localStorage.getItem("song_history"));
        queue_song(song_history[Math.floor(Math.random() * song_history.length)]["song_code"]);
    } else if (table == "favourites") {
        const favourites = JSON.parse(localStorage.getItem("favourites"));
        queue_song(favourites[Math.floor(Math.random() * favourites.length)]);
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
            duration: 3000,
            position: "center",
            className: "toast-green",
        }).showToast();
    });
}

function add_favourite(song_code) {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
    // add to favourites
    if (!favourites.includes(song_code)) {
        $("#favourite-button").removeClass("btn-default");
        $("#favourite-button").addClass("btn-danger");
        favourites.push(song_code);
    // remove from favourites
    } else {
        $("#favourite-button").removeClass("btn-danger");
        $("#favourite-button").addClass("btn-default");
        favourites.splice(favourites.indexOf(song_code), 1);
    }
    localStorage.setItem("favourites", JSON.stringify(favourites));
    fill_favourites();
}
