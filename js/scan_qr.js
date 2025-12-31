// initialize globals
let akey = '';
let skey = '';
let scd  = '';
let reader = null;
let connected = false;

function scan_qr()
{
    if (!reader) reader = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    reader
        // attempt to use phone back camera
        .start({ facingMode: { exact: "environment"} }, config, scan_success)
        // otherwise enumerate devices and prompt user to select
        .catch(async err => {
            // show list selection
            $("#selector").css("display", "");
            var devices = await Html5Qrcode.getCameras();
            if (devices?.length > $("#select0 option").length) {
                for (const { label } of devices) $("#select0").append(`<option>${label}</option>`);
            }
            // set active device, then listen for changes
            await set_device(devices, config, scan_success);
            $("#select0").on("change", "", async function() {
                await set_device(devices, config, scan_success);
            });
        });
    // stop scanners if modal is closed
    $("#scan_qr").on("hidden.bs.modal", async function() {
        await stop_scanning();
    });
}

async function stop_scanning()
{
    if(reader && reader.getState() == Html5QrcodeScannerState.SCANNING) {
        await reader.stop();
    }
}

async function set_device(devices, config, scan_success)
{
    // stop any running scanners
    await stop_scanning();
    // find matching camera device
    const dev = devices.find(x => x.label === $("#select0").val());
    // run new scanner with selected camera device
    if (dev) await reader.start({ deviceId: { exact: dev.id } }, config, scan_success);
}

async function scan_success(decodedText, decodedResult)
{
    await stop_scanning();
    $('#scan_qr').modal('hide');
    // rudimentary error checking
    if(!/rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/.test(decodedText)) throw new Error("Invalid QR Code");
    [akey, skey, scd] = decodedText.split('/')[2].split(',');
    update_status();
    console.log("akey: " + akey + "\nskey: " + skey + "\nscd: " + scd);
}

function update_status()
{
    $('.widget').removeClass('red-bg');
    $('.widget').addClass('navy-bg');
    $('#connected').text("Connected");
    $('#keys').html(`<br/>akey: ${akey}<br/>skey: ${skey}<br/>scd: ${scd}`, akey, skey, scd);
}
