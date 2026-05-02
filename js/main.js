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
    // add listeners to search bar
    $(window).keydown(function(event) {
        if (event.keyCode == 13) {
            start_search();
            event.preventDefault();
            return false;
        }
    });

    // handle browser back & mobile back button
    history.pushState(null, null, location.href);
    $(window).on('popstate', function(event) {
        history.pushState(null, null, location.href);
        back_handler();
    });

    // add listeners to tabs
    $("li a:contains('History')").on("click", function() {
        fill_song_history();
    });
    $("li a:contains('Favourites')").on("click", function() {
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
}
