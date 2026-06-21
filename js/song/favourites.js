/*
 * +------------------------------------------------------------
 * | song/favourites.js
 * +------------------------------------------------------------
 * | song favourites management
 * +------------------------------------------------------------
 */

function toggle_favourite(song_code) {
    let favourites = new Set(JSON.parse(localStorage.getItem("favourites")) || []);
    // update ui to indicate favourite status
    const is_favourite = favourites.has(song_code);
    $("#favourite-button")
        .toggleClass("btn-default", is_favourite)
        .toggleClass("btn-danger", !is_favourite);
    // add/remove from favourites based on current favourite status
    is_favourite ? favourites.delete(song_code) : favourites.add(song_code);
    // sort & update localstorage
    const sorted = sort_favourites(favourites);
    localStorage.setItem("favourites", JSON.stringify(sorted));
    if ($('a[href="#tab2"]').parent().hasClass('active')) {
        fill_favourites($("#favourites-filter-field").val());
    }
}

// sort favourites based on artist first, then by title
function sort_favourites(favourites) {
    return [...favourites].sort((codeA, codeB) => {
        const artistA = song_cache_get(codeA, "artist") || "";
        const artistB = song_cache_get(codeB, "artist") || "";
        const artistCompare = artistA.localeCompare(artistB);
        if (artistCompare !== 0) {
            return artistCompare;
        } else {
            const songA = song_cache_get(codeA, "song") || "";
            const songB = song_cache_get(codeB, "song") || "";
            return songA.localeCompare(songB);
        }
    });
}

// reads favourites from localStorage and renders it into the favourites table
function fill_favourites(filter) {
    const favourites = JSON.parse(localStorage.getItem("favourites"));
    if (favourites) {
        const song_cache = load_song_cache();
        const total = favourites.length;
        const filtered_codes = favourites.filter(code => song_filter(code, filter));
        const visible = filtered_codes.length;
        $("#favourites-controls h4").text(i18n("song_filter_heading").replace("{count}", `(${visible}/${total})`));
        $("#favourites-controls").show();
        $("#empty-favourites").hide();
        $("#favourites").show();
        let rows = filtered_codes
            .map(code => {
                const row = build_song_row(song_cache, code);
                return row ? row.prop("outerHTML") : null;
            }).filter(Boolean).join("");
        $("#favourites-table-body").html(rows);
    } else {
        $("#favourites-controls h4").text(i18n("song_filter_heading").replace("{count}", "(0/0)"));
        $("#favourites-controls").hide();
        $("#favourites").hide();
        $("#empty-favourites").show();
    }
}

function import_favourites() {
    show_confirm().then(function() {
        $.ajax({
            type: "GET",
            url: API_URL + "/api/v1/command/import_favourites/",
            data: {
                nickname: localStorage.getItem("nickname")
            }
        }).then(function(data) {
            // add "new" songs to local song cache
            data.cache.forEach(result => {
                song_cache_set(result.code, result);
            });
            // merge favourites
            const favourites = new Set(
                JSON.parse(localStorage.getItem("favourites")) || []
            );
            // +------------------------------------------------------
            // | TODO: remove once endpoint always returns an array
            // | (old format was {code: true, ...})
            // +------------------------------------------------------
            const new_favourites = Array.isArray(data.favourites)
                ? data.favourites
                : Object.keys(data.favourites);
            new_favourites.forEach(code => favourites.add(code));
            localStorage.setItem(
                "favourites",
                JSON.stringify(sort_favourites(favourites))
            );
            // send ui confirmation message
            toast(i18n("imported_favourites"), "toast-green");
        }).fail(function() {
            toast(i18n("import_failed"), "toast-red");
        });
    });
}

function export_favourites() {
    show_confirm().then(function() {
        $.ajax({
            type: "POST",
            url: API_URL + "/api/v1/command/export_favourites/",
            data: JSON.stringify({
                nickname: localStorage.getItem("nickname"),
                data: JSON.parse(localStorage.getItem("favourites"))
            }),
            contentType: "application/json; charset=utf-8"
        }).then(function() {
            toast(i18n("exported_favourites"), "toast-green");
        }).fail(function() {
            toast(i18n("export_failed"), "toast-red");
        });
    });
}

function clear_favourites() {
    show_confirm().then(function() {
        localStorage.removeItem("favourites");
        toast(i18n("toast_favourites_cleared"), "toast-green");
    });
}
