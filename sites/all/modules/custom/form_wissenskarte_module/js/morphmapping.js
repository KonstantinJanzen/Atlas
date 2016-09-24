$ = jQuery;
//Create a Namespace for Indeko javascript objects (no objects in global namespace)
var Indeko = Indeko || {};
var props = []; // GUI element rows above knowledge map

var ValidationResult = function() {
	var l_oValidationResult = {
		isTitelValid: false,
		messageTitel: "Bitte geben Sie der Kontur einen Titel um fortzufahren.",
		isAreaValid: false,
		messageArea: "Bitte zeichnen Sie zuerst eine Kontur im Bild ein.",
		isMorphboxValid: false,
		messageMorphbox: "Bitte weisen Sie der Kontur Inhalte aus dem Portal zu.",

		/**
		 * @returns {boolean} TRUE if all validations are true, otherwiese FALSE.
		 */
		isValid: function() {
			if (this.isTitelValid && this.isAreaValid && this.isMorphboxValid) {
				return true;
			} else {
				return false;
			}
		},

		l_oInputTitel: {}
	};

	return l_oValidationResult;
};

/**
 * Variables and functions namespace of the image map.
 */
Indeko.ImageMap = Indeko.ImageMap || {
	scalingFactor: 1,
};

/**
 * Variables and functions namespace of the morphological box.
 */
Indeko.MorphBox = {
	// DOM element that contains the representation of the morphological box.
	element : $('#morphological-box'),

	// array represention of the selected morphological box items (first element fulltext string, following items taxonomy IDs)
	dataArray : [] // e.g. ["Kompetenz", "38", "40"]
};

/**
 * Initializes knowledge map editor in add/edit modes and attaches map areas to image in view mode.
 *
 * @param {boolean} ViewMode TRUE for viewing a knowledge map, FALSE for adding or editing a knowledge map.
 * @returns {boolean} TRUE if image is found and imagemap can be initialized, otherwise FALSE.
 */
function  initView(ViewMode) {
	var result = false;
	var imageClassName = "";

	if ($('#field-markierte-bereiche-add-more-wrapper').length > 0) {
		ViewMode = false;
		imageClassName = 'image-style-wissenkarte';
	}

	if ($('.field-name-field-markierte-bereiche').length > 0) {
		ViewMode = true;
		imageClassName = 'image-style-none';
	}

	if (document.getElementsByClassName(imageClassName).length > 0){
		result = true;
		var l_oImageEdit = document.getElementsByClassName('image-style-wissenkarte');
		var l_oImageView = document.getElementsByClassName('image-style-none');

		if (l_oImageEdit.length > 0){
			// Edit and Add Mode
			myimgmap = {};
			var loadedValue = $('#edit-field-markierte-bereiche-und-0-value').val();

			instanciate_maschek_image(l_oImageEdit[0]);		// instantiate image map object
			instanciateAreaDescription();					// load GUI
            myimgmap.setMapHTML(loadedValue);				// load image map areas
            Indeko.ImageMap.hookSaveButton(); 				// attach client side validation to save button
			Indeko.MorphBox.loadDummy();					// load morphological box table dummy
			Indeko.MorphBox.update(myimgmap.currentid);		// show selected morphological box items of current map area
        } else if (l_oImageView.length > 0) {
			// ViewMode
			var parent = $('.image-style-none').parent();
			var div = $(parent[0]).parent();
			myimgmap = {};

			// load areas
			var loadedValue = $($(".field-name-field-markierte-bereiche").children()[1]).text();
			var l_oPicContainer = $('.field-type-image').find('div');
			if (loadedValue != "" && l_oPicContainer.length === 1) $(loadedValue).appendTo(l_oPicContainer);

            Indeko.ImageMap.addTooltip();

			// read map id and attach to image
			if (l_oPicContainer.find('map').length === 1) {
				var l_sId = '#' + l_oPicContainer.find('map').attr('id');
				l_oPicContainer.find('img').attr('USEMAP', l_sId);
			}
		}
    }
	
	return result;
}

/**
 * Instanciates the imagemap object to draw areas and interact with the GUI.
 *
 * @param p_oPic The DOM image element.
 */
