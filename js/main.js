// just a cache of songs keyed by their song code (1234A56)
// with all the relevant info
var song_cache = {}

// loads elements on page start
function startup()
{
    $(window).keydown(function(event) {
        if(event.keyCode == 13) {
            start_search()
            event.preventDefault();
            return false;
        }
    });

    $("#textfield0").on("change", "", function() {
        start_search()
    });

    if (session_is_active()) {
        update_status("connected");
    }
}

// handles clicking items in the search results
function fill_song_modal(song)
{
    $("#song_modal").modal("show");
    var song = $(song).children("td");

    var song_code = '';
    for(var i = 0; i < song.length; i++) {
        var attribute = song[i].id.split('-')[0];
        if (attribute === "code") {
            song_code = song[i].innerText;
        }
        
        if (attribute != "extra") {
            $(`#${attribute}-modal`).text(song[i].innerText);
        }
    }

    $(`#extra-modal`).text(JSON.stringify(song_cache[song_code]));

}

function start_search()
{
    var search_string = $("#textfield0").val();
    console.log(search_string)

    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/search/",
        data: JSON.stringify({
            str: search_string
        }),
        contentType: "application/json; charset=utf-8"

    }).then(function(data) {
        console.log(data.results);
        clear();
        append_table(data.results[0]);
    })
}

function get_form0_object()
{
    var object = {}
    object["search"] = $('#textfield0').val();

    return object;
}

function clear()
{
    var body = $("#dyn_table0_body");
    body.empty();
}

// helper function to display search results
function append_table(data)
{
    var query_object = {};
    var data_object = {};

    if (data !== null && typeof data === 'object') {
        data_object = data;
    } else {
        data_object = data;
    }

    var body = $("#dyn_table0_body")
    var columns = getcolumns();

    for (var index in data_object) {
        // Add the song to the song cache
        var song_data = data_object[index];
        song_cache[song_data['code']] = song_data;

        var row = $('<tr onclick="fill_song_modal(this)">');
        for (var columnIndex = 0; columnIndex < Object.keys(columns).length; columnIndex++)
        {
            var cell_data = data_object[index][ Object.keys(columns)[columnIndex] ];
            row.append( $(`<td id=${Object.keys(columns)[columnIndex]}-${index}>`).text( cell_data ).data("object", data_object[index]) );
        }
        body.append(row);
    }
}

// handles search functionality and displaying results
function start_search()
{
    var search_string = $("#textfield0").val();

    $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/search/",
        data: JSON.stringify({
            str: search_string
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        $("#dyn_table0_body").empty();
        append_table(data.results[0]);
    })
}

// handles adding songs to the queue
function queue_song(song, artist, code)
{
    if (session_is_active()) {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/queue/",
            data: JSON.stringify({
                akey: sessionStorage.getItem('akey'),
                skey: sessionStorage.getItem('skey'),
                scd: sessionStorage.getItem('scd'),
                ecd: code
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function(data) {
            $('#song_modal').modal('hide');
            Toastify({
                text: `Queued ${artist}: ${song}`,
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
                text: `Sent stop request`,
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
