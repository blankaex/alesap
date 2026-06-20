/*
 * +------------------------------------------------------------
 * | song/modal.js
 * +------------------------------------------------------------
 * | song modal handling
 * +------------------------------------------------------------
 */

// builds the list of modal body elements for a given song
function build_song_modal_data(song_code) {
    const song_cache = load_song_cache();
    const song_count = JSON.parse(localStorage.getItem("song_count")) ?? {};
    const song_info = [
        { key: "field_title",      id: "title",      value: song_cache[song_code].song },
        { key: "field_artist",     id: "artist",     value: song_cache[song_code].artist },
        { key: "field_genre",      id: "genre",      value: song_cache[song_code].extra.genre_name },
        { key: "field_info",       id: "info",       value: song_cache[song_code].extra.information ??
                                                                 song_cache[song_code].extra.program_name ??
                                                                 song_cache[song_code].extra.tie_up },
        { key: "field_lyrics",     id: "lyrics",     value: song_cache[song_code].extra?.introcha ?
                                                                 `${song_cache[song_code].extra.introcha}…` : null },
        { key: "field_play_count", id: "play-count", value: song_count[song_code] },
        { key: "field_code",       id: "code",       value: song_cache[song_code].code }
    ];
    let modal_data = [];
    song_info.forEach(({ key, id, value }) => {
        if (value) {
            modal_data.push($("<h4>").text(`${i18n(key)}:`));
            const tag = $("<p>").attr("id", `current-song-${id}`);
            modal_data.push(tag.text(value));
        }
    });
    if (sessionStorage.getItem("debug_mode")) {
        modal_data.push($("<hr>"), $("<h4>").text(i18n("debugging_info_heading")));
        const debug_info = $("<pre>").text(JSON.stringify(song_cache[song_code], null, 2));
        $("<button>").addClass("copy-btn").append(
            $("<i>").addClass("fa fa-copy")
        ).prependTo(debug_info);
        modal_data.push(debug_info);
    }
    return modal_data;
}

// shows the song detail modal and populates it with data for the selected song
function fill_song_modal(song) {
    // show song modal
    $("#song-modal").modal("show");
    // get song code of active selection
    const song_code = $(song).attr("id");
    // set modal title
    $("#song-modal-title").text(normalize_song(song_code));
    // set modal body
    $("#song-modal-body").html(build_song_modal_data(song_code));
    // wire copy button for debug pre
    $("#song-modal-body").off("click", ".copy-btn").on("click", ".copy-btn", function () {
        const text = $(this).parent("pre").text().trim();
        navigator.clipboard.writeText(text).then(() => {
            toast(i18n("toast_copied"), "toast-green");
        });
    });

    // update ui based on favourite status
    const favourites = JSON.parse(localStorage.getItem("favourites")) || {};
    $("#favourite-button")
        .toggleClass("btn-danger", favourites[song_code])
        .toggleClass("btn-default", !favourites[song_code]);
}
