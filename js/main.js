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
    $("#search-field").on("change", "", function() {
        start_search();
    });

    // checks if session is already active
    if (session_is_active()) {
        update_status("connected");
    }

    // add listener to populate song history
    $('li a:contains("History")').on('click', function() {
        fill_song_history();
    });

    // clears forms on reload
    $(document).ready(function() {
        $('#form0')[0].reset(); // TODO: manually set this wform's ID in weaver
        $('#form1')[0].reset(); // TODO: manually set this wform's ID in weaver
    });

    // disables debug mode on reload
    window.addEventListener('beforeunload', () => {
        sessionStorage.removeItem('debug_mode');
    });
}
