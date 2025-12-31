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

function start_search()
{
    var search_string = $("#textfield0").val();
    console.log(search_string)

    $.ajax({
        type: "POST",
        url: "https://api.alesap.astrobunny.net/api/v1/command/search/",
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

function queue_song(song, artist, code)
{
    let uri = "http://order.mashup.jp/bridge/post_request.php";
    let body = { 
        akey: sessionStorage.getItem('akey'),
        skey: sessionStorage.getItem('skey'),
        scd: sessionStorage.getItem('scd'),
        ecd: code
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(body));

    $('#song_modal').modal('hide');
    Toastify({
        text: `Queued ${artist}: ${song}`,
        duration: 3000,
        position: "center"
    }).showToast();
}

function stop_song()
{
    let uri = "http://order.mashup.jp/bridge/post_request.php";
    let body = { 
        akey: sessionStorage.getItem('akey'),
        skey: sessionStorage.getItem('skey'),
        scd: sessionStorage.getItem('scd'),
        type: 2
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uri, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(body));
}
