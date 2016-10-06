$ = jQuery;
var Indeko = Indeko || {};

/**
 * Variables and functions namespace of the search.
 */
Indeko.Morphsearch = Indeko.Morphsearch || {
        elemFulltext: $('#fulltextsearch'),                     // fulltext search element
        elemFulltextInfo: $('#fulltextsearchinfo'),             // fulltext search info element
        elemSearchSyntax: $('#searchSyntax'),                   // element with search syntax representaion
        elemsType: $('.morphsearch-type-block .type'),           // all type search select elements
        elemTypeBlock: $('.morphsearch-type-block'),            // type search element
        elemsMorph: $('.morphsearch-select'),                    // all morphological box select elements
        elemMorphBlock: $('#morphsearch-select-block'),         // element containing all morphological box select elements
        elemPublicationBlock: $('#morphsearch-publication-block'), // publication toggle link and all publication search elements
        elemPublicationFilterBlock: $('#morphsearch-publication-filter-block'),
        elemsPublication: $('.publication-select'),                    // all publication box select elements
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

        // close morphological search and return to the top of the page
        Indeko.Morphsearch.elemMorphBlock.hide();
        $(window).scrollTop(0);
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

            // display notifications on main content block
            success: function (data, textStatus, jqXHR) {
                Indeko.createNotification(data.message, $('#main-content'));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Indeko.createNotification(textStatus, $('#main-content'));
            }
        });
    });
};

/**
 * Toggles type search element selection on click.
 */
Indeko.Morphsearch.hookTypeSearchButton = function() {
    Indeko.Morphsearch.elemsType.click( function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $(this).addClass('selected');
        }
    });
};

/**
 * Toggles publication filter link if publication is selected on type search block.
 */
Indeko.Morphsearch.hookTypeSearchPublicationButton = function() {
    $('.morphsearch-type-block .type:contains("Publikation")').click(function() {
        Indeko.Morphsearch.elemPublicationBlock.toggle();
        Indeko.Morphsearch.elemPublicationFilterBlock.hide();
    });
};


/**
 * Toggles visibility of publication related filters on click.
 */
