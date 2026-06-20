/*
 * +------------------------------------------------------------
 * | song/favourites.js
 * +------------------------------------------------------------
 * | song favourites management
 * +------------------------------------------------------------
 */

function add_favourite(song_code) {
    let favourites = JSON.parse(localStorage.getItem("favourites")) || {};
    // update ui to indicate favourite status
    $("#favourite-button")
        .toggleClass("btn-default", favourites[song_code])
        .toggleClass("btn-danger", !favourites[song_code]);
    // add/remove from favourites based on current favourite status
    favourites[song_code] = !favourites[song_code];
    // clean & sort favourites list
    favourites = clean_favourites(favourites);
    favourites = sort_favourites(favourites);
    // update localstorage & refresh UI if necessary
    localStorage.setItem("favourites", JSON.stringify(favourites));
    if ($('a[href="#tab2"]').parent().hasClass('active')) {
        fill_favourites($("#favourites-filter-field").val());
    }
}

// remove items that have been un-favourited
function clean_favourites(favourites) {
    for (const key in favourites) {
        if (favourites[key] === false) {
            delete favourites[key];
        }
    }
    return favourites;
}

// sort favourites based on artist first, then by title
function sort_favourites(favourites) {
    return Object.fromEntries(
        Object.entries(favourites).sort(([keyA], [keyB]) => {
            const artistA = song_cache_get(keyA, "artist") || "";
            const artistB = song_cache_get(keyB, "artist") || "";
            const artistCompare = artistA.localeCompare(artistB);
            if (artistCompare !== 0) {
                return artistCompare;
            } else {
                const songA = song_cache_get(keyA, "song") || "";
                const songB = song_cache_get(keyB, "song") || "";
                return songA.localeCompare(songB);
            }
        })
    );
}

// reads favourites from localStorage and renders it into the favourites table
function fill_favourites(filter) {
    const favourites = JSON.parse(localStorage.getItem("favourites"));
    if (favourites) {
        const song_cache = load_song_cache();
        $("#favourites-controls").show();
        $("#empty-favourites").hide();
        $("#favourites").show();
        let rows = Object.keys(favourites)
            .filter(code => favourites[code])
            .filter(code => song_filter(code, filter))
            .map(code => {
                const row = build_song_row(song_cache, code);
                return row ? row.prop("outerHTML") : null;
            }).filter(Boolean).join("");
        $("#favourites-table-body").html(rows);
    } else {
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
            // append favourites
            const old_favourites = JSON.parse(
                localStorage.getItem("favourites") || "{}"
            );
            localStorage.setItem(
                "favourites",
                JSON.stringify(
                    sort_favourites({
                        ...old_favourites,
                        ...data.favourites
                    })
                )
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
