/*
 * +------------------------------------------------------------
 * | session.js
 * +------------------------------------------------------------
 * | handles creating and managing sessions
 * +------------------------------------------------------------
 */

// initialize globals
let reader = null;
let toast_id = null;

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
    if (reader && reader.getState() == Html5QrcodeScannerState.SCANNING) {
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
    try {
        // rudimentary error checking
        if (/rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/.test(decodedText)) {
            await stop_scanning();
            $('#scan_qr').modal('hide');
            let keys = decodedText.split(',');
            sessionStorage.setItem('akey', keys[0]);
            sessionStorage.setItem('skey', keys[1]);
            sessionStorage.setItem('scd', keys[2]);
            sessionStorage.setItem('connected_at', new Date().toLocaleString('ja-JP'));
            update_status("connected");
        } else {
            throw new Error("Invalid QR Code");
        }
    } catch (error) {
        if (toast_id) return;
        Toastify({
            text: `Invalid QR Code`,
            duration: 3000,
            position: "center",
            style: {
                background: "#ed5565",
            }
        }).showToast();
        toast_id = setTimeout(() => { toast_id = null; }, 3000);
    }
}

function update_status(status)
{
    if (status == "connected" && session_is_active()) {
        $('.widget').removeClass('red-bg');
        $('.widget').addClass('navy-bg');
        $('#connected').text("Connected at " + sessionStorage.getItem('connected_at'));
        $('#keys').empty();
        if(sessionStorage.getItem('debug_mode')) {
            $('#keys').append(`<br/>akey: ${sessionStorage.getItem('akey')}`);
            $('#keys').append(`<br/>skey: ${sessionStorage.getItem('skey')}`);
            $('#keys').append(`<br/>scd: ${sessionStorage.getItem('scd')}`);
        }
        $('#leave-room').css("display", "block");
    } else if (status == "disconnected" && session_is_active()) {
        sessionStorage.clear();
        $('.widget').removeClass('navy-bg');
        $('.widget').addClass('red-bg');
        $('#connected').text("Not Connected");
        $('#keys').empty();
        $('#leave-room').css("display", "none");
    }
}

function session_is_active()
{
    const a_key_set = sessionStorage.getItem('akey') !== null;
    const s_key_set = sessionStorage.getItem('skey') !== null;
    const scd_set = sessionStorage.getItem('scd') !== null;
    return a_key_set && s_key_set && scd_set;
}
