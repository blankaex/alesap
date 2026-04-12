/*
 * +------------------------------------------------------------
 * | song.js
 * +------------------------------------------------------------
 * | handles song search API calls, rendering search results
 * | and history tables, and populating the song detail modal
 * +------------------------------------------------------------
 */

// sends a search query to the API and renders results into the song table
function start_search(page = 0) {
    // update ui to give feedback that search is starting
    if (page === 0) {
        $("#empty-search").hide();
        $("#song-table-body").empty();
        $("#song-table").show();
        $("#loader-div").css("display", "flex");
    }
    // call search api
    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/search/",
        data: JSON.stringify({
            str: $("#search-field").val(),
            page: page
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        if (data.results?.length && data.total) {
            // add search results to song cache + search table
            data.results[0].forEach(result => {
                let song_cache = JSON.parse(localStorage.getItem("song_cache")) ?? {};
                song_cache[result.code] = result;
                localStorage.setItem("song_cache", JSON.stringify(song_cache));
                append_table("#song-table-body", result.code);
            });
            // continue searching unless no more results or max page limit reached
            const end_search =
                data.total / SEARCH_RESULTS_LIMIT > data.page + 1 ||
                data.page >= SEARCH_PAGE_LIMIT;
            if (end_search) {
                setTimeout(() => { start_search(page + 1); }, SEARCH_INTERVAL);
            } else {
                $("#loader-div").hide();
            }
        } else {
            // update ui if no search results at all
            $("#empty-search").show();
            $("#song-table").hide();
            $("#loader-div").hide();
        }
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
        song_history.forEach(entry => {
            const date_time = entry.last_played_date == today ?
                entry.last_played_time :
                entry.last_played_date;
            append_table(
                "#history-table-body",
                entry.song_code,
                date_time
            );
        });
        // sort table in reverse chronological
        const rows = $("#history-table-body tr").get().reverse();
        $(rows).appendTo("#history-table-body");
    }
}

// reads favourites from localStorage and renders it into the favourites table
function fill_favourites() {
    const favourites = JSON.parse(localStorage.getItem("favourites"));
    if (favourites) {
        $("#empty-favourites").hide();
        $("#favourites").show();
        $("#favourites-table-body").empty();
        Object.keys(favourites).forEach(song_code => {
            if (favourites[song_code]) {
                append_table("#favourites-table-body", song_code);
            }
        });
    }
    // sort table by artist, then title
    const rows = $("#favourites-table-body tr").get();
    rows.sort((a, b) => {
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

    let song_count = JSON.parse(localStorage.getItem("song_count")) || {};
    song_count[song_code] = (song_count[song_code] ?? 0) + 1;
    localStorage.setItem("song_count", JSON.stringify(song_count));

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
