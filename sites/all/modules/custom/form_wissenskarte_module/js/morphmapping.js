$ = jQuery;
//Create a Namespace for Indeko javascript objects (no objects in global namespace)
var Indeko = Indeko || {};
var props = [];

var ValidationResult = function() {
	var l_oValidationResult = {
		isTitelValid: false,
		messageTitel: "Bitte geben Sie der Kontur einen Titel um fortzufahren.",
		isAreaValid: false,
		messageArea: "Bitte zeichnen Sie zuerst eine Kontur im Bild ein.",
		isMorphboxValid: false,
		messageMorphbox: "Bitte weisen Sie der Kontur Inhalte aus dem Portal zu.",

		l_oInputTitel: {}
	};

	return l_oValidationResult;
}


function  initView(ViewMode) {
//$('#field-markierte-bereiche-add-more-wrapper').hide();
//$('.field-name-field-markierte-bereiche').hide();
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
			$("#edit-field-markierte-bereiche").hide();
			$(".form-item.form-type-textfield.form-item-title").hide();

			var loadedValue = $('#edit-field-markierte-bereiche-und-0-value').val();
			//if (loadedValue != "") $(loadedValue).appendTo($('.image-preview'));

			instanciate_maschek_image(document.getElementsByClassName("image-preview")[0]);
			instanciateAreaDescription();
			Indeko.MorphBox.loadDummy();
			myimgmap.setMapHTML(loadedValue);
            Indeko.MorphBox.update(myimgmap.currentid);
			Indeko.ImageMap.scale(l_oImageEdit); // scale areas
			//myimgmap.addNewArea();
		} else if (l_oImageView.length > 0) {
			// ViewMode
			$('.field-name-field-markierte-bereiche').hide();
			var parent = $('.image-style-none').parent();
			var div = $(parent[0]).parent();
			myimgmap = {};
			//instanciate_maschek_image(div[0]);

			// load areas
			var loadedValue = $($(".field-name-field-markierte-bereiche").children()[1]).text();
			var l_oPicContainer = $('.field-type-image').find('div');
			if (loadedValue != "" && l_oPicContainer.length === 1) $(loadedValue).appendTo(l_oPicContainer);
			// shows the tooltip
			$('area').qtip({
				show: {
					delay: 1
				}
			});

			//lese id aus map
			if (l_oPicContainer.find('map').length === 1) {
				var l_sId = '#' + l_oPicContainer.find('map').attr('id');
				l_oPicContainer.find('img').attr('USEMAP', l_sId);
			}
		}
	}
	
	return result;
}

function instanciate_maschek_image(p_oPic){
	myimgmap = new imgmap({
		mode : "editor",
		button_container: document.getElementById('button_container'),
		imgroot: 'example1_files/',
		buttons : ['add','delete','preview','html'],
		custom_callbacks : {
			'onAddArea'       : function(id)  {gui_addArea(id);},//to add new form element on gui
			'onRemoveArea'    : function(id)  {gui_removeArea(id);},//to remove form elements from gui
			'onAreaChanged'   : function(obj) {gui_areaChanged(obj);},// update form elements with selected area values
			'onSelectArea'    : function(obj) {gui_selectArea(obj);},//to select form element when an area is clicked
			'onHtmlChanged'   : function(str) {gui_htmlChanged(str);}// to update "markierte Bereiche"
		},
		pic_container: p_oPic,//elements on your page
		html_container: p_oPic,
		status_container: p_oPic,
		form_container: p_oPic,
		bounding_box : true,
		label : "%t"
	});

	myimgmap.useImage(p_oPic);
}

/**
 *	Get the map areas part only of the current imagemap.
 *	@see	#getMapHTML
 *	@author	adam
 *	@param	flags	Currently ony 'noscale' used to prevent scaling of coordinates in preview mode.
 *	@return	The generated map code without the map wrapper.
 */
imgmap.prototype.getMapInnerHTML = function(flags) {
	var html, coords;
	html = '';
	var l_aUnternehmensgr = $('#edit-field-unternehmensg-er-und').val();

	var myCurrentId = myimgmap.currentid;
	if (myimgmap.currentid >= this.areas.length - 1 && this.areas.length > 1)
		myCurrentId--;

	//foreach area properties
	for (var i=0; i < this.areas.length; i++) {
		if (this.areas[i]) {
			//if (this.areas[i].shape && this.areas[i].shape != 'undefined') {
			coords = this.areas[i].lastInput;
			if (typeof coords == 'undefined' || coords == null) continue;

			if (flags && flags.match(/noscale/)) {
				//for preview use real coordinates, not scaled
				var cs = coords.split(',');
				if (Indeko.ImageMap.scalingFactor === 1) {
					for (var j=0, le2 = cs.length; j<le2; j++) {
						cs[j] = Math.round(cs[j] * this.globalscale);
					}
				// if image has been scaled, rescale area coordinates to match original image size
				} else {
					for (var j=0, le2 = cs.length; j<le2; j++) {
						cs[j] = Math.round(cs[j] * (1 / Indeko.ImageMap.scalingFactor));
					}
				}
				coords = cs.join(',');
			}

			html+= '<area shape="' + this.areas[i].shape + '"' +
				' alt="' + this.areas[i].aalt + '"' +
				' title="' + this.areas[i].atitle + '"' +
				' id="' + this.areas[i].id + '"' +
				' coords="' + coords + '"' +
				' href="' +	this.areas[i].ahref + '"' +
				' target="' + this.areas[i].atarget + '" />';
		}
	}

	return html;
};

