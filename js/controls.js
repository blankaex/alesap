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
            toast("Sent to queue", "toast-green");
            append_history(song_code);
        });
    } else {
        const toast_text = !session_is_active() ?
            "Not connected" :
            "Invalid song code";
        $("#song-modal").modal("hide");
        toast(toast_text, "toast-red");
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
        toast("Sent stop request", "toast-green");
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

function back_handler() {
    // check if any active modals
    // -> close modal
    const $active_modal = $(".modal.in");
    if ($active_modal.length) {
        $active_modal.modal("hide");
        return;
    }

    // no modals active
    // check if active tab is not search tab
    // -> back to search tab
    const $active_tab = $("li.active");
    if (!$active_tab.find("a:contains('Search')").length) {
        $("li a:contains('Search')").trigger("click");
        return;
    }

    // search tab is active
    // check if any items in search history
    // -> return the last search string instead
    const last_search = search_history_pop();
    if (last_search) {
        $("#search-field").val(last_search);
        start_search(0, false);
        return;
    }

    // no items in search history
    // check if search results are being displayed
    // -> clear search table
    if ($("#search-field").val()) {
        $("#song_search_form")[0].reset();
        $("#empty-search").hide();
        $("#song-table").hide();
        $("#song-table-body").empty();
        return;
    }

    // no search results displayed
    // -> toast user
    toast("Search history empty", "toast-red");
}
