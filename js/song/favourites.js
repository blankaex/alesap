/*
 * +------------------------------------------------------------
 * | song/favourites.js
 * +------------------------------------------------------------
 * | song favourites management
 * +------------------------------------------------------------
 */

function sort_favourites(table_body, ...cols) {
    const rows = $(`${table_body} tr`).get();
    rows.sort((a, b) => {
        for (const col of cols) {
            const va = $(a).children("td").eq(col).text().trim().toLowerCase();
            const vb = $(b).children("td").eq(col).text().trim().toLowerCase();
            if (va < vb) return -1;
            if (va > vb) return 1;
        }
        return 0;
    });
    return rows;
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
    // sort table by artist, then title
    const sorted = sort_favourites("#favourites-table-body");
    $(sorted).appendTo($("#favourites-table-body"));
}
