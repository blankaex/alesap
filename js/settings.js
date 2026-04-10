/*
 * +------------------------------------------------------------
 * | settings.js
 * +------------------------------------------------------------
 * | functionality related to settings tab
 * +------------------------------------------------------------
 */

// set user nickname
async function set_nickname() {
    if (!$("#nickname-field").val()) {
        // TODO: remove network call
        const [adjRes, nounRes] = await Promise.all([
            fetch('https://api.datamuse.com/words?rel_jjb=thing&max=1000'),
            fetch('https://api.datamuse.com/words?rel_jja=blue&max=1000')
        ]);
        const adjs = await adjRes.json();
        const nouns = await nounRes.json();
        const a = adjs[Math.floor(Math.random() * adjs.length)].word;
        const n = nouns[Math.floor(Math.random() * nouns.length)].word;
        $("#nickname-field").val(`${a}${n}`);
    }
    localStorage.setItem("nickname", $("#nickname-field").val());
    Toastify({
        text: "Nickname saved",
        duration: 3000,
        position: "center",
        className: "toast-green",
    }).showToast();
}

// toggles debugging mode on/off and updates the debug widget visibility
function toggle_debug() {
    // turn on debug mode
    if (sessionStorage.getItem("debug_mode") == null) {
        sessionStorage.setItem("debug_mode", true);
        show_debug_toast();
        $("#debug-div").css("display", "block");
        $("#session-storage").text(JSON.stringify(sessionStorage, null, 2));
        $("#local-storage").text(parse_local_storage());
        $("#device-info").text(parse_device_info());
    // turn off debug mode
    } else {
        if (DEBUG_TOAST) {
            DEBUG_TOAST.hideToast();
        }
        sessionStorage.removeItem("debug_mode");
        $("#debug-widget").css("display", "none");
        $("#debug-div").css("display", "none");
        // no need to empty debug info as it's overwritten on next run
    }
}
