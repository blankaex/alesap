/*
 * +------------------------------------------------------------
 * | song.js
 * +------------------------------------------------------------
 * | handles song search API calls, rendering search results
 * | and history tables, and populating the song detail modal
 * +------------------------------------------------------------
 */

// sends a search query to the API and renders results into the song table
function start_search() {
    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/search/",
        data: JSON.stringify({
            str: $("#search-field").val()
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        $("#song-table-body").empty();
        data.results[0].forEach(song => {
            let song_cache = JSON.parse(localStorage.getItem("song_cache")) ?? {};
            song_cache[song["code"]] = song;
            localStorage.setItem("song_cache", JSON.stringify(song_cache));
            append_table("#song-table-body", song["code"]);
        });
        // unhide song table
        $("#song-table").show();
    });
}

// reads song history from localStorage and renders it into the history table
function fill_song_history() {
    if (localStorage.getItem("song_history") != null) {
        const song_history = JSON.parse(localStorage.getItem("song_history"));
        $("#empty-history").hide();
        $("#history").show();
        $("#history-table-body").empty();
        const today = new Date().toLocaleDateString("ja-JP");
        song_history.forEach(function(song) {
            if (song["last_played_date"] == today) {
                append_table("#history-table-body", song["song_code"], song["last_played_time"]);
            } else {
                append_table("#history-table-body", song["song_code"], song["last_played_date"]);
            }
        });
        // sort table in reverse chronological
        const rows = $("#history-table-body tr").get().reverse();
        $(rows).appendTo("#history-table-body");
    }
}

// reads favourites from localStorage and renders it into the favourites table
function fill_favourites() {
    if (localStorage.getItem("favourites") != null) {
        const favourites = JSON.parse(localStorage.getItem("favourites"));
        $("#empty-favourites").hide();
        $("#favourites").show();
        $("#favourites-table-body").empty();
        favourites.forEach(function(song) {
            append_table("#favourites-table-body", song);
        });
    }
    // sort table by artist, then title
    const rows = $("#favourites-table-body tr").get();
    rows.sort(function(a, b) {
        const valA2 = $(a).children("td").eq(1).text().trim().toLowerCase();
        const valB2 = $(b).children("td").eq(1).text().trim().toLowerCase();
        if (valA2 < valB2) { return -1; }
        if (valA2 > valB2) { return 1; }
        const valA1 = $(a).children("td").eq(0).text().trim().toLowerCase();
        const valB1 = $(b).children("td").eq(0).text().trim().toLowerCase();
        if (valA1 < valB1) { return -1; }
        if (valA1 > valB1) { return 1; }
        return 0;
    });
    $(rows).appendTo($("#favourites-table-body"));
}

// append queued songs to the song history
function append_history(song_code) {
    let song_history = JSON.parse(localStorage.getItem("song_history")) ?? [];
    const today = new Date();
    song_history.push({
        song_code: song_code,
        last_played_date: today.toLocaleDateString("ja-JP"),
        last_played_time: today.toLocaleTimeString("ja-JP")
    });
    if (song_history.length > HISTORY_MAX_LENGTH) {
        song_history.shift();
    }
    localStorage.setItem("song_history", JSON.stringify(song_history));
    fill_song_history();
}

// appends a single song row to a given table body element
function append_table(table_body, song_code, last_played = null) {
    const song_cache = JSON.parse(localStorage.getItem("song_cache"));
    const row = $(`<tr id=${song_code} onclick="fill_song_modal(this)">`);
    row.append($("<td>").text(normalize_song(song_code)));
    row.append($("<td>").text(song_cache[song_code].artist));
    if (table_body == "#history-table-body") {
        row.append($("<td>").text(last_played));
    } else {
        row.append($("<td>").text(song_code));
    }
    $(table_body).append(row);
}

// shows the song detail modal and populates it with data for the selected song
function fill_song_modal(song) {
    // show song modal
    $("#song-modal").modal("show");
    // get song code of active selection
    const song_code = $(song).attr("id");
    // set modal title
    $("#song-modal-title").text(normalize_song(song_code));
    // set modal body
    $("#song-modal-body").empty().append(build_song_modal_data(song_code));
    // update ui based on favourite status
    const favourites = localStorage.getItem("favourites") || [];
    if (favourites.includes(song_code)) {
        $("#favourite-button").removeClass("btn-default");
        $("#favourite-button").addClass("btn-danger");
    } else {
        $("#favourite-button").removeClass("btn-danger");
        $("#favourite-button").addClass("btn-default");
    }
}
