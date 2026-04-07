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

// enable camera and scan qr code
function scan_qr() {
    if (!reader) reader = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    reader
        // attempt to use phone back camera
        .start({ facingMode: { exact: "environment"} }, config, scan_success)
        // otherwise enumerate devices and prompt user to select
        .catch(async err => {
            // show list selection
            $("#selector-container").css("display", "");
            const devices = await Html5Qrcode.getCameras();
            if (devices?.length > $("#camera-selector option").length) {
                for (const { label } of devices) $("#camera-selector").append(`<option>${label}</option>`);
            }
            // set active device, then listen for changes
            await set_device(devices, config, scan_success);
            $("#camera-selector").on("change", "", async function() {
                await set_device(devices, config, scan_success);
            });
        });
    // stop scanners if modal is closed
    $("#scan-modal").on("hidden.bs.modal", async function() {
        await stop_scanning();
    });
}

// disable cameras and stop qr code reader
async function stop_scanning() {
    if (reader && reader.getState() == Html5QrcodeScannerState.SCANNING) {
        await reader.stop();
    }
}

// set which camera device should be used for scanning
async function set_device(devices, config, scan_success) {
    // stop any running scanners
    await stop_scanning();
    // find matching camera device
    const dev = devices.find(x => x.label === $("#camera-selector").val());
    // run new scanner with selected camera device
    if (dev) await reader.start({ deviceId: { exact: dev.id } }, config, scan_success);
}

// callback that runs when qr code successfully scanned
async function scan_success(decoded_text, decoded_result) {
    try {
        // rudimentary error checking
        if (/rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/.test(decoded_text)) {
            await stop_scanning();
            $('#scan-modal').modal('hide');
            const keys = decoded_text.split(',');
            sessionStorage.setItem('akey', keys[0]);
            sessionStorage.setItem('skey', keys[1]);
            sessionStorage.setItem('scd', keys[2]);
            sessionStorage.setItem('connected_at', new Date().toLocaleDateString('ja-JP'));
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

// helper function to change & display connection status to user
function update_status(status) {
    if (status == "connected" && session_is_active()) {
        $($('#info-widget').children()[0]).removeClass('red-bg');
        $($('#info-widget').children()[0]).addClass('navy-bg');
        $('#connected').text("Connected on " + sessionStorage.getItem('connected_at'));
        $('#leave-room').css("display", "block");
    } else if (status == "disconnected" && session_is_active()) {
        sessionStorage.clear();
        $($('#info-widget').children()[0]).removeClass('navy-bg');
        $($('#info-widget').children()[0]).addClass('red-bg');
        $('#connected').text("Not Connected");
        $('#leave-room').css("display", "none");
    }
}

// helper function to check if session exists
function session_is_active() {
    const a_key_set = sessionStorage.getItem('akey') !== null;
    const s_key_set = sessionStorage.getItem('skey') !== null;
    const scd_set = sessionStorage.getItem('scd') !== null;
    return a_key_set && s_key_set && scd_set;
}
