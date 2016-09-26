$ = jQuery;
var Indeko = Indeko || {};

/**
 * Variables and functions namespace of the search.
 */
Indeko.Morphsearch = Indeko.Morphsearch || {
        elemFulltext: $('#fulltextsearch'),
        elemType: $('.morphsearch-type'),
        elemMorph: $('.morphsearch-select'),
        elemBlock: $('#block-morphsearch-morphsearch-block'),
        buttonSearch: $('input[name=searchbutton]'),
        buttonReset: $('#morphsearch-reset')
};

/**
 * Save selected values and redirect to search results on search click.
 */
Indeko.Morphsearch.hookSearchButton = function() {
    Indeko.Morphsearch.buttonSearch.click( function() {
        // save selected search values
        var searchArray = Indeko.Morphsearch.toArray();
        localStorage["searchValues"] = JSON.stringify(searchArray);

        // redirect to search results
        var searchUrl = Indeko.Morphsearch.toUrl(searchArray);
        window.location.replace(searchUrl);
    });
};

/**
 * Reset searchblock on reset click.
 */
Indeko.Morphsearch.hookResetButton = function() {
    Indeko.Morphsearch.buttonReset.click( function() {
        Indeko.Morphsearch.reset();
        localStorage.removeItem("searchValues");
    });
};

/**
 * Resets all elements of the morphsearch block.
 * TODO: make independent from chosen
 */
Indeko.Morphsearch.reset = function() {
    this.elemFulltext.val('');
    this.elemType.val(-1).trigger("chosen:updated");
    this.elemMorph.val(-1).trigger("chosen:updated");
};

/**
 * Converts selected search items to array.
 * First element is fulltext string, followed by taxonomy IDs -> ["fulltext search","38","40"].
 * TODO: extend for type search (2nd element in searchArray?)
 *
 * @returns {Array} of all search items.
 */
Indeko.Morphsearch.toArray = function() {
    var searchArray = [];

    var inputFulltextSearch = this.elemFulltext.val();
    // replace empty fulltext search field with "*" search
    if (!inputFulltextSearch) {
        inputFulltextSearch = "*";
    }
    searchArray.push(inputFulltextSearch);

    // iterate over all select elements and save selected items
    Indeko.Morphsearch.elemMorph.each(function() {
        var tid = $(this).val();

        // if user selected an element, add it's taxonomy ID to the searchArray
        if (!$.isEmptyObject(tid)) {
            // multiselect will return an array of selected items. Add single values to the final searchArray.
            if(Array.isArray(tid)) {
                searchArray.push.apply(searchArray, tid);
            } else {
                searchArray.push(tid);
            }
        }
    });

    return searchArray;
};

/**
 * Fill search block with values from the searchArray.
 * TODO: extend for type search (2nd element in searchArray?)
 *
 * @param searchArray Array of search values ["fulltext search","38","40"].
 */
Indeko.Morphsearch.toSearchblock = function(searchArray) {
    $.each(searchArray, function(index, value) {
        // first element of data array is the fulltext search string
        if (index === 0) {
            if (value === '*') {
                Indeko.Morphsearch.elemFulltext.val('');
            } else {
                Indeko.Morphsearch.elemFulltext.val(value);
            }
        // following items are taxonomy IDs
        } else {
            Indeko.Morphsearch.elemBlock.find('option[value=' + value +']').attr('selected','selected');
        }
    });

    // make chosen adopt the changes
    Indeko.Morphsearch.elemMorph.trigger("chosen:updated");
};

/**
 * Initialize morphsearch block.
 */
Indeko.Morphsearch.init = function() {
    Indeko.Morphsearch.hookResetButton();
    Indeko.Morphsearch.hookSearchButton();

    // rebuild selected search block items if there are any values saved locally
    var localSearchJson = localStorage["searchValues"];

    if ($.isEmptyObject(localSearchJson)) {
        Indeko.Morphsearch.reset();
    } else {
        var searchArray = JSON.parse(localSearchJson);
        Indeko.Morphsearch.reset();
        Indeko.Morphsearch.toSearchblock(searchArray);
    }

};

/**
 * Converts the data array to an Apache Solr search URL.
 * ["Kompetenz", "38", "40"] -> /indeko/search/site/Kompetenz AND tid:38 AND tid:40
 * TODO: duplicate function in morphmapping.js
 *
 * @param searchArray {Array} containing all user-selected search values.
 * @return {string} Complete search URL in string format.
 */
Indeko.Morphsearch.toUrl = function(searchArray) {
    var baseSolrSearchUrl = Drupal.settings.basePath + "search/site/";
    var solrSearchQuery = "";

    $.each(searchArray, function(index, value) {
        // first element of data array is the fulltext search string
        if (index === 0) {
            solrSearchQuery += value;
        } else {
            solrSearchQuery += " AND tid:" + value
        }
    });

    var solrSearchUrl = baseSolrSearchUrl + solrSearchQuery;
    return solrSearchUrl;
};

Indeko.Morphsearch.init();












