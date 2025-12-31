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
}

function fill_song_modal(song)
{
    $("#song_modal").modal("show");
    var song = $(song).children("td");
    for(var i = 0; i < song.length; i++) {
        var attribute = song[i].id.split('-')[0];
        if (attribute == "song") {
            console.log($(`${attribute}-modal`));
            $(`#${attribute}-modal`).text(song[i].innerText);
        } else {
            $(`#${attribute}-modal`).text(`${attribute}: ${song[i].innerText}`);
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
    console.log(song, artist, code);
    $('#song_modal').modal('hide');
    Toastify({
        text: `Queued ${artist}: ${song}`,
        duration: 3000,
        position: "center"
    }).showToast();
}
