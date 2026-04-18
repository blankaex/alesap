/*
 * +------------------------------------------------------------
 * | main.js
 * +------------------------------------------------------------
 * | application entry point; sets up event listeners and
 * | initialises page state on load
 * +------------------------------------------------------------
 */

// loads elements on page start
function startup() {
    // load i18n strings first, then initialise everything else
    load_strings().then(() => {
        // apply translations to all data-i18n-marked elements
        apply_translations();

        // add listeners to search bar
        $(window).keydown(function(event) {
            if (event.keyCode == 13) {
                start_search();
                event.preventDefault();
                return false;
            }
        });

        // add listeners to populate tabs
        // use data-i18n-original (set by apply_translations) for stable selection
        $("li a[data-i18n-original='History']").on("click", function() {
            fill_song_history();
        });
        $("li a[data-i18n-original='Favourites']").on("click", function() {
            fill_favourites();
        });

        // load various settings options
        set_nickname(true);
        $("#developer-tools").toggle($('input[name="developer-mode"]').prop('checked'));
        $('input[name="developer-mode"]').on('ifChecked ifUnchecked', function () {
            $("#developer-tools").toggle($('input[name="developer-mode"]').prop('checked'));
        });
        $('input[name="developer-mode"]').on('ifUnchecked', function () {
            if (DEBUG_TOAST) { DEBUG_TOAST.hideToast(); }
            sessionStorage.removeItem("debug_mode");
        });

        // japanese mode: restore from localStorage and listen for changes
        const japanese_mode = localStorage.getItem("language") === "ja";
        $('input[name="japanese-mode"]').prop('checked', japanese_mode);
        $('input[name="japanese-mode"]').on('ifChecked', function () {
            localStorage.setItem("language", "ja");
            apply_translations();
        });
        $('input[name="japanese-mode"]').on('ifUnchecked', function () {
            localStorage.setItem("language", "en");
            apply_translations();
        });

        // checks if session is already active
        update_status(session_is_active());
        if (!session_is_active()) {
            show_connection_toast();
        }

        // clears forms on reload
        $(document).ready(function() {
            // TODO: update these if IDs can be set in weaver
            $("#song_search_form")[0].reset();
            $("#queue_code_form")[0].reset();
        });

        // disables debug mode on reload
        window.addEventListener("beforeunload", () => {
            sessionStorage.removeItem("debug_mode");
        });
    });
}
