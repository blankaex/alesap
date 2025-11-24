// initialize globals
var akey = '';
var skey = '';
var scd  = '';

function startup()
{
    $(window).keydown(function(event){
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

function scan_qr()
{
    const html5QrCode = new Html5Qrcode("reader");
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        html5QrCode.stop().then((ignore) => {
            $('#scan_qr').modal('hide');
            if(!/rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/.test(decodedText))
                throw new Error("Invalid QR Code");
            [akey, skey, scd] = decodedText.split('/')[2].split(',');
            console.log("akey: " + akey + "\nskey: " + skey + "\nscd: " + scd);
        }).catch((err) => {
            console.log(err);
            alert("Invalid QR Code");
        });
    };
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrCode.start({ facingMode: { exact: "environment"} }, config, qrCodeSuccessCallback)
        .catch(err => {
            $("#selector").css("display", "");
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length) {
                    for(var i = 0; i < devices.length; i++) {
                        $("#select0").append(`<option>${devices[i].label}</option>`);
                    }
                    $("#select0").on("change", "", function() {
                        for(var i = 0; i < devices.length; i++) {
                            if(devices[i].label == $("#select0").val()) {
                                // TODO: process changing selection
                                // need to stop device before starting again
                                // need to not re-create device list
                                html5QrCode.start({ deviceId: { exact: devices[i].id } }, config, qrCodeSuccessCallback);
                                break;
                            }
                        }
                    });
                }
            }).catch(err => {
                console.log(err);
            });
        });
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
    if (data !== null && typeof data === 'object')
    {
        data_object = data;
    }
    else
    {
        data_object = data;
    }

    var body = $("#dyn_table0_body")

    var columns = getcolumns();

    var row = $('<tr>');


    for (var index in data_object)
    {
        var row = $('<tr>');
        for (var columnIndex = 0; columnIndex < Object.keys(columns).length; columnIndex++)
        {
            var cell_data = data_object[index][ Object.keys(columns)[columnIndex] ];
            row.append( $('<td>').text( cell_data ).data("object", data_object[index]) );
        }
        console.log(row)
        body.append(row);
    }
}
