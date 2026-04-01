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

    if (sessionStorage.getItem('akey')) {
        update_status();
    }
}

// handles clicking items in the search results
function fill_song_modal(song)
{
    $("#song_modal").modal("show");
    var song = $(song).children("td");
    for(var i = 0; i < song.length; i++) {
        var attribute = song[i].id.split('-')[0];
        if (attribute != "extra") {
            $(`#${attribute}-modal`).text(song[i].innerText);
        } else {
            // do any conditional text formatting here then just set the value below
            $(`#extra-modal`).text("None");
        }
    }
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
        url: "https://api.alesap.astrobunny.net/api/v1/command/search/",
        data: JSON.stringify({
            str: search_string
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        $("#dyn_table0_body").empty();
        Toastify({
            text: `Search complete`,
            duration: 3000,
            position: "center"
        }).showToast();
        append_table(data.results[0]);
    })
}

// handles adding songs to the queue
function queue_song(song, artist, code)
{
    $.ajax({
        type: "POST",
        // TODO: needs to be implemented in backend
        url: "https://api.alesap.astrobunny.net/api/v1/command/queue/",
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
}

// handles stopping the current song in the queue
function stop_song()
{
    $.ajax({
        type: "POST",
        // TODO: needs to be implemented in backend
        url: "https://api.alesap.astrobunny.net/api/v1/command/stop/",
        data: JSON.stringify({
            akey: sessionStorage.getItem('akey'),
            skey: sessionStorage.getItem('skey'),
            scd: sessionStorage.getItem('scd'),
        }),
        contentType: "application/json; charset=utf-8"
    }).then(function(data) {
        Toastify({
            text: `Song stopped`,
            duration: 3000,
            position: "center"
        }).showToast();
    })
}
