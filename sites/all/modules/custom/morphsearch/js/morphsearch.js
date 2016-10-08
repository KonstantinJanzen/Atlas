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
        buttonSave: $('#morphsearch-save'),                     // link to save the selected search values
        buttonsSearchResults: $('.searchResultLink')            // all saved search result links on the user profile
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
Indeko.Morphsearch.doSearch = function () {
    var searchArray = Indeko.Morphsearch.toArray();
    var searchUrl = Indeko.Morphsearch.toUrl(searchArray);

    // save selected search values locally to restore the search block on page reload
    localStorage["searchValues"] = JSON.stringify(searchArray);

    // redirect to search results
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
                Indeko.createNotification('Hinweis!',data.message, 'bottom  right', 'top left', Indeko.Morphsearch.buttonSave);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                Indeko.createNotification('Fehler!',textStatus, 'bottom  right', 'top left', Indeko.Morphsearch.buttonSave);
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
 * Load search parameters to update the search block once user clicks links to see saved search results.
 */
Indeko.Morphsearch.hookSearchResultsButtons = function() {
    Indeko.Morphsearch.buttonsSearchResults.click(function() {
        localStorage["searchValues"] = $(this).attr('data-input');
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
 * Converts selected search items to an object.
 *
 * @returns searchArray Associative array like object that contains all search items.
 */
Indeko.Morphsearch.toArray = function() {

    // search object structure (imitating an assiciative array) that can be easily converted to and from JSON
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


    // save and parse fulltext search string
    var inputFulltextSearch = this.elemFulltext.val();
    // replace empty fulltext search field with "*" search
    if (!inputFulltextSearch) {
        inputFulltextSearch = "*";
    }
    searchArray.fulltext = inputFulltextSearch;


    // save morphological search by iterating over all select elements in the morphological block
    Indeko.Morphsearch.elemsMorph.each(function() {
        var tid = $(this).val();

        // if user selected an element, add it's taxonomy ID to the searchArray
        if (!$.isEmptyObject(tid)) {
            // multiselect will return an array of selected items. Add single values to the final searchArray.
            if(Array.isArray(tid)) {
                searchArray.morphological.push.apply(searchArray.morphological, tid);   // multi-select
            } else {
                searchArray.morphological.push(tid);                                    // single-select
            }
        }
    });


    // save type search by iterating over all type elements in the type block and save selected items
    Indeko.Morphsearch.elemsType.each(function() {
        if ($(this).hasClass('selected')) {
            var machineName = $(this).attr('data-name');
            searchArray.type.push(machineName);

            // special case: if publication is selected publication search should be displayed and saved, too.
            if (machineName === 'biblio') {
                isPublicationSelected = true;
            }
        }
    });


    // if publication is selected iterate over all publication elements  and save their values
    if (isPublicationSelected) {
        Indeko.Morphsearch.elemsPublication.each(function (index) {
            var id = $(this).val();
            var type = $(this).attr('data-type');

            // if user selected an element, add it's ID to the searchArray
            if (!$.isEmptyObject(id)) {
                // multiselect will return an array of selected items. Add single values to the final searchArray.
                if(Array.isArray(id)) {
                    searchArray.publication[type].push.apply(searchArray.publication[type], id);    // multi-select
                } else {
                    searchArray.publication[type].push(id);                                         // single-select
                }
            }
        });
    }


    return searchArray;
};

/**
 * Load search block with values from the searchArray.
 *
 * @param searchArray Associative array like object that contains all search items.
 * @see toArray for searchArray structure definition.
 */
Indeko.Morphsearch.toSearchblock = function(searchArray) {

    // fill fulltext field
    if (searchArray.fulltext === '*') {
        Indeko.Morphsearch.elemFulltext.val('');
    } else {
        Indeko.Morphsearch.elemFulltext.val(searchArray.fulltext);
    }


    // fill morphological search elements, ...
    $.each(searchArray.morphological, function (index, value) {
        Indeko.Morphsearch.elemMorphBlock.find('option[value=' + value + ']').attr('selected', 'selected');
    });

    // ...display the morphological block, if morphological elements were selected ...
    if (searchArray.morphological.length > 0) {
        Indeko.Morphsearch.elemMorphBlock.show();

        // ...and update chosen to adopt the changes
        Indeko.Morphsearch.elemsMorph.trigger("chosen:updated");
    }


    // select type search elements
    var isPublicationSelected = false;
    $.each(searchArray.type, function (index, value) {
        Indeko.Morphsearch.elemTypeBlock.find('div[data-name=' + value + ']').addClass('selected');

        if(value === 'biblio') {
            isPublicationSelected = true;
        }
    });

    var hasValues = false;
    // iterate over the 6 publication related data types (year, author,... @see toArray) and fill in selected values...
    $.each(searchArray.publication, function (type, values) {
        if (!$.isEmptyObject(values)) { // ...if the array of IDs is not empty ...
            var elemSelect = Indeko.Morphsearch.elemPublicationBlock.find('select[data-type="' + type + '"]');
            $.each(values, function (index, value) {
                elemSelect.find('option[value=' + value + ']').attr('selected', 'selected');
            });

            hasValues = true;
        }
    });

    // if publication is selected, display publication link
    if (isPublicationSelected) {
        Indeko.Morphsearch.elemPublicationBlock.show();

        // if publication search values are selected, display publication search block ...
        if (hasValues) {
            Indeko.Morphsearch.elemPublicationFilterBlock.show();

            // ...and make chosen adopt the publication search changes
            Indeko.Morphsearch.elemsPublication.trigger("chosen:updated");
        }
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
    Indeko.Morphsearch.hookSearchResultsButtons();
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
 * Converts the search object (@see toArray) to an Apache Solr search URL.
 * -> /indeko/search/site/Kompetenz AND tid:38 AND tid:40
 * TODO: duplicate function in morphmapping.js
 *
 * @param searchArray Object containing all user-selected search values.
 * @return {string} Complete search URL in string format.
 */
Indeko.Morphsearch.toUrl = function (searchArray) {
    var baseSolrSearchUrl = Drupal.settings.basePath + "search/site/";
    var solrSearchQuery = "";

    solrSearchQuery += searchArray.fulltext;

    $.each(searchArray.morphological, function (index, tid) {
        solrSearchQuery += " AND tid:" + tid;
    });


    // TODO type and publication search

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
 * @param title String to be displayed as the notification title.
 * @param text String to be displayed as the notification message.
 * @param my String position of the notification...
 * @param at String ... that will point to this location at the target
 * @param location DOM element as target for the notification
 */
Indeko.createNotification = function(title, text, my, at, location) {
    $(document.body).qtip({
        content: {
            text: text,
            title: {
                text: title
            }
        },
        position: {
            viewport: $(window) ,
            my: my,
            at: at,
            target: location
        },
        show: {
            event: false,
            ready: true,
            effect: function() {
                $(this).stop(0, 1).fadeIn(400);
            },
            delay: 0
        },
        hide: {
            event: false,
            effect: function(api) {
                $(this).stop(0, 1).fadeOut(400).queue(function() {
                    api.destroy(true);
                })
            }
        },
        style: {
            classes: 'searchNotification jgrowl ui-tooltip-dark ui-tooltip-rounded',
            tip: true
        },
        events: {
            render: function(event, api) {
                var lifespan = 4000;

                clearTimeout(api.timer);
                if (event.type !== 'mouseover') {
                    api.timer = setTimeout(function() {api.hide();}, lifespan);
                }
            }
        }
    }).removeData('qtip');
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

    /* Delete Link. */
    $(".actions .delete").click(function(){
        Indeko.Morphsearch.showConfirmation($(this).parent());
    });

    /* No-Button. */
    $(".actions .no").click(function(){
        Indeko.Morphsearch.hideConfirmation($(this).parent());
    });

    /*
     * Show only the first 4 features (rows) for every fieldset.
     */
    $("#content fieldset").each(function(index, element) {

        if($("table tr", element).length > 4) {
            $("table tr:gt(3)", element).hide();
        }
    });

    /* Toggle the filter link. */
    $(".toggleFilter").click(function() {

        if($("table tr:nth-last-child(1):visible", this.parentElement).length > 0) {
            $("table tr:gt(3)", this.parentElement).hide();
            $(".toggleFilter", this.parentElement).text("Restliche Filter einblenden");
        } else {
            $("table tr:gt(3)", this.parentElement).show();
            $(".toggleFilter", this.parentElement).text("Weniger Filter anzeigen");
        }
    });

    /* Currently no longer required.
     */
    /* Open and close saved search fieldset.
    $('#content legend').click(function() {
        var i = $('i', this);
        $('table', $(this).parent()).fadeToggle();

        if(i.hasClass('fa-chevron-down')) {
            i.removeClass('fa-chevron-down');
            i.addClass('fa-chevron-left');
        } else {
            i.removeClass('fa-chevron-left');
            i.addClass('fa-chevron-down');
        }
    }); */
});








