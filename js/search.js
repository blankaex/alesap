/*
 * +------------------------------------------------------------
 * | search.js
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
            let song_cache = JSON.parse(localStorage.getItem('song_cache')) ?? {};
            song_cache[song['code']] = song;
            localStorage.setItem('song_cache', JSON.stringify(song_cache));
            append_table("#song-table-body", song['code']);
        });
        // unhide song table
        $("#song-table").css("display", "");
    });
}

// reads song history from localStorage and renders it into the history table
function fill_song_history() {
    if (localStorage.getItem("song_history") != null) {
        const song_history = JSON.parse(localStorage.getItem("song_history"));
        $("#empty-history").css("display", "none");
        $("#history").css("display", "");
        $("#history-table-body").empty();
        song_history.forEach(function(song) {
            append_table("#history-table-body", song['code']);
        });
        // sort table in reverse chronological
        const rows = $('#history-table-body tr').get().reverse();
        $(rows).appendTo('#history-table-body');
    }
}

// appends a single song row to a given table body element
function append_table(table_body, song_code) {
    const song_cache = JSON.parse(localStorage.getItem('song_cache'));
    const row = $(`<tr id=${song_code} onclick="fill_song_modal(this)">`);
    row.append($(`<td>`).text(normalize_song(song_code)));
    row.append($(`<td>`).text(song_cache[song_code]['artist']));
    row.append($(`<td>`).text(song_code));
    $(table_body).append(row);
}

// shows the song detail modal and populates it with data for the selected song
function fill_song_modal(song) {
    $("#song-modal").modal("show");
    const song_code = $(song).attr('id');
    $('#song-modal-title').text(normalize_song(song_code));
    $('#song-modal-body').empty().append(build_song_modal_data(song_code));
}