function instanciate_maschek_image(p_oPic){
	myimgmap = new imgmap({
		mode : "editor",
		custom_callbacks : {
			'onAddArea'       : function(id)  {gui_addArea(id);},//to add new form element on gui
			'onRemoveArea'    : function(id)  {gui_removeArea(id);},//to remove form elements from gui
			'onAreaChanged'   : function(obj) {gui_areaChanged(obj);},// update form elements with selected area values
			'onSelectArea'    : function(obj) {gui_selectArea(obj);},//to select form element when an area is clicked
			'onHtmlChanged'   : function(str) {gui_htmlChanged(str);},// to update "markierte Bereiche"
            'onDrawArea'      : function(id)  {gui_updateArea(id);}, // to update drawn area
            'onStatusMessage' : function(str) {gui_statusMessage(str);},// to display status messages on gui
            'onLoadImage'     : function(pic) {Indeko.ImageMap.scale(pic);} // scale image map areas to current image display size
		},
		pic_container: p_oPic, // element containing the image
		bounding_box : false,
		label : "%t",
        hint: "%t %h",
        label_style: 'font-family: sans-serif; font-size: 87.5%; color: #444',
        draw_opacity: '50',
        CL_NORM_SHAPE: '#0000FF',
        CL_DRAW_SHAPE: '#0000FF',
        CL_HIGHLIGHT_SHAPE: '#0000FF'
	});

	myimgmap.useImage(p_oPic);
}

function instanciateAreaDescription(){

	// TODO: edit content type wissenskarte to add div wrapper around image for clear identification
	var guiArea = $('#edit-field-wk-bild');

	guiArea.prepend('<div id="addAreaButton" class="addAreaButton" value="" />');
	guiArea.prepend('<label id="addAreaError" class="labelAreaErrorText" />');
	guiArea.prepend('<div id="areadescription"></div>');

	//clickevent an addAreaButton
	$('#addAreaButton').click(function () {


		var l_oResult = validateLastArea();
        validateHighlight(l_oResult);

		if (l_oResult.isValid()) {
			Indeko.ImageMap.addNewArea();      // add new area on validation success...
            Indeko.MorphBox.clear();    // ... and clear the morphological box
		}
	});
}

/*
 * Highlights knowledge map form elements that failed the validation and displays warning messages.
 * @param l_oResult validation result object
 */
function validateHighlight(l_oResult) {
    $('#addAreaError').text("");

    if (l_oResult.isAreaValid === false){
        $('#addAreaError').append("<br>").append(l_oResult.messageArea);
        $('.image-style-wissenkarte').addClass('addAreaError');
    } else {
        $('.image-style-wissenkarte').removeClass('addAreaError');
    }

    if (l_oResult.isTitelValid === false){
        $('#addAreaError').append("<br>").append(l_oResult.messageTitel);
        $(l_oResult.l_oInputTitel).addClass('addAreaError');
    } else {
        $('input').removeClass('addAreaError');
    }

    if (l_oResult.isMorphboxValid === false) {
        $('#addAreaError').append("<br>").append(l_oResult.messageMorphbox);
        Indeko.MorphBox.element.addClass('addAreaError');
    } else {
        Indeko.MorphBox.element.removeClass('addAreaError');
    }
}

function validateLastArea(){
	var l_oValidationResult = new ValidationResult();

	if (myimgmap.currentid > -1){
		var l_oArea = $('#img_area_'+myimgmap.currentid);
		if (l_oArea.length > 0) {
			var l_oInputTitel = $('#img_area_'+myimgmap.currentid).find('input[name=img_alt]');
			if (l_oInputTitel.val().trim() != "") {
				l_oValidationResult.isTitelValid = true;
				l_oValidationResult.message = "";
			} else {
				l_oValidationResult.l_oInputTitel = l_oInputTitel;
			}
		} else {
			l_oValidationResult.isTitelValid = true;
			l_oValidationResult.message = "";
		}
	}

	if (getValidAreaCount() == $('input[name=img_alt]').length){
		l_oValidationResult.isAreaValid = true;
	} else {
		l_oValidationResult.isAreaValid = false;
	}

	/* Check if the drawn area is linked to content on the website. */

	if ($.isEmptyObject(Indeko.MorphBox.dataArray) && myimgmap.areas[0] !== null) {
		l_oValidationResult.isMorphboxValid = false;
	} else {
		l_oValidationResult.isMorphboxValid = true;
	}



	return l_oValidationResult;
}

/* validate all ares */
function validateAllAreas(){
	var l_bIsValid = true;

	// all titels inputs from areas
	var l_aInputTitelfromAreas = $('input[name=img_alt]');

	/* validate all titels */
	for (var i = 0; i < l_aInputTitelfromAreas.length; i++) {
		if ($(l_aInputTitelfromAreas[i]).val().trim() == ""){
			$(l_aInputTitelfromAreas[i]).addClass('addAreaError');
			l_bIsValid = false;
		} else {
			$(l_aInputTitelfromAreas[i]).removeClass('addAreaError');
		}
	}

	/* Validate linked content.	Shouldn't be possible to fail after validateLastArea() check since a user cannot
	* empty the morphological box through the GUI (always at least '*' search returned) */
	var allAreas = myimgmap.areas;
	$.each(allAreas, function(index, area) {
	    if(area == null) {
	        return;
        }
		if (area.ahref === '' || area.ahref === 'undefined') {
            $($(myimgmap.pic_container).find('canvas')[index]).addClass('canvasError');
			l_bIsValid = false;
		} else {
            $($(myimgmap.pic_container).find('canvas')[index]).removeClass('canvasError');
        }
	});

	if (l_bIsValid === true){
		$('#addAreaError').text("");
		$('input').removeClass('addAreaError');
	} else {
		var l_oValidationResult = new ValidationResult();
		$('#addAreaError').text(l_oValidationResult.messageTitel);
		return false;
	}

	/* validate gui areas */
	if (getValidAreaCount() == $('input[name=img_alt]').length){
		return true; // TODO ???
	}

	var l_oValidationResult = new ValidationResult();
	$('#addAreaError').text(l_oValidationResult.messageArea);
	return false;
}

/* returns the valid/real count of areas */
function getValidAreaCount(){
	var l_nCount = 0;
	for (var i = 0; i < myimgmap.areas.length; i++) {
		if (myimgmap.areas[i] != null && typeof myimgmap.areas[i] != 'undefined') {
			if (myimgmap.areas[i].tagName == "CANVAS") {
				l_nCount++;
			}
		}
	}

	return l_nCount;
}

function gui_addArea(id) {
	//var id = props.length;
	//id = 1;
	props[id] = document.createElement('DIV');
	$('#areadescription').append(props[id]);

	props[id].id        = 'img_area_' + id;
	props[id].aid       = id;
	props[id].className = 'img_area';
	//hook ROW event handlers
	myimgmap.addEvent(props[id], 'mouseover', gui_row_mouseover);
	myimgmap.addEvent(props[id], 'mouseout',  gui_row_mouseout);
	myimgmap.addEvent(props[id], 'click',     gui_row_click);

	$('<input type="text"  name="img_id" class="img_id" value="' + id + '" readonly="1"/>').appendTo(props[id]);
	$('<input type="radio" name="img_active" class="img_active" id="img_active_'+id+'" value="'+id+'" >').appendTo(props[id]);
    $('.img_active').hide();

	var l_oSelect = $('<select name="img_shape" class="img_shape">').appendTo(props[id]);
	$('<option value="rect">Rechteck</option>').appendTo(l_oSelect);
	$('<option value="circle">Kreis</option>').appendTo(l_oSelect);
	$('<option value="poly">Polygon</option>').appendTo(l_oSelect);
	l_oSelect.val("rect");
	l_oSelect.chosen({disable_search: true}); // transform to chosen select box

	$('<Label class="img_label">Titel:</Label>').appendTo(props[id]);
	$('<input type="text" name="img_alt" class="img_alt" value="">').appendTo(props[id]);
	$('<input type="text" name="img_coords" class="img_coords" value="" style="display: none;">').appendTo(props[id]);

	var removeAreaButton = $('<div class="removeAreaButton" value="" />').appendTo(props[id]);
	removeAreaButton.click(function () {
		// eventuell auslagern
		myimgmap.removeArea(myimgmap.currentid);
		validateAllAreas();
		var l_nPropsPosition = props.length > 0 ? props.length - 1 : 0;
		enableDeleteButtonOnSelectedGuiArea(props[l_nPropsPosition]); // enable deletebutton of last area
	});
	enableDeleteButtonOnSelectedGuiArea(props[id]);

	//hook more event handlers to individual inputs
	myimgmap.addEvent($(props[id]).find('input[name=img_alt]')[0],  'change', gui_input_change);
	l_oSelect.change(function(event) {gui_input_change(event)});
	/*if (myimgmap.isSafari) {
		//need these for safari
		myimgmap.addEvent(props[id].getElementsByTagName('select')[0], 'change', gui_row_click);
	}*/

	//set shape as nextshape if set
	if (myimgmap.nextShape) {
		l_oSelect.val(myimgmap.nextShape);
		l_oSelect.trigger('chosen:updated');
	}
	//alert(this.props[id].parentNode.innerHTML);*/


	gui_row_select(id, true);
}

/**
 *	Called from imgmap when an area was removed.
 */
function gui_removeArea(id) {
	if (props[id]) {
		//shall we leave the last one?
		var pprops = props[id].parentNode;
		if (pprops) {
			pprops.removeChild(props[id]);
			props[id] = null;
			try {
                var lastid = pprops.lastChild.aid;
                gui_row_select(lastid, true);
				myimgmap.currentid = lastid;
                Indeko.MorphBox.update(myimgmap.currentid); // update values of morphological box
			}
			catch (err) {
				//alert('noparent');
			}
		}
	}
}

/**
 *	Handles click on props row.
 */
function gui_row_click(e) {
	if (myimgmap.viewmode === 1) {return;}//exit if preview mode
	var obj = (myimgmap.isMSIE) ? window.event.srcElement : e.currentTarget;
	//var multiple = (e.originalTarget.name == 'img_active');
	//myimgmap.log(e.originalTarget);
	if (typeof obj.aid == 'undefined') {obj = obj.parentNode;}
	//gui_row_select(obj.aid, false, multiple);
	gui_row_select(obj.aid, false, false);
	myimgmap.currentid = obj.aid;

	Indeko.MorphBox.update(obj.aid); // Update selected morphological box items

	enableDeleteButtonOnSelectedGuiArea(e.currentTarget)
}

function enableDeleteButtonOnSelectedGuiArea(selectedArea){
	/* check if  area to select exist */
	var l_aAreaToSelect = $('#areadescription').find("#" + selectedArea.id);
	if (l_aAreaToSelect.length === 1) {
		$(props).find('.removeAreaButton').hide();
		$(selectedArea).find('.removeAreaButton').show();
	}
	return false;
}

/**
 *	Handles click on a property row.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-06 16:55:29
 */
function gui_row_select(id, setfocus, multiple) {
	if (myimgmap.is_drawing) {return;}//exit if in drawing state
	if (myimgmap.viewmode === 1) {return;}//exit if preview mode
	if (!document.getElementById('img_active_'+id)) {return;}
	//if (!multiple)
	gui_cb_unselect_all();
	document.getElementById('img_active_'+id).checked = 1;
	if (setfocus) {
		document.getElementById('img_active_'+id).focus();
	}
	//remove all background styles
	for (var i = 0; i < props.length; i++) {
		if (props[i]) {
			props[i].style.background = '';
		}
	}
	//put highlight on actual props row
	props[id].style.background = '#e7e7e7';
}

/**
 *	Handles mouseover on props row.
 */
function gui_row_mouseover(e) {
	if (myimgmap.is_drawing) {return;}//exit if in drawing state
	if (myimgmap.viewmode === 1) {return;}//exit if preview mode
	var obj = (myimgmap.isMSIE) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == 'undefined') {obj = obj.parentNode;}
	//console.log(obj.aid);
	myimgmap.highlightArea(obj.aid);
}

/**
 *	Handles mouseout on props row.
 */
function gui_row_mouseout(e) {
	if (myimgmap.is_drawing) {return;}//exit if in drawing state
	if (myimgmap.viewmode === 1) {return;}//exit if preview mode
	var obj = (myimgmap.isMSIE) ? window.event.srcElement : e.currentTarget;
	if (typeof obj.aid == 'undefined') {obj = obj.parentNode;}
	myimgmap.blurArea(obj.aid);
}

