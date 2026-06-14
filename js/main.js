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

        // intelligently run search on filter change
        $("#song_search_form input").on("ifChecked", function () {
            if ($("#search-field").val().trim()) {
                start_search();
            }
        });

        // ensure cursor focuses at the end of search bar
        $("#search-field").on("focus", function () {
            const end = this.value.length;
            this.setSelectionRange(end, end);
        });

        // load/generate nickname
        set_nickname(true);

        // restore confirm-stop setting
        if (localStorage.getItem('confirm_stop') === 'true') {
            $('input[name="confirm-stop"]').iCheck('check');
        } else {
            $('input[name="confirm-stop"]').iCheck('uncheck');
        }

        // save confirm-stop setting on toggle
        $('input[name="confirm-stop"]').on('ifChecked ifUnchecked', function () {
            localStorage.setItem('confirm_stop', $(this).prop('checked'));
        });

        // show/hide dev tools
        $("#developer-tools").toggle($('input[name="developer-mode"]').prop('checked'));

        // add listeners for dev tools checkbox
        $('input[name="developer-mode"]').on('ifChecked ifUnchecked', function () {
            $("#developer-tools").toggle($('input[name="developer-mode"]').prop('checked'));
        });
        $('input[name="developer-mode"]').on('ifUnchecked', function () {
            if (DEBUG_TOAST) { DEBUG_TOAST.hideToast(); }
            sessionStorage.removeItem("debug_mode");
        });

        // manage language selection
        $("#language-selector").val(
            Object.keys(LANGUAGE_ROUTES).find(
                key => LANGUAGE_ROUTES[key] === location.pathname
            ) || "English"
        );
        $("#language-selector").on("change", function () {
            const path = location.pathname;
            const target = LANGUAGE_ROUTES[$(this).val()];
            if (target && path !== target) {
                location.href = target;
            }
        });

        // checks if session is already active
        update_status();
        if (!session_is_active()) {
            show_connection_toast();
        }

        // clears forms on reload
        $(document).ready(function() {
            // TODO: update these when IDs with hypens can be set in weaver
            $("#song_search_form")[0].reset();
            $("#queue_code_form")[0].reset();
        });

        // ensures debug mode doesn't persist on reload
        window.addEventListener("beforeunload", () => {
            sessionStorage.removeItem("debug_mode");
        });
    });
}
