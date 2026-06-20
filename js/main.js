/*
 * +------------------------------------------------------------
 * | main.js
 * +------------------------------------------------------------
 * | application entry point; sets up event listeners and
 * | initialises page state on load
 * +------------------------------------------------------------
 */

// orchestrates all startup tasks once i18n strings are loaded
function startup() {
    load_i18n_strings().then(() => {
        init_nickname();
        init_back_navigation();
        init_search_bindings();
        init_song_modal();
        init_history_tab();
        init_favourites_tab();
        restore_confirm_stop();
        init_developer_mode();
        init_language_selector();
        init_confirm_modal();
        init_popover();
        check_session();
        init_form_reset();
        init_beforeunload_cleanup();
        maybe_show_easter_egg();
    });
}

// loads or generates a persistent nickname for this device
function init_nickname() {
    set_nickname(true);
}

// intercepts browser back to redirect through app back_handler
function init_back_navigation() {
    history.pushState(null, null, location.href);
    $(window).on('popstate', function(event) {
        history.pushState(null, null, location.href);
        back_handler();
    });
}

// wires up search input: Enter key, filter changes, and focus behaviour
function init_search_bindings() {
    $(window).keydown(function(event) {
        if (event.keyCode == 13) {
            start_search();
            event.preventDefault();
            return false;
        }
    });

    // TODO: use ids when weaver supports
    $("#song_search_form input").on("ifChecked", function () {
        if ($("#search-field").val().trim()) {
            start_search();
        }
    });

    $("#search-field").on("focus", function () {
        const end = this.value.length;
        this.setSelectionRange(end, end);
    });
}

function init_song_modal() {
    $("#song-modal-body").on("click", "p", function () {
        navigator.clipboard.writeText($(this).text().trim()).then(() => {
            toast(i18n("toast_copied"), "toast-green");
        });
    });
}

// wires up history tab: click to render, filter input to re-render
function init_history_tab() {
    $("a[href='#tab1']").on("click", function () {
        fill_song_history();
    });
    $("#history-filter-field").on("input", function () {
        fill_song_history($(this).val());
    });
}

// wires up favourites tab: click to render, filter input to re-render
function init_favourites_tab() {
    $("a[href='#tab2']").on("click", function () {
        fill_favourites();
    });
    $("#favourites-filter-field").on("input", function () {
        fill_favourites($(this).val());
    });
}

// restores confirm-stop checkbox state and persists changes
function restore_confirm_stop() {
    if (localStorage.getItem('confirm_stop') === 'true') {
        $('input[name="confirm-stop"]').iCheck('check');
    } else {
        $('input[name="confirm-stop"]').iCheck('uncheck');
    }

    $('input[name="confirm-stop"]').on('ifChecked ifUnchecked', function () {
        localStorage.setItem('confirm_stop', $(this).prop('checked'));
    });
}

// shows/hides dev tools panel and manages its toggle + cleanup
function init_developer_mode() {
    $("#developer-tools").toggle($('input[name="developer-mode"]').prop('checked'));

    $('input[name="developer-mode"]').on('ifChecked ifUnchecked', function () {
        $("#developer-tools").toggle($('input[name="developer-mode"]').prop('checked'));
    });
    $('input[name="developer-mode"]').on('ifUnchecked', function () {
        if (DEBUG_TOAST) { DEBUG_TOAST.hideToast(); }
        sessionStorage.removeItem("debug_mode");
    });

    $(document).on("click", ".copy-btn", function () {
        const text = $(this).parent("pre").text().trim();
        navigator.clipboard.writeText(text).then(() => {
            toast(i18n("toast_copied"), "toast-green");
        });
    });
}

// sets current language in the selector and navigates on change
function init_language_selector() {
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
}

// initialises the floating menu popover, backdrop, and outside-click dismiss
function init_popover() {
    $('#popover-button').popover({
        html: true,
        placement: 'bottom',
        content: $('#popover-content').html(),
        trigger: 'manual'
    });

    let backdrop = $('<div id="popover-backdrop"></div>').appendTo('body');
    $('#popover-button').on('shown.bs.popover', function() { backdrop.addClass('visible'); });
    $('#popover-button').on('hidden.bs.popover', function() { backdrop.removeClass('visible'); });

    document.addEventListener('click', function(e) {
        let $btn = $('#popover-button');
        let popover = $btn.data('bs.popover');
        if (popover && popover.$tip && popover.$tip.is(':visible') && !$btn.is(e.target) && $btn.has(e.target).length === 0 && popover.$tip.has(e.target).length === 0) {
            $btn.popover('hide');
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);
}

// checks connection status and shows connection or stale-session toast
function check_session() {
    update_status();
    if (!session_is_active()) {
        show_connection_toast();
    } else {
        const connectedAt = sessionStorage.getItem("connected_date");
        const today = new Date().toLocaleDateString("ja-JP");
        if (connectedAt && connectedAt !== today) {
            show_stale_toast();
        }
    }
}

// clears search and queue forms once the DOM is ready i.e. when refreshing
function init_form_reset() {
    // TODO: update these when IDs with hypens can be set in weaver
    $(document).ready(function() {
        $("#song_search_form")[0].reset();
        $("#queue_code_form")[0].reset();
    });
}

// ensures debug mode doesn't persist across page reloads
function init_beforeunload_cleanup() {
    window.addEventListener("beforeunload", () => {
        sessionStorage.removeItem("debug_mode");
    });
}

// randomly reveals a hidden easter egg (10% chance)
function maybe_show_easter_egg() {
    if (Math.random() < 0.1) {
        $("#easter-egg").show();
    }
}

// binds the confirm button once on page load
function init_confirm_modal() {
    $('#confirm-ok-btn').on('click', function() {
        $('#confirm-modal').modal('hide');
        if (CONFIRM_RESOLVE) {
            CONFIRM_RESOLVE();
            CONFIRM_RESOLVE = null;
        }
    });
    $('#confirm-modal').on('hidden.bs.modal', function() {
        CONFIRM_RESOLVE = null;
    });
}