/**
 *	Unchecks all checboxes/radios.
 */
function gui_cb_unselect_all() {
	for (var i = 0; i < props.length; i++) {
		if (props[i] && document.getElementById('img_active_'+i)) {
			document.getElementById('img_active_'+i).checked = false;
		}
	}
}

/**
 *	Called when one of the properties change, and the recalculate function
 *	must be called.
 *	@date	2006.10.24. 22:42:02
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 */
function gui_input_change(e) {
	// validation first if title field changes
    if (e.target.name === "img_alt") {
        var l_oResult = validateLastArea();

        //validateHighlight(l_oResult); // TODO validate only title field otherwise there will be always an error
        if (l_oResult.isTitelValid === false){
            $('#addAreaError').append("<br>").append(l_oResult.messageTitel);
            $(l_oResult.l_oInputTitel).addClass('addAreaError');
        } else {
            $('input').removeClass('addAreaError');
            $('#addAreaError').text("");
        }
    }


	if (myimgmap.viewmode === 1) {return;}//exit if preview mode
	if (myimgmap.is_drawing) {return;}//exit if drawing
	//console.log('blur');
	var obj = (myimgmap.isMSIE) ? window.event.srcElement : e.currentTarget;
	//console.log(obj);
	var id = obj.parentNode.aid;
	//console.log(this.areas[id]);
	if (obj.name == 'img_href')        {myimgmap.areas[id].ahref   = obj.value;}
	else if (obj.name == 'img_alt')    {myimgmap.areas[id].aalt    = obj.value; myimgmap.areas[id].atitle  = obj.value;}
	else if (obj.name == 'img_title')  {myimgmap.areas[id].atitle  = obj.value;}
	else if (obj.name == 'img_target') {myimgmap.areas[id].atarget = obj.value;}
	else if (obj.name == 'img_shape') {
		if (myimgmap.areas[id].shape != obj.value && myimgmap.areas[id].shape != 'undefined') {
			//shape changed, adjust coords intelligently inside _normCoords
			var coords = '';
			if (props[id]) {
				coords  =  $(props[id]).find('input[name=img_coords]').val();
			}
			else {
				coords = myimgmap.areas[id].lastInput || '' ;
			}
			coords = myimgmap._normCoords(coords, obj.value, 'from'+myimgmap.areas[id].shape);
			if (props[id]) {
				$(props[id]).find('input[name=img_coords]').val(coords);
			}
			myimgmap.areas[id].shape = obj.value;
			myimgmap.nextShape =  obj.value;
			myimgmap._recalculate(id, coords);
			myimgmap.areas[id].lastInput = coords;
		}
		else if (myimgmap.areas[id].shape == 'undefined') {
			myimgmap.nextShape = obj.value;
		}
	}
	if (myimgmap.areas[id] && myimgmap.areas[id].shape != 'undefined') {
		myimgmap._recalculate(id, $(props[id]).find('input[name=img_coords]').val());
		myimgmap.fireEvent('onHtmlChanged', myimgmap.getMapHTML());//temp ## shouldnt be here
	}
}

function gui_areaChanged(area) {
	var id = area.aid;
	if (props[id]) {
		if (area.shape)  {
			$(props[id]).find('select[name=img_shape]').val(area.shape);
			$(props[id]).find('select[name=img_shape]').trigger('chosen:updated');
		}
		if (area.lastInput) {$(props[id]).find('input[name=img_coords]').val(area.lastInput);}
		if (area.aalt)    {$(props[id]).find('input[name=img_alt]').val(area.aalt);}
	}
}

function gui_selectArea(obj) {
	gui_row_select(obj.aid, false, false);

	Indeko.MorphBox.update(obj.aid); // Update selected morphological box items
}

/**
 * Called from imgmap "onHtmlChanged" event with the new html code when changes occur.
 *
 * @param str	html image map code in string format.
 */
function gui_htmlChanged(str) {
	if (document.getElementById('edit-field-markierte-bereiche-und-0-value')) {
		document.getElementById('edit-field-markierte-bereiche-und-0-value').value = str;
	}
}

