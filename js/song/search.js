/*
 * +------------------------------------------------------------
 * | song/search.js
 * +------------------------------------------------------------
 * | song search and search history
 * +------------------------------------------------------------
 */

const SEARCH_RESULTS_LIMIT = 20;
const SEARCH_PAGE_LIMIT = 1000;
const SEARCH_INTERVAL = 1000;
let CURRENT_SEARCH = null;

// helper functions to manage search query history stack
function search_history_push(query) {
    let search_history = JSON.parse(sessionStorage.getItem("search_history")) ?? [];
    search_history.push(query);
    sessionStorage.setItem("search_history", JSON.stringify(search_history));
}

function search_history_pop() {
    let search_history = JSON.parse(sessionStorage.getItem("search_history")) ?? [];
    let query = search_history.pop();
    // pop another one if query is the one we just added
    if (query == $("#search-field").val()) {
        query = search_history.pop();
    }
    sessionStorage.setItem("search_history", JSON.stringify(search_history));
    return query;
}

// sends a search query to the API and renders results into the song table
function start_search(page = 0, push = true) {
    // update ui to give feedback that search is starting
    if (page === 0) {
        if (CURRENT_SEARCH) {
            CURRENT_SEARCH.abort();
        }
        $("#database").hide();
        $("#empty-search").hide();
        $("#song-table-body").empty();
        $("#song-table").show();
        $("#loader-div").css("display", "flex");
        if (push) {
            search_history_push($("#search-field").val());
        }
    }
    // call search api
    CURRENT_SEARCH = $.ajax({
        type: "POST",
        url: API_URL + "/api/v1/command/search/",
        data: JSON.stringify({
            str: $("#search-field").val(),
            constraint: $('#song_search_form input:checked').val(),
            page: page
        }),
        contentType: "application/json; charset=utf-8"
    })
    CURRENT_SEARCH.then(function(data) {
        if (data.results?.length && data.total) {
            // add search results to song cache + search table
            data.results[0].forEach(result => {
                song_cache_set(result.code, result);
                append_table("#song-table-body", result.code);
            });
            // continue searching unless no more results or max page limit reached
            const end_search =
                data.total / SEARCH_RESULTS_LIMIT > data.page + 1 ||
                data.page >= SEARCH_PAGE_LIMIT;
            if (end_search) {
                setTimeout(() => { start_search(page + 1); }, SEARCH_INTERVAL);
            } else {
                $("#loader-div").hide();
            }
        } else {
            // update ui if no search results at all
            $("#empty-search").show();
            $("#song-table").hide();
            $("#loader-div").hide();
        }
    });
}
