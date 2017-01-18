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
		contentBlockLabel:	$('#fulltextsearchrow').find('label'),
		elemTags: $('#edit-field-tag-combined-und'),
		buttonSave: $('#edit-submit'),
		elemTitle: $("#edit-title"),
		elemDescription: $("#edit-field-beschreibung-und-0-value"),
		elemButtonHighlight: $("#button_hightlight")
	};

/**
 * Variables and functions namespace of the morphological box.
 */
Indeko.MorphBox = {
	// DOM element that contains the representation of the morphological box.
	//element : $('#morphological-box'),
	wholeSearchBox : $('#block-morphsearch-morphsearch-block'),
	searchTypeBlock : $('.morphsearch-type-block'),
	element : $('#block-morphsearch-morphsearch-block'),
	selects : $('#block-morphsearch-morphsearch-block').find('select'),
    searchJson : ''       // search blocks values before editing knowledge map
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

			instanciate_maschek_image(l_oImageEdit[0]);				// instantiate image map object
			instanciateAreaDescription();							// load GUI
			myimgmap.setMapHTML(loadedValue);						// load image map areas
			Indeko.ImageMap.hookSaveButton(); 						// attach client side validation to save button
			Indeko.MorphBox.convertMorphsearch();                   // converts the standard protal search block to be usable to link content to knowledge maps
			myimgmap.loadStrings(imgmapStrings);					// load status messages
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

			Indeko.ImageMap.hookMapAreas();

            // hook button to show hide map areas, if enabled [ID 103]
            if(Indeko.ImageMap.elemButtonHighlight.length) {
                Indeko.ImageMap.hookButtonHighlighting();
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
			Indeko.MorphBox.reset();
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
	var searchObject = Indeko.Morphsearch.toArray();
	if ($.isEmptyObject(searchObject) && myimgmap.areas[0] !== null) {
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
	if (getValidAreaCount() !== $('input[name=img_alt]').length){
		var l_oValidationResult = new ValidationResult();
		$('#addAreaError').text(l_oValidationResult.messageArea);
		return false;
	}

	return true;
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
		var l_oId = myimgmap.currentid;
		var l_oResult = validateLastArea();

		if (l_oResult.isTitelValid === false){
			$('#addAreaError').append("<br>").append(l_oResult.messageTitel);
			$(l_oResult.l_oInputTitel).addClass('addAreaError');
		} else {
			//$('input').removeClass('addAreaError');
			$('#img_area_'+myimgmap.currentid).find('input[name=img_alt]').removeClass('addAreaError');
			$(myimgmap.pic_container).find('canvas[id*="area' + myimgmap.currentid +'"]').removeClass('canvasError');
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
// todo testing janzen 18.10
function gui_updateArea(id) {
	// add href and json to area if user already selected values from the morphological box
	Indeko.MorphBox.getSelectedValuesFromMorphBox();

	// add title to area if the user already entered a title prior to drawing an area
	if (props[id]) {
		var areaTitle = $(props[id]).find('input[name=img_alt]').val();

		if (!$.isEmptyObject(areaTitle)) {
			myimgmap.areas[id].aalt    = areaTitle;
			myimgmap.areas[id].atitle  = areaTitle;
		}
	}

	$('.image-style-wissenkarte').removeClass('addAreaError');

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
 * Updates morphological box display after selecting a new knowledge map area.
 *
 * @paran id 	ID of the selected area.
 */
// todo testing janzen 18.10
Indeko.MorphBox.update = function(id) {
	Indeko.MorphBox.reset();
	if (myimgmap.areas[id] === null || typeof myimgmap.areas[id].json === "undefined") { // TODO
		// areas is not valid
		return false;
	}

	var jsonString = myimgmap.areas[id].json;
	jsonString = decodeURI(jsonString);
	var searchObject = JSON.parse(jsonString);
	Indeko.Morphsearch.toSearchblock(searchObject);
	Indeko.MorphBox.selectItems();
};

/*
 * Select items in the morphologocal box that match the data array.
 * !!! Has to be changed depending on the representation of the morphological box !!!
 */
Indeko.MorphBox.selectItems = function() {

	// todo testing 18.10
	var jsonString = myimgmap.areas[myimgmap.currentid].json;
	jsonString = decodeURI(jsonString);
	var searchObject = JSON.parse(jsonString);
	Indeko.Morphsearch.toSearchblock(searchObject);
};

/*
 * Reset the morphologocal box to initial display state.
 * !!! Has to be changed depending on the representation of the morphological box !!!
 */
Indeko.MorphBox.reset = function() {
	Indeko.Morphsearch.reset();
	Indeko.Morphsearch.elemFulltext.val(''); // ID 34 do not reset fulltext field on reset, so have to do it here
};

/**
 * Show the Morphological Box
 */
Indeko.MorphBox.show = function() {
	Indeko.MorphBox.element.show();
};

/**
 * Hide the Morphological Box
 */
Indeko.MorphBox.hide = function() {
	Indeko.MorphBox.element.hide();
};

/**
 * Converts the standard portal search block to be used to link content to knowledge maps.
 */
Indeko.MorphBox.convertMorphsearch = function() {
    Indeko.MorphBox.searchJson = JSON.stringify(Indeko.Morphsearch.toArray());                      // save search block state to restore it later
    Indeko.MorphBox.reset();
	Indeko.ImageMap.contentBlockLabel.text("Inhalte der Wissenskarte");									// change label of the search block
	$('.morphblocktable').remove();                                                 				// remove standard search block search / reset / save elements
	Indeko.MorphBox.selects.change(Indeko.MorphBox.getSelectedValuesFromMorphBox);  				// changelistener for comboboxes in MorpBox
	Indeko.MorphBox.searchTypeBlock.click(Indeko.MorphBox.getSelectedValuesFromMorphBox);			// clickevent for Inhaltstypen
	Indeko.Morphsearch.elemFulltext.unbind().change(Indeko.MorphBox.getSelectedValuesFromMorphBox); // changelistener for fulltext field
	Indeko.MorphBox.update(myimgmap.currentid);														// show selected morphological box items of current map area
};

// todo testing janzen 18.10
Indeko.MorphBox.getSelectedValuesFromMorphBox = function(){
	var searchObject = Indeko.Morphsearch.toArray();
	if (!$.isEmptyObject(searchObject)) {
		var jsonString = JSON.stringify(searchObject);
		jsonString = encodeURI(jsonString);

		myimgmap.areas[myimgmap.currentid].ahref = encodeURI(Indeko.Morphsearch.toUrl(searchObject));
		myimgmap.areas[myimgmap.currentid].json = jsonString;
		Indeko.MorphBox.element.removeClass('addAreaError');
		myimgmap.fireEvent('onHtmlChanged', myimgmap.getMapHTML());
	}
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

	var parentContainer = $(domImage.parentNode);

	/* Wait until the image is resized after it was put in parentContainer. */
	var timer = window.setTimeout(function() {

		if(domImage.width <= parentContainer.width() &&
			domImage.height <= parentContainer.height()) {
			Indeko.ImageMap.scalingFactor = domImage.width / domImage.naturalWidth;
			myimgmap.scaleAllAreas(Indeko.ImageMap.scalingFactor);

			window.clearTimeout(timer);
		}
	}, 100);
};

/**
 * Adds client side validation to save / submit button.
 */
Indeko.ImageMap.hookSaveButton = function () {
	Indeko.ImageMap.buttonSave.click(function () {
		var l_bIsValid = true;

		// Error if title is empty
		var titleElement = Indeko.ImageMap.elemTitle;
		if ($.isEmptyObject(titleElement.val())) {
			titleElement.addClass('error');
			if ($('.errorTitle').length === 0) {
				titleElement.after('<p class="errorTitle labelAreaErrorText"><label>Das Feld „Titel” ist erforderlich.</label></p>');
			}
			titleElement.focus();
			l_bIsValid = false;
		} else {
			titleElement.removeClass('error');
			$('.errorTitle').remove();
		}

		// Error if description is empty
		var descriptionElement = Indeko.ImageMap.elemDescription;
		if ($.isEmptyObject(descriptionElement.val())) {
			descriptionElement.addClass('error');
			if ($('.errorDescription').length === 0) {
				descriptionElement.after('<p class="errorDescription labelAreaErrorText"><label>Das Feld „Beschreibung” ist erforderlich.</label></p>');
			}
			descriptionElement.focus();
			l_bIsValid = false;
		} else {
			descriptionElement.removeClass('error');
			$('.errorDescription').remove();
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

		// if all knowledge map values are valid
		if (l_bIsValid) {

			// update map areas before saving
			myimgmap.fireEvent('onHtmlChanged', myimgmap.getMapHTML());
			Indeko.MorphBox.reset();

			// restore the search block to the state prior to editing / creating the knowledge map
			localStorage["searchValues"] = Indeko.MorphBox.searchJson;

			// add selected morphological elements of each drawn knowledge map area as tags
			var jsonString = '';
			Indeko.ImageMap.elemTags.val(-1); // clear tags field
			$.each(allAreas, function (index, area) {
				if (!$.isEmptyObject(area.json)) {
					jsonString = decodeURI(area.json);
					var searchObject = JSON.parse(jsonString);

					// add tags to select field
					$.each(searchObject.morphological, function (index, value) {
						Indeko.ImageMap.elemTags.find('option[value=' + value + ']').attr('selected', 'selected');
					});
				}
			});
		}

		return l_bIsValid;

	});
};


/**
 * Updates search block on click on map areas.
 */
Indeko.ImageMap.hookMapAreas = function () {
	$("map area").click(function () {
			jsonString = decodeURI($(this).attr('data-json'));
			localStorage["searchValues"] = jsonString;
		}
	)
};

/**
 * Adds a new area to the image map.
 */
Indeko.ImageMap.addNewArea = function () {
	myimgmap.addNewArea();
};

/**
 * Hide image map text section (marked areas text field).
 */
Indeko.ImageMap.hideElements = function() {
	$("#edit-field-markierte-bereiche").hide();
};

/**
 * Adds the tooltip to knowledge map areas.
 */
Indeko.ImageMap.addTooltip = function() {
	
	$('area').qtip({
		content: {
			show: {
				delay: 1
			}
		},
		my: 'left',
		position: {
			target: 'mouse',
			adjust: {
				x: 30, y: 0
			}
		},

		style: {
			tip: false
		}
	});
};


/**
 * Toggles knowledge map areas highlighting.
 * Style of highlighting is set in module  jq_maphilight (ATLAS version). [ID 103]
 */
Indeko.ImageMap.hookButtonHighlighting = function() {

	var btn = Indeko.ImageMap.elemButtonHighlight;
    var mapAreas = $('map area');
    var options = mapAreas.data('maphilight') || {};




    // Toggles button text and class
    function buttonToggle() {
        if(btn.hasClass("areashow")) {
            btn.removeClass("areashow").addClass("areahide");
            btn.text(Drupal.settings.form_wissenskarte_module.stringAreaHide);
        } else if(btn.hasClass("areahide")) {
            btn.removeClass("areahide").addClass("areashow");
            btn.text(Drupal.settings.form_wissenskarte_module.stringAreaShow);
        }
    }

    // Adjust the button if jq_maphilight (ATLAS version) module is set to always display map areas
    if (Drupal.settings.jq_maphilight.alwaysOn === "true") {
        buttonToggle();
	}

	btn.click(function() {
		if(btn.hasClass("areashow")) {
            buttonToggle();
            // enable highlighting
            options.alwaysOn = !options.alwaysOn;
            options.fill = true;
            options.stroke = true;
            mapAreas.data('maphilight', options).trigger('alwaysOn.maphilight');

        } else if(btn.hasClass("areahide")) {
            buttonToggle();
            // disable highlighting
            options.alwaysOn = !options.alwaysOn;
            options.fill = !options.fill;
            options.stroke = !options.stroke;
            mapAreas.data('maphilight', options).trigger('alwaysOn.maphilight');
        }
	});
};

var entityMap = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
};

function escapeHtml(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return entityMap[s];
	});
}

/* todo com, function copied from imgmap */
imgmap.prototype.getMapInnerHTML = function(flags) {
	var html, coords;
	html = '';
	//foreach area properties
	for (var i=0, le = this.areas.length; i<le; i++) {
		if (this.areas[i]) {
			if (this.areas[i].shape && this.areas[i].shape != 'undefined') {
				coords = this.areas[i].lastInput;
				if (flags && flags.match(/noscale/)) {
					//for preview use real coordinates, not scaled
					var cs = coords.split(',');
					for (var j=0, le2 = cs.length; j<le2; j++) {
						cs[j] = Math.round(cs[j] * this.globalscale);
					}
					coords = cs.join(',');
				}
				html+= '<area shape="' + this.areas[i].shape + '"' +
					' alt="' + encodeURI(this.areas[i].aalt) + '"' +
					' title="' + encodeURI(this.areas[i].atitle) + '"' +
					' id="' + this.areas[i].id + '"' +
					' coords="' + coords + '"' +
					' href="' +	this.areas[i].ahref + '"' +
					'data-json="' + this.areas[i].json + '"' +
					' target="' + this.areas[i].atarget + '" />';
			}
		}
	}
	//alert(html);
	return html;
};

// todo check comment
/**
 *	Sets the coordinates according to the given HTML map code or DOM object.
 *	@author	Adam Maschek (adam.maschek(at)gmail.com)
 *	@date	2006-06-07 11:47:16
 *	@param	map	DOM object or string of a map you want to apply.
 *	@return	True on success
 */
imgmap.prototype.setMapHTML = function(map) {
	if (this.viewmode === 1) {return;}//exit if preview mode

	this.fireEvent('onSetMap', map);
	//this.log(map);
	//remove all areas
	this.removeAllAreas();
	//console.log(this.areas);

	var oMap;
	if (typeof map == 'string') {
		var oHolder = document.createElement('DIV');
		oHolder.innerHTML = map;
		oMap = oHolder.firstChild;
	}
	else if (typeof map == 'object') {
		oMap = map;
	}
	if (!oMap || oMap.nodeName.toLowerCase() !== 'map') {return false;}
	this.mapname = oMap.name;
	this.mapid   = oMap.id;
	var newareas = oMap.getElementsByTagName('area');
	var shape, coords, href, alt, title, target, id, json;
	for (var i=0, le = newareas.length; i<le; i++) {
		shape = coords = href = alt = title = target = '';

		id = this.addNewArea();//btw id == this.currentid, just this form is a bit clearer

		shape = this._normShape(newareas[i].getAttribute('shape', 2));

		this.initArea(id, shape);

		if (newareas[i].getAttribute('coords', 2)) {
			//normalize coords
			coords = this._normCoords(newareas[i].getAttribute('coords', 2), shape);
			this.areas[id].lastInput = coords;
			//for area this one will be set in recalculate
		}

		href = newareas[i].getAttribute('href', 2);
		// FCKeditor stored url to prevent mangling from the browser.
		var sSavedUrl = newareas[i].getAttribute( '_fcksavedurl' );
		if (sSavedUrl) {
			href = sSavedUrl;
		}
		if (href) {
			this.areas[id].ahref = href;
		}

		alt = newareas[i].getAttribute('alt');
		if (alt) {
			this.areas[id].aalt = alt;
		}

		title = newareas[i].getAttribute('title');
		if (!title) {title = alt;}
		if (title) {
			this.areas[id].atitle = title;
		}

		json = newareas[i].getAttribute('data-json');
		if (json) {
			this.areas[id].json = json;
		}

		target = newareas[i].getAttribute('target');
		if (target) {target = target.toLowerCase();}
//		if (target == '') target = '_self';
		this.areas[id].atarget = target;

		this._recalculate(id, coords);//contains repaint
		this.relaxArea(id);

		this.fireEvent('onAreaChanged', this.areas[id]);

	}//end for areas
	this.fireEvent('onHtmlChanged', this.getMapHTML());
	return true;
};