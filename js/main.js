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
        // handle browser back & mobile back button
        history.pushState(null, null, location.href);
        $(window).on('popstate', function(event) {
            history.pushState(null, null, location.href);
            back_handler();
        });

        // add listeners to search bar
        $(window).keydown(function(event) {
            if (event.keyCode == 13) {
                start_search();
                event.preventDefault();
                return false;
            }
        });

        // add listeners to populate tabs
        // TODO: use ids when weaver supports
        $("a[href='#tab1']").on("click", function () {
            fill_song_history();
        });
        $("a[href='#tab2']").on("click", function () {
            fill_favourites();
        });
        $("#song_search_form input").on("ifChecked", function () {
            if ($("#search-field").val().trim()) {
                start_search();
            }
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