/**
 * Adds title and morpholigical box content to the current area if this info was set prior to drawing an area.
 * Called from imgmap "onDrawArea" event.
 *
 * @param id    ID of the area being drawn by user.
 */
function gui_updateArea(id) {
    // add href to area if user already selected values from the morphological box
    if (!$.isEmptyObject(Indeko.MorphBox.dataArray)) {
        Indeko.MorphBox.toData();
        myimgmap.areas[id].ahref = Indeko.MorphBox.dataToUrl();
    }

    // add title to area if the user already entered a title prior to drawing an area
    if (props[id]) {
        var areaTitle = $(props[id]).find('input[name=img_alt]').val();

        if (!$.isEmptyObject(areaTitle)) {
            myimgmap.areas[id].aalt    = areaTitle;
            myimgmap.areas[id].atitle  = areaTitle;
        }
    }

    myimgmap.fireEvent('onHtmlChanged', myimgmap.getMapHTML());
}

/**
 * Displays status messages on GUI.
 * Called from imgmap "onStatusMessage" event.
 *
 * @param str	Status message in string format.
 */
function gui_statusMessage(str) {
    var statusArea = $('.form-item-field-wk-bild-und-0').find('label');

	// status strings not loaded properly
	if (typeof str == 'undefined') {
		myimgmap.loadStrings(imgmapStrings);
		return;
    }

	$('.knowledgemapStatusMessage').remove();
    if (str.toLowerCase().indexOf("shift") >= 0) {
        if (statusArea) {
            statusArea.append('<span class="knowledgemapStatusMessage"> ' + str + '</span>');
        }
    }
}

/*
 * Converts the data array to an Apache Solr search URL.
 * ["Kompetenz", "38", "40"] -> /indeko/search/site/Kompetenz AND tid:38 AND tid:40
 *
 * @return Complete search URL in string format.
 */