// wenn currentid ge�ndert wird, sollen die Combos geert werden. Remove loadselect from imfmap and morphmapping
function LoadSelect(newCurrentId){
	// $('#edit-field-unternehmensg-er-und').val(-1);
	// $('#edit-field-branche-und').val(-1);
    //
	// var l_aCanvas = $('canvas');
    //
	// var l_nCurrentId = newCurrentId;
	// if (newCurrentId == l_aCanvas.length) l_nCurrentId--;
    //
	// for (var i=0; i < l_aCanvas.length; i++) {
	// 	var l_sId = l_aCanvas[i].id;
	// 	var lastChar = l_sId[l_sId.length-1];
    //
	// 	if (lastChar == myimgmap.currentid){
	// 		// Unternehmensgr��e
	// 		var l_sSelected = $(l_aCanvas[i]).attr('ugr');
	// 		if (typeof l_sSelected != 'undefined' && l_sSelected != null ){
	// 			var l_aSelected = l_sSelected.split(',');
    //
	// 			$('#edit-field-unternehmensg-er-und').val(l_aSelected);
	// 		}
    //
	// 		// Branche
	// 		l_sSelected = $(l_aCanvas[i]).attr('bran');
	// 		if (typeof l_sSelected != 'undefined' && l_sSelected != null ){
	// 			var l_aSelected = l_sSelected.split(',');
    //
	// 			$('#edit-field-branche-und').val(l_aSelected);
	// 		}
	// 	}
	// }

	return false;
};

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

		if (l_oResult.isTitelValid === true && l_oResult.isMorphboxValid === true && l_oResult.isAreaValid === true) {
            myimgmap.addNewArea();      // add new area on validation success...
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
	$('<option value="rect">Recheck</option>').appendTo(l_oSelect);
	$('<option value="circle">Kreis</option>').appendTo(l_oSelect);
	$('<option value="poly">Polygon</option>').appendTo(l_oSelect);
	l_oSelect.val("rect");

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
	//myimgmap.addEvent(props[id].getElementsByTagName('input')[1],  'keydown', gui_cb_keydown);
	//myimgmap.addEvent(props[id].getElementsByTagName('input')[2],  'keydown', gui_coords_keydown);
	myimgmap.addEvent($(props[id]).find('input[name=img_alt]')[0],  'change', gui_input_change);
	myimgmap.addEvent($(props[id]).find('select[name=img_shape]')[0], 'change', gui_input_change);
	/*if (myimgmap.isSafari) {
		//need these for safari
		myimgmap.addEvent(props[id].getElementsByTagName('select')[0], 'change', gui_row_click);
	}*/

	//set shape as nextshape if set
	if (myimgmap.nextShape) {$(props[id]).find('select[name=img_shape]').val(myimgmap.nextShape);}
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
			var lastid = pprops.lastChild.aid;
			props[id] = null;
			try {
				gui_row_select(lastid, true);
				myimgmap.currentid = lastid;
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

        validateHighlight(l_oResult);
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
		if (area.shape)  {$(props[id]).find('select[name=img_shape]').val(area.shape);}
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

/*
 * Variables and functions surrounding the morphological box.
 */
Indeko.MorphBox = {
	// DOM element that contains the representation of the morphological box.
	element : $('#morphological-box'),

	// array represention of the selected morphological box items (first element fulltext string, following items taxonomy IDs)
	dataArray : [] // e.g. ["Kompetenz", "38", "40"]
};

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


Indeko.ImageMap = {
	scalingFactor: 1
};

/*
 * Scales image map area coordinates in add and edit mode to the current displayed width in the browser if the image
 * width differs from it's original width.
 * (Drupal automatically scales image width depending on browser width and page (image width in view node can be
 * different from width in add node can be different from width in edit node).
 *
 * @param domImage DOM element containing the image.
 */
Indeko.ImageMap.scale = function(domImage) {
	var image = $(domImage).get(0);

	if (image.width !== image.naturalWidth) {
		Indeko.ImageMap.scalingFactor = image.width / image.naturalWidth;
		myimgmap.scaleAllAreas(Indeko.ImageMap.scalingFactor);
	}
};