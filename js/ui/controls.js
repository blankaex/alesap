/*
 * +------------------------------------------------------------
 * | ui/controls.js
 * +------------------------------------------------------------
 * | user-initiated API commands and navigation
 * +------------------------------------------------------------
 */

// sends a queue request to the API for the given song code
function queue_song(song_code) {
    if (session_is_active() && song_code) {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/queue/",
            data: JSON.stringify({
                nickname: localStorage.getItem("nickname"),
                akey: sessionStorage.getItem("akey"),
                skey: sessionStorage.getItem("skey"),
                scd: sessionStorage.getItem("scd"),
                ecd: song_code
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function(data) {
            $("#song-modal").modal("hide");
            toast(i18n("toast_sent_to_queue"), "toast-green");
            append_history(song_code);
            update_song_stats(song_code);
        });
    } else {
        const toast_text = !session_is_active() ?
            i18n("toast_not_connected") :
            i18n("toast_invalid_song_code");
        $("#song-modal").modal("hide");
        toast(toast_text, "toast-red");
    }
}

// queues a random song selected from the song history
function queue_random(table) {
    if (session_is_active()) {
        let songs = [];

        if (table === "history") {
            const song_history = JSON.parse(localStorage.getItem("song_history"));
            songs = song_history.map(song => song.song_code);
        } else if (table === "favourites") {
            const favourites = JSON.parse(localStorage.getItem("favourites"));
            songs = Object.keys(favourites).filter(key => favourites[key]);
        }

        const storage_key = `queued_random_${table}`;
        let queued = JSON.parse(sessionStorage.getItem(storage_key));

        // reset if all songs already used
        if (queued.length >= new Set(songs).size) {
            queued = [];
        }

        const available = songs.filter(song => !queued.includes(song));
        const selected = available[Math.floor(Math.random() * available.length)];

        queued.push(selected);
        sessionStorage.setItem(storage_key, JSON.stringify(queued));
        queue_song(selected);
    } else {
        toast(i18n("toast_not_connected"), "toast-red");
    }
}

function show_popover() {
    $('#popover-button').popover('show');
}

// sends a stop request to the API to halt the current song
function stop_song() {
    if (localStorage.getItem('confirm_stop') === 'true') {
        window._confirmCallback = function() {
            execute_stop();
        };
        $('#confirm-modal').modal('show');
    } else {
        execute_stop();
    }
}

// helper function called by stop_song(); not called directly
function execute_stop() {
    $('#popover-button').popover('hide');
    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/stop/",
        data: JSON.stringify({
            nickname: localStorage.getItem("nickname"),
            akey: sessionStorage.getItem("akey"),
            skey: sessionStorage.getItem("skey"),
            scd: sessionStorage.getItem("scd"),
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        toast(i18n("toast_sent_stop_request"), "toast-green");
    });
}

function change_pitch(direction) {
    const pitch = direction ? "sharp" : "flat";
    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/pitch/",
        data: JSON.stringify({
            nickname: localStorage.getItem("nickname"),
            akey: sessionStorage.getItem("akey"),
            skey: sessionStorage.getItem("skey"),
            scd: sessionStorage.getItem("scd"),
            pitch: pitch
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        if (direction) {
            toast(i18n("toast_sent_sharp_request"), "toast-green");
        } else {
            toast(i18n("toast_sent_flat_request"), "toast-green");
        }
    });
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
    // TODO: replace ids when weaver supports
    if (!$active_tab.find("a[href='#tab0']").length) {
        $("li a[href='#tab0']").focus().trigger("click");
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
    toast(i18n("search_history_empty"), "toast-red");
}
