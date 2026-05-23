/*
 * +------------------------------------------------------------
 * | song/favourites.js
 * +------------------------------------------------------------
 * | song favourites management
 * +------------------------------------------------------------
 */

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
            const artistA = song_cache_get(keyA, "artist");
            const artistB = song_cache_get(keyB, "artist");
            const artistCompare = artistA.localeCompare(artistB);
            if (artistCompare !== 0) {
                return artistCompare;
            } else {
                const songA = song_cache_get(keyA, "song");
                const songB = song_cache_get(keyB, "song");
                return songA.localeCompare(songB);
            }
        })
    );
}

// reads favourites from localStorage and renders it into the favourites table
function fill_favourites() {
    const favourites = JSON.parse(localStorage.getItem("favourites"));
    if (favourites) {
        $("#empty-favourites").hide();
        $("#favourites").show();
        $("#favourites-table-body").empty();
        Object.keys(favourites).forEach(song_code => {
            if (favourites[song_code]) {
                append_table("#favourites-table-body", song_code);
            }
        });
    }
}