Indeko.Morphsearch.hookTypeSearchToggle = function() {
    $('#morphsearch-publication-block-toggle').click( function() {
        Indeko.Morphsearch.elemPublicationFilterBlock.toggle();
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
    this.elemsMorph.val(-1).trigger("chosen:updated");
    this.elemsPublication.val(-1).trigger("chosen:updated");

    this.elemsType.removeClass('selected');
    Indeko.Morphsearch.elemPublicationBlock.hide();
    Indeko.Morphsearch.elemPublicationFilterBlock.hide();
};

/**
 * Converts selected search items to array.
 * First element is fulltext string, followed by taxonomy IDs -> ["fulltext search","38","40"].
 * TODO: extend for type search (2nd element in searchArray?) Indeko.Morphsearch.elemsType + Publikationsdaten
 *
 * @returns {Array} of all search items.
 */
Indeko.Morphsearch.toArray = function() {
    var searchArray = {
        fulltext: '',
        morphological: [],
        type: [],
        publication: {
            year: [],
            author: [],
            tags: [],
            publisher: [],
            location: [],
            type: []
        }
    };

    var isPublicationSelected = false;


    var inputFulltextSearch = this.elemFulltext.val();
    // replace empty fulltext search field with "*" search
    if (!inputFulltextSearch) {
        inputFulltextSearch = "*";
    }
    searchArray.fulltext = inputFulltextSearch;


    // iterate over all select elements and save selected items
    Indeko.Morphsearch.elemsMorph.each(function() {
        var tid = $(this).val();

        // if user selected an element, add it's taxonomy ID to the searchArray
        if (!$.isEmptyObject(tid)) {
            // multiselect will return an array of selected items. Add single values to the final searchArray.
            if(Array.isArray(tid)) {
                searchArray['morphological'].push.apply(searchArray['morphological'], tid);
            } else {
                searchArray['morphological'].push(tid);
            }
        }
    });

    // iterate over all type elements and save selected items
    Indeko.Morphsearch.elemsType.each(function() {
        if ($(this).hasClass('selected')) {
            var machineName = $(this).attr('data-name');
            searchArray.type.push(machineName);

            if (machineName === 'biblio') {
                isPublicationSelected = true;
            }
        }
    });

    //TODO comments
    // iterate over all publication elements if publication is selected and save values
    if (isPublicationSelected) {
        Indeko.Morphsearch.elemsPublication.each(function (index) {
            var id = $(this).val();
            var type = $(this).attr('data-type');

         // if user selected an element, add it's taxonomy ID to the searchArray TODO comments
            if (!$.isEmptyObject(id)) {
                // multiselect will return an array of selected items. Add single values to the final searchArray.
                if(Array.isArray(id)) {
                    searchArray.publication[type].push.apply(searchArray.publication[type], id);
                } else {
                    searchArray.publication[type].push(id);
                }
            }
        });
    }







    return searchArray;
};

/**
 * Fill search block with values from the searchArray.
 * TODO: extend for type search (2nd element in searchArray?)
 *
 * @param searchArray Array of search values ["fulltext search","38","40"]. TODO
 */
Indeko.Morphsearch.toSearchblock = function (searchArray) {

    if (searchArray.fulltext === '*') {
        Indeko.Morphsearch.elemFulltext.val('');
    } else {
        Indeko.Morphsearch.elemFulltext.val(searchArray.fulltext);
    }

    // fill morphological search elements
    $.each(searchArray.morphological, function (index, value) {
        Indeko.Morphsearch.elemMorphBlock.find('option[value=' + value + ']').attr('selected', 'selected');
    });

    // display morphological box, if morphological box elements were selected
    if (searchArray.morphological.length > 1) {
        Indeko.Morphsearch.elemMorphBlock.show();
    }

    // make chosen adopt the morphological search changes
    Indeko.Morphsearch.elemsMorph.trigger("chosen:updated");


    // select type search elements
    $.each(searchArray.type, function (index, value) {
        Indeko.Morphsearch.elemTypeBlock.find('div[data-name=' + value + ']').addClass('selected');
    });

    var hasValues = false;
    $.each(searchArray.publication, function (index, value) {
        if (!$.isEmptyObject(value)) {
            var elemSelect = Indeko.Morphsearch.elemPublicationBlock.find('select[data-type="' + index + '"]');
            elemSelect.find('option[value=' + value + ']').attr('selected', 'selected');

            hasValues = true;
        }
    });

    // make chosen adopt the publication search changes
    Indeko.Morphsearch.elemsPublication.trigger("chosen:updated");

    // display publication box, if publication elements were selected
    if (hasValues) {
        Indeko.Morphsearch.elemPublicationBlock.show();
        Indeko.Morphsearch.elemPublicationFilterBlock.show();
    }


};

/**
 * Initialize morphsearch block.
 */
Indeko.Morphsearch.init = function() {
    // transform select to chosen boxes
    Indeko.Morphsearch.elemsMorph.chosen({
        inherit_select_classes: true,
        allow_single_deselect: true,
        display_selected_options: false,
        width:"100%"
    });

    Indeko.Morphsearch.elemsPublication.chosen({
        inherit_select_classes: true,
        allow_single_deselect: true,
        display_selected_options: false,
        width:"100%"
    });

    Indeko.Morphsearch.hookResetButton();
    Indeko.Morphsearch.hookSearchButton();
    Indeko.Morphsearch.hookFulltextInput();
    Indeko.Morphsearch.hookTypeSearchButton();
    Indeko.Morphsearch.hookTypeSearchToggle();
    Indeko.Morphsearch.hookTypeSearchPublicationButton();
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

/**
 * Displays a notification on a selected DOM target.
 *
 * @param message String text to be displayed in the notification.
 * @param target DOM element that will be th target position of the notification.
 */
Indeko.createNotification = function(message, target) {
    $('<div/>').qtip({
        content: {
            text: message,
            title: {
                text: 'Hinweis!',
                button: false
            }
        },
        position: {
            viewport: $(window) ,
            my: 'top right',
            at: 'top right',
            target: target
        },
        show: {
            event: false,
            ready: true,
            effect: function() {
                $(this).stop(0, 1).animate({ height: 'toggle' }, 400, 'swing');
            },
            delay: 0
        },
        hide: {
            effect: function(api) {
                $(this).stop(0, 1).animate({ height: 'toggle' }, 400, 'swing');
            }
        },
        style: {
            width: 400,
            classes: 'searchNotification',
            tip: false
        },
        events: {
            render: function(event, api) {
                clearTimeout(api.timer);
                if (event.type !== 'mouseover') {
                    api.timer = setTimeout(function() {
                        api.destroy();
                    }, 4000);
                }
            }
        }
    });
};


/**
 * Function to delete the saved search and to remove the fieldset of the saved search
 * in the user profile view.
 *
 * @param id The id of the saved search.
 */
Indeko.Morphsearch.deleteSavedSearch = function(id) {
    $.post(Drupal.settings.basePath + 'user/deletesearch/ajax',
        {
            savedSearchId: id
        },
        function (data, textStatus, jqXHR) {
            $('fieldset#' + id).remove();
        });
};

/**
 * Function to show the delete confirmation.
 *
 * @param element The element to be shown.
 */
Indeko.Morphsearch.showConfirmation = function(element) {
    $(".confirmation", element).show();
};

/**
 * Function to hide the delete confirmation.
 *
 * @param element The element to be hidden.
 */
Indeko.Morphsearch.hideConfirmation = function(element) {
    $(element).hide();
};

Indeko.Morphsearch.init();

/*
 * A function to execute after the DOM is fully loaded.
 */
$(document).ready(function() {

    /* Delete Link: */
    $(".actions .delete").click(function(){
        Indeko.Morphsearch.showConfirmation($(this).parent());
    });

    /* No-Button. */
    $(".actions .no").click(function(){
        Indeko.Morphsearch.hideConfirmation($(this).parent());
    });
});








