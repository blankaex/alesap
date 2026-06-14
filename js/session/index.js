/*
 * +------------------------------------------------------------
 * | session/index.js
 * +------------------------------------------------------------
 * | QR code scanning and session management
 * +------------------------------------------------------------
 */

// initialize globals
let READER = null;
let QR_ERROR_TOAST_ID = null;
const SCAN_CONFIG = {
    fps: 10,
    qrbox: {
        width: 250,
        height: 250
    }
};

// enable camera and scan qr code
function scan_qr() {
    if (!READER) READER = new Html5Qrcode("reader");
    READER
        // attempt to use phone back camera
        .start({ facingMode: { exact: "environment"} }, SCAN_CONFIG, scan_success)
        // otherwise enumerate devices and prompt user to select
        .catch(async err => {
            await enumerate_cameras();
        });
    // stop scanners if modal is closed
    $("#scan-modal").on("hidden.bs.modal", async function() {
        await stop_scanning();
    });
}

// disable cameras and stop qr code reader
async function stop_scanning() {
    if (READER && READER.getState() === Html5QrcodeScannerState.SCANNING) {
        await READER.stop();
    }
}

// populates camera selector and sets up fallback camera when default fails
async function enumerate_cameras() {
    // show list selection
    $("#selector-container").show();
    const devices = await Html5Qrcode.getCameras();
    if (devices?.length > $("#camera-selector option").length) {
        for (const { label } of devices) $("#camera-selector").append(`<option>${label}</option>`);
    }
    // set active device, then listen for changes
    await set_device(devices);
    $("#camera-selector").on("change", "", async function() {
        await set_device(devices);
    });
}

// set which camera device should be used for scanning
async function set_device(devices) {
    // stop any running scanners
    await stop_scanning();
    // find matching camera device
    const dev = devices.find(x => x.label === $("#camera-selector").val());
    // run new scanner with selected camera device
    if (dev) await READER.start({ deviceId: { exact: dev.id } }, SCAN_CONFIG, scan_success);
}

// validates QR code format and returns the parsed key segments
function parse_qr_data(decoded_text) {
    // rudimentary error checking
    if (!/rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/.test(decoded_text)) {
        throw new Error("Invalid QR Code");
    }
    return decoded_text.split(",");
}

// stores session keys and connection timestamp into sessionStorage
function store_session_keys(keys) {
    sessionStorage.setItem("akey", keys[0]);
    sessionStorage.setItem("skey", keys[1]);
    sessionStorage.setItem("scd", keys[2]);
    sessionStorage.setItem("connected_at", new Date().toLocaleDateString("ja-JP"));
}

// callback that runs when qr code successfully scanned
async function scan_success(decoded_text, decoded_result) {
    try {
        const keys = parse_qr_data(decoded_text);
        await stop_scanning();
        $("#scan-modal").modal("hide");
        store_session_keys(keys);
        update_status(true);
        toast(i18n("toast_connected"), "toast-green");
    } catch (error) {
        if (QR_ERROR_TOAST_ID) return;
        toast(i18n("toast_invalid_qr"), "toast-red");
        QR_ERROR_TOAST_ID = setTimeout(() => { QR_ERROR_TOAST_ID = null; }, TOAST_DURATION);
    }
}

// helper function to change & display connection status to user
function update_status(status) {
    const active = status !== false && session_is_active();

    $("#connected").text(active ?
        i18n("status_connected_on")
            .replace("{date}", sessionStorage.getItem("connected_at")) :
        i18n("status_not_connected")
    );

    $("#random-history, #random-favourite, #add-to-queue")
        .toggleClass("btn-primary", active);

    $(".stop-playback")
        .toggle(active);

    if (active) {
        CONNECTION_TOAST?.hideToast();
        STALE_TOAST?.hideToast();
    } else if (status === false && session_is_active()) {
        sessionStorage.clear();
        show_connection_toast();
    }
}

// helper function to check if session exists
function session_is_active() {
    const a_key_set = sessionStorage.getItem("akey") !== null;
    const s_key_set = sessionStorage.getItem("skey") !== null;
    const scd_set = sessionStorage.getItem("scd") !== null;
    return a_key_set && s_key_set && scd_set;
}
