/*
 * +------------------------------------------------------------
 * | main.js
 * +------------------------------------------------------------
 * | primary frontend logic of the application
 * +------------------------------------------------------------
 */

const HISTORY_MAX_LENGTH = 20;

// loads elements on page start
function startup()
{
    // add listeners to search bar
    $(window).keydown(function(event) {
        if(event.keyCode == 13) {
            start_search()
            event.preventDefault();
            return false;
        }
    });
    $("#search-field").on("change", "", function() {
        start_search()
    });

    // checks if session is already active
    if (session_is_active()) {
        update_status("connected");
    }

    // add listener to populate song history
    $('li a:contains("History")').on('click', function() {
        fill_song_history();
    });

    // clears forms on reload
    $(document).ready(function() {
        $('#form0')[0].reset(); 
        $('#form1')[0].reset(); 
    });

    // disables debug mode on reload
    window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('debug_mode');
    });
}

// handles search functionality and displaying results
function start_search()
{
    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/search/",
        data: JSON.stringify({
            str: $("#search-field").val()
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        $("#song_table_body").empty();
        const results = data.results[0];
        for (var index in results) {
            // add song to cache
            var song_cache = JSON.parse(localStorage.getItem('song_cache')) ?? {};
            song_cache[results[index]['code']] = results[index];
            localStorage.setItem('song_cache', JSON.stringify(song_cache));
            // append song to song table
            append_table("#song_table_body", results[index]['code']);
        }
        // unhide song table
        $("#song_table").css("display", "");
    })
}

// populates the song history
function fill_song_history() {
    if (localStorage.getItem("song_history") != null) {
        song_history = JSON.parse(localStorage.getItem("song_history"));
        $("#empty-history").css("display", "none");
        $("#history").css("display", "");
        $("#history_table_body").empty();
        song_history.forEach(function(song) {
            append_table("#history_table_body", song['code']);
        });
        // sort table in reverse chronological
        var rows = $('#history_table_body tr').get().reverse();
        $(rows).appendTo('#history_table_body');
    }
}

// helper function to add songs to tables
function append_table(table_body, song_code)
{
    const song_cache = JSON.parse(localStorage.getItem('song_cache'));
    var row = $(`<tr id=${song_code} onclick="fill_song_modal(this)">`);
    row.append($(`<td>`).text(normalize_song(song_code)));
    row.append($(`<td>`).text(song_cache[song_code]['artist']));
    row.append($(`<td>`).text(song_code));
    $(table_body).append(row);
}

// helper function to add additional song info to title
function normalize_song(song_code) {
    const song_cache = JSON.parse(localStorage.getItem('song_cache'));
    var song = song_cache[song_code]['song'];
    if (song_cache[song_code]['extra']['content_type'] != null) {
        if(!song.toLowerCase().includes(song_cache[song_code]['extra']['content_type'].toLowerCase())) {
            song += `【${song_cache[song_code]['extra']['content_type']}】`;
        }
    }
    return song;
}

// handles clicking items in the search results
function fill_song_modal(song)
{
    $("#song_modal").modal("show");
    var song_code = $(song).attr('id');
    const song_cache = JSON.parse(localStorage.getItem('song_cache')) ?? {};

    $('#song-modal-title').text(normalize_song(song_code));

    let song_modal_content = "";
    song_modal_content += `<p><b>Title:</b></br>${$('#song-modal-title').text()}</p>`;
    song_modal_content += `<p><b>Artist:</b></br>${song_cache[song_code]['artist']}</p>`;
    if (song_cache[song_code]['extra']['tie_up'] != null) {
        song_modal_content += `<p><b>Franchise:</b></br>${song_cache[song_code]['extra']['tie_up']}</p>`;
    }
    song_modal_content += `<p><b>Code:</b></br><span id='current-song-code'>${song_code}</span></p>`;

    if(localStorage.getItem('debug_mode')) {
        song_modal_content += "<hr><p><b>Debugging info:</b></p>";
        song_modal_content += `<pre>${JSON.stringify(song_cache[song_code], null, 2)}</pre>`;
    }

    $('#song-modal-body').html(song_modal_content);
}
