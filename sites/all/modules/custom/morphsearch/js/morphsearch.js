$ = jQuery;
var Indeko = Indeko || {};

/**
 * Variables and functions namespace of the search.
 */
Indeko.Morphsearch = Indeko.Morphsearch || {
        elemFulltext: $('#fulltextsearch'),                     // fulltext search element
        elemFulltextInfo: $('#fulltextsearchinfo'),             // fulltext search info element
        elemSearchSyntax: $('#searchSyntax'),                   // element with search syntax representaion
        elemType: $('.morphsearch-type'),                       // type search element
        elemMorph: $('.morphsearch-select'),                    // all morphological box select elements
        elemMorphBlock: $('#morphsearch-select-block'),         // element containing all morphological box select elements
        elemBlock: $('#block-morphsearch-morphsearch-block'),   // whole search block
        buttonSearch: $('#searchbutton'),                       // search button
        buttonReset: $('#morphsearch-reset'),                   // reset button
        buttonMorphbox: $('#morphsearch-select-block-toggle'),  // "button" to toggle morphological box search
        buttonSave: $('#morphsearch-save')                      // link to save the selected search values
};

/**
 * Save selected values and redirect to search results on search click.
 */
Indeko.Morphsearch.hookSearchButton = function() {
    Indeko.Morphsearch.buttonSearch.click( function() {
        Indeko.Morphsearch.doSearch();
    });
};

/**
 * Execute search. Save selected values and redirect to search results.
 */
Indeko.Morphsearch.doSearch = function() {
    // save selected search values
    var searchArray = Indeko.Morphsearch.toArray();
    localStorage["searchValues"] = JSON.stringify(searchArray);

    // redirect to search results
    var searchUrl = Indeko.Morphsearch.toUrl(searchArray);
    window.location.replace(searchUrl);
};

/**
 * Execute Search on keypress "ENTER"
 */
Indeko.Morphsearch.hookFulltextInput = function() {
    this.elemFulltext.keypress(function (e) {
        if (e.keyCode == 13) {
            Indeko.Morphsearch.doSearch();
        }
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
 * Save the selected search values.
 */
Indeko.Morphsearch.hookSaveButton = function() {
    Indeko.Morphsearch.buttonSave.click(function () {
        var searchArray = Indeko.Morphsearch.toArray();
        var search = JSON.stringify(searchArray);

        // AJAX POST request to send data to Drupal
        $.ajax({
            url: Drupal.settings.basePath + 'user/savesearch/ajax',   // in module defined URL to process the request
            type: "POST",
            data: {
                saveData: search,                               // array with all search values
                saveUrl: Indeko.Morphsearch.toUrl(searchArray)  // full search string
            },

            dataType: "json",
            success: function (data, textStatus, jqXHR) {
                console.log(data.success);
                console.log(data.message);
                alert(data.message); // TODO
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
    });
};

/**
 * Toggles visibility of morphological search on click.
 */
Indeko.Morphsearch.hookMorphologicalSearchToggle = function() {
    this.buttonMorphbox.click( function() {
        Indeko.Morphsearch.elemMorphBlock.toggle();
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

    // display morphological box, if morphological box elements were selected
    if(searchArray.length > 1) {
        Indeko.Morphsearch.elemMorphBlock.show();
    }

    // make chosen adopt the changes
    Indeko.Morphsearch.elemMorph.trigger("chosen:updated");
};

/**
 * Initialize morphsearch block.
 */
Indeko.Morphsearch.init = function() {
    // transform select to chosen boxes
    Indeko.Morphsearch.elemMorph.chosen({
        inherit_select_classes: true,
        allow_single_deselect: true,
        width:"100%"
    });
    Indeko.Morphsearch.elemType.chosen({
        inherit_select_classes: true,
        allow_single_deselect: true,
        width:"100%"
    });

    Indeko.Morphsearch.hookResetButton();
    Indeko.Morphsearch.hookSearchButton();
    Indeko.Morphsearch.hookFulltextInput();
    Indeko.Morphsearch.hookMorphologicalSearchToggle();
    Indeko.Morphsearch.hookSaveButton();
    Indeko.Morphsearch.addSearchInfo();


    // rebuild selected search block items if there are any values saved locally
    var localSearchJson = localStorage["searchValues"];

    // load selected search values
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

/**
 * Adds tooltip with information about the search syntax to the search info element.
 */
Indeko.Morphsearch.addSearchInfo = function() {
    // TODO fallback option if no qtip2?
    Indeko.Morphsearch.elemFulltextInfo.qtip({
        content: {
            // use hidden element (created in morphsearch.module -> createMorphsearchContent) as tooltip
            text: Indeko.Morphsearch.elemSearchSyntax,
            title:{ text: "Such-Syntax"}
        },
        position: {
            viewport: $(window)
        }
    })
};

Indeko.Morphsearch.init();