Indeko.MorphBox.dataToUrl = function() {
	var baseSolrSearchUrl = Drupal.settings.basePath + "search/site/";
	var solrSearchQuery = "";

	$.each(Indeko.MorphBox.dataArray, function(index, value) {
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

/*
 * Converts a search URL to data array.
 * /indeko/search/site/Kompetenz AND tid:38 AND tid:40 -> ["Kompetenz", "38", "40"]
 *
 * @param searchURL Search URL in string format.
 */
Indeko.MorphBox.urlToData = function(searchURL) {
	if (typeof searchURL === 'undefined' || searchURL === '') {
		return;
	}

	// if (typeof dataArray === 'undefined' || searchURL === '') { // TODO for old "handmade" knowledgemap prototypes
	// 	return;
	// }

	dataArray = searchURL.split("search/site/")[1]; // search query
	dataArray = dataArray.split(" AND tid:");		// search items

	Indeko.MorphBox.dataArray = dataArray;
};

/*
 * Updates morphological box display after selecting a new knowledge map area.
 *
 * @paran id 	ID of the selected area.
 */
Indeko.MorphBox.update = function(id) {
	if (myimgmap.areas[id] == null) { // TODO
		return;
	}
	Indeko.MorphBox.clear();
	Indeko.MorphBox.urlToData(myimgmap.areas[id].ahref);
	Indeko.MorphBox.selectItems();
};

/*
 * Extract selected items from the morphological box and save them in the data array.
 * !!! Has to be changed depending on the representation of the morphological box !!!
 */
Indeko.MorphBox.toData = function() {
	Indeko.MorphBox.dataArray = [];

	var inputFulltextSearch = jQuery("#input_fulltext_search").val();
	// replace empty fulltext search field with "*" search
	if (!inputFulltextSearch) {
		inputFulltextSearch = "*";
	}
	Indeko.MorphBox.dataArray.push(inputFulltextSearch);

	jQuery("td.selected").each(function() {
		Indeko.MorphBox.dataArray.push($(this).attr("tid"));
	});
};

/*
 * Select items in the morphologocal box that match the data array.
 * !!! Has to be changed depending on the representation of the morphological box !!!
 */
Indeko.MorphBox.selectItems = function() {
	$.each(Indeko.MorphBox.dataArray, function(index, value) {
		// first element of data array is the fulltext search string
		if (index === 0) {
			$("#input_fulltext_search").val(value);
		} else {
			Indeko.MorphBox.element.find("[tid=" + value + "]").removeClass("unselected").addClass("selected");
		}
	});
};

/*
 * Clear the selected values of the morphological box.
 * !!! Has to be changed depending on the representation of the morphological box !!!
 */
Indeko.MorphBox.clear = function() {
	jQuery("td.selected").removeClass("selected").addClass("unselected");
	jQuery("#input_fulltext_search").val('');
    Indeko.MorphBox.dataArray = [];
};

/**
 * Show the Morphological Box
 */
Indeko.MorphBox.show = function() {
    Indeko.MorphBox.element.show();
}

/**
 * Hide the Morphological Box
 */
Indeko.MorphBox.hide = function() {
    Indeko.MorphBox.element.hide();
}

/*
 * Inserts morphbox dummy into the DOM. Dirty copy and paste from search morphbox dummy.
 */
Indeko.MorphBox.loadDummy = function () {
	// Delete all child elements from existing morphbox representation to replace it with this dummy.
	Indeko.MorphBox.element.empty();

	// Dummy MorphBox add table.
	Indeko.MorphBox.element.append('<div class="morphbox">\
		<input id="input_fulltext_search" title="Geben Sie die Begriffe ein, nach denen Sie suchen." class="form-text" size="46" maxlength="128" value=""> Volltextsuchfeld\
		<table id="morphbox">\
		<tr>\
		<td class="taxonomyname">Unternehmensgröße</td>\
		<td class="unselected" tid="36">Kleinstunternehmen (weniger als 10 Beschäftigte)</td>\
		<td class="unselected" tid="37">Kleinunternehmen (10 bis 49 Beschäftigte)</td>\
		<td class="unselected" tid="38">Mittlere Unternehmen (50 bis 249 Beschäftigte)</td>\
		<td class="unselected" tid="39">Großunternehmen (250 oder mehr Beschäftigte)</td>\
		<td class="unselected" tid="40">Virtuelle Netzwerke</td>\
		</tr>\
		<tr>\
		<td class="taxonomyname">Branche</td>\
		<td class="unselected" tid="41">Baugewerbe</td>\
		<td class="unselected" tid="42">Energieversorgung</td>\
		<td class="unselected" tid="43">Finanz- und Versicherungsdienstleistung</td>\
		<td class="unselected" tid="44">Gastgewerbe</td>\
		<td class="unselected" tid="45">Gesundheit und Sozialwesen</td>\
		<td class="unselected" tid="46">Grundstücks- und Wohnungswesen</td>\
		<td class="unselected" tid="47">Handel</td>\
		<td class="unselected" tid="48">Information und Kommunikation</td>\
		<td class="unselected" tid="49">Land- und Forstwirtschaft</td>\
		<td class="unselected" tid="50">Öffentliche Verwaltung</td>\
		<td class="unselected" tid="51">Sonstiges</td>\
		<td class="unselected" tid="52">Verarbeitendes Gewerbe</td>\
		<td class="unselected" tid="53">Verkehr und Lagerei</td>\
		<td class="unselected" tid="54">Wasserversorgung</td>\
		</tr>\
		</table>\
		</div>\
		<div id="result"></div>'
	);


	// Dummy MorphBox add CSS
	Indeko.MorphBox.element.append('<style>\
		.selected { background-color: #2da046; color: white; }\
		.unselected { background-color: white; color: #444; }\
		.taxonomyname {font-weight: bold; color: #444; }\
		.morphbox  { width: 100%;	overflow-y: hidden; overflow: auto; -ms-user-select: none; /* IE 10+ */\
		-moz-user-select: -moz-none;\
		-khtml-user-select: none;\
		-webkit-user-select: none;\
		user-select: none;}\
		td { border: 1px solid gray; text-align:center; }\
		</style>'
	);


	// Dummy MorphBox logic
	jQuery("td.unselected").click(function () {
		//<!-- if clicked cell is selected, just deselect it and stop -->
		if (jQuery(this).hasClass("selected")) {
			this.className = (this.className == 'unselected' ? 'selected' : 'unselected');
			return;
		}

		//<!-- if taxonomy is singleselect only, deselect all cells in this row -->
		var parentRow = jQuery(this).parent();
		if (parentRow.hasClass("single")) {
			parentRow.find(".selected").removeClass("selected").addClass("unselected");
		}

		//<!-- change class (color) of cell on click -->
		this.className = (this.className == 'unselected' ? 'selected' : 'unselected');
	});


	// save selected values once mouse leaves the morphbox
	Indeko.MorphBox.element.mouseleave(function () {
		Indeko.MorphBox.toData();
		myimgmap.areas[myimgmap.currentid].ahref = Indeko.MorphBox.dataToUrl();
		myimgmap.fireEvent('onHtmlChanged', myimgmap.getMapHTML());
	});
};

/*
 * Scales image map area coordinates in add and edit mode to the current displayed width in the browser if the image
 * width differs from it's original width.
 * (Drupal automatically scales image width depending on browser width and page (image width in view node can be
 * different from width in add node can be different from width in edit node).
 *
 * @param domImage DOM element containing the image.
 */
Indeko.ImageMap.scale = function (domImage) {
    console.log(domImage);
    console.log(domImage.outerHTML);

    var image = $(domImage).get(0);

    console.log(image.width);
    console.log(image.naturalWidth);

    Indeko.ImageMap.scalingFactor = image.width / image.naturalWidth;
    if (image.width !== image.naturalWidth) {
        Indeko.ImageMap.scalingFactor = image.width / image.naturalWidth;
        myimgmap.scaleAllAreas(Indeko.ImageMap.scalingFactor);
        console.log("scale");
    }

    console.log(Indeko.ImageMap.scalingFactor);

    if (image.width === 0 || image.naturalWidth === 0) {
        image = $('.image-style-wissenkarte')[0];
        $(image).load(function () {
            console.log("img load");
            Indeko.ImageMap.scale($('.image-style-wissenkarte'));
        });
    }
};


/**
 * Adds client side validation to save / submit button.
 */
Indeko.ImageMap.hookSaveButton = function () {
    $('#edit-submit').click(function () {
        var l_bIsValid = true;
        // Error if title is empty
        var titleElement = $("#edit-title");
        if ($.isEmptyObject(titleElement.val())) {
            titleElement.addClass('error');
            titleElement.focus();
            l_bIsValid = false;
        } else {
            titleElement.removeClass('error');
        }

        // guarantee that last drawn area was saved properly
        gui_updateArea(myimgmap.currentid);


        var l_oResult = validateLastArea();
        if (!l_oResult.isValid()) {
            validateHighlight(l_oResult);
            l_bIsValid = false;
        }

        // Validate all drawn areas
        var allAreas = myimgmap.areas;
        var allCanvasAreas = $(myimgmap.pic_container).find('canvas');
        $.each(allAreas, function (index, area) {
            var currentCanvasArea = $(allCanvasAreas[index]);
            if (area == null) {
                return;
            }

            // validate linked content
            if ($.isEmptyObject(area.ahref)) {
                currentCanvasArea.addClass('canvasError');
                Indeko.MorphBox.element.addClass('addAreaError');
                l_bIsValid = false;
            }

            // validate area titles
            if ($.isEmptyObject(area.atitle)) {
                currentCanvasArea.addClass('canvasError');
                $('#img_area_' + index).find("input[name=img_alt]").addClass("addAreaError");
                l_bIsValid = false;
            }
        });

        // update map areas before saving
        if (l_bIsValid) {
            myimgmap.fireEvent('onHtmlChanged', myimgmap.getMapHTML());
        }

        return l_bIsValid;

    });
}

/**
 * Adds a new area to the image map.
 */
Indeko.ImageMap.addNewArea = function () {
	myimgmap.addNewArea();
}

/**
 * Hide image map text section (marked areas text field)
 */
Indeko.ImageMap.hideElements = function() {
    $("#edit-field-markierte-bereiche").hide();
}

/**
 * Adds the tooltip to knowledge map areas.
 */
Indeko.ImageMap.addTooltip = function() {
    $('area').qtip({
        show: {
            delay: 1
        }
    });
}