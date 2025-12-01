// initialize globals
var akey = '';
var skey = '';
var scd  = '';

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

    // create test data
    clear();
    append_table([{song: "test_song", code: "test_code", artist: "test_artist"}]);
}

function scan_qr()
{
    const html5QrCode = new Html5Qrcode("reader");
    // define callback for successful scan
    const qrCodeSuccessCallback = async (decodedText, decodedResult) => {
        await html5QrCode.stop();
        $('#scan_qr').modal('hide');
        // rudimentary error checking
        if(!/rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/.test(decodedText)) {
            throw new Error("Invalid QR Code");
        }
        [akey, skey, scd] = decodedText.split('/')[2].split(',');
        console.log("akey: " + akey + "\nskey: " + skey + "\nscd: " + scd);
    };
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    // attempt to use phone back camera
    html5QrCode.start({ facingMode: { exact: "environment"} }, config, qrCodeSuccessCallback)
        // otherwise enumerate devices and prompt user to select
        .catch(async err => {
            // show list selection
            $("#selector").css("display", "");
            var devices = await Html5Qrcode.getCameras();
            if (devices && devices.length && devices.length > $("#select0 option").length) {
                for(var i = 0; i < devices.length; i++) {
                    $("#select0").append(`<option>${devices[i].label}</option>`);
                }
            }
            // listen & execute selection changes on list of devices
            $("#select0").on("change", "", async function() {
                if(html5QrCode.getState() == Html5QrcodeScannerState.SCANNING) {
                    // stop any running scanners
                    await html5QrCode.stop();
                }
                for(var i = 0; i < devices.length; i++) {
                    if(devices[i].label == $("#select0").val()) {
                        html5QrCode.start({ deviceId: { exact: devices[i].id } }, config, qrCodeSuccessCallback);
                        break;
                    }
                }
            });
        });
}

function fill_song_modal(song)
{
    $("#song_modal").modal("show");
    var song = $(song).children("td");
    for(var i = 0; i < song.length; i++) {
        $(`#${song[i].id.split('-')[0]}-modal`).text(song[i].innerText);
    }
}

function start_search()
{
    var search_string = $("#textfield0").val();
    console.log(search_string)

    $.ajax({
        type: "POST",
        url: "http://192.168.1.15:3000/api/v1/command/search/",
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
