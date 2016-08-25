function  initView(ViewMode) {
	//window.onload = function(){
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
			// EditMode
			myimgmap = {};
			$("#edit-field-markierte-bereiche").hide();
			$(".form-item.form-type-textfield.form-item-title").hide();

			var loadedValue = $("#field-markierte-bereiche-add-more-wrapper :input").val();
			//if (loadedValue != "") $(loadedValue).appendTo($('.image-preview'));

			instanciate_maschek_image(document.getElementsByClassName("image-preview")[0]);
			myimgmap.setMapHTML(loadedValue);
			myimgmap.addNewArea();
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

			//lese id aus map
			if (l_oPicContainer.find('map').length === 1) {
				var l_sId = '#' + l_oPicContainer.find('map').attr('id');
				l_oPicContainer.find('img').attr('USEMAP', l_sId);
			}

			// $('area').click(function(e){
			// 	var message = "ugr " + $(e.target).attr('ugr');
			// 	message += " bran " + $(e.target).attr('bran');
			// 	alert(message);
			// })
		}
	}
	
	return result;
//}
}

function instanciate_maschek_image(p_oPic){
	myimgmap = new imgmap({
		mode : "editor",
		button_container: document.getElementById('button_container'),
		imgroot: 'example1_files/',
		buttons : ['add','delete','preview','html'],
		custom_callbacks : {},
		pic_container: p_oPic,//elements on your page
		html_container: p_oPic,
		status_container: p_oPic,
		form_container: p_oPic,
		bounding_box : true
	});

	var l_oUnternehmensgr  = document.getElementById('edit-field-unternehmensg-er-und');
	if (l_oUnternehmensgr != null && l_oUnternehmensgr.length != 0) {
		l_oUnternehmensgr.addEventListener('change', function(e){
			var l_aCanvas = $('canvas');

			var l_nCurrentId = myimgmap.currentid;
			if (myimgmap.currentid == l_aCanvas.length) l_nCurrentId--;

			for (var i=0; i < l_aCanvas.length; i++) {
				var l_sId = l_aCanvas[i].id;
				var lastChar = l_sId[l_sId.length-1];

				if (lastChar == l_nCurrentId){
					var l_aUnternehmensgr = $('#edit-field-unternehmensg-er-und').val();
					$(l_aCanvas[i]).attr('ugr', l_aUnternehmensgr.toString());
				}
			}

			document.getElementById('edit-field-markierte-bereiche-und-0-value').value = myimgmap.getMapHTML('noscale');
		});
	}

	var l_oBranche  = document.getElementById('edit-field-branche-und');
	if (l_oBranche != null && l_oBranche.length != 0) {
		l_oBranche.addEventListener('change', function(e){
			var l_aCanvas = $('canvas');

			var l_nCurrentId = myimgmap.currentid;
			if (myimgmap.currentid == l_aCanvas.length) l_nCurrentId--;

			for (var i=0; i < l_aCanvas.length; i++) {
				var l_sId = l_aCanvas[i].id;
				var lastChar = l_sId[l_sId.length-1];

				if (lastChar == l_nCurrentId){
					var l_aBranche = $('#edit-field-branche-und').val();
					$(l_aCanvas[i]).attr('bran', l_aBranche.toString());
				}
			}

			document.getElementById('edit-field-markierte-bereiche-und-0-value').value = myimgmap.getMapHTML('noscale');
		});
	}

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
				for (var j=0; j < cs.length; j++) {
					cs[j] = Math.round(cs[j] * this.globalscale);
				}
				coords = cs.join(',');
			}

			var l_aUnternehmensgr = typeof $(this.areas[i]).attr('ugr') != 'undefined' ? $(this.areas[i]).attr('ugr') : "";
			var l_aBranche = typeof $(this.areas[i]).attr('bran') != 'undefined' ? $(this.areas[i]).attr('bran') : "";

			html+= '<area shape="' + this.areas[i].shape + '"' +
				' alt="' + this.areas[i].aalt + '"' +
				' title="' + this.areas[i].atitle + '"' +
				' id="' + this.areas[i].id + '"' +
				' ugr="' + l_aUnternehmensgr + '"' +
				' bran="' + l_aBranche + '"' +
				' coords="' + coords + '"' +
				' href="' +	generateSearchString(this.areas[i]) + '"' +
				' target="' + this.areas[i].atarget + '" />';

		}
	}

	return html;

//alert(html);

	/*var html = "";
	 var l_aCanvas = $('canvas');
	 for (var i=0; i < this.areas.length; i++) {
	 html += $($('canvas')[i]).prop('outerHTML');
	 }*/
};

// wenn currentid ge�ndert wird, sollen die Combos geert werden
function LoadSelect(newCurrentId){
	$('#edit-field-unternehmensg-er-und').val(-1);
	$('#edit-field-branche-und').val(-1);

	var l_aCanvas = $('canvas');

	var l_nCurrentId = newCurrentId;
	if (newCurrentId == l_aCanvas.length) l_nCurrentId--;

	for (var i=0; i < l_aCanvas.length; i++) {
		var l_sId = l_aCanvas[i].id;
		var lastChar = l_sId[l_sId.length-1];

		if (lastChar == myimgmap.currentid){
			// Unternehmensgr��e
			var l_sSelected = $(l_aCanvas[i]).attr('ugr');
			if (typeof l_sSelected != 'undefined' && l_sSelected != null ){
				var l_aSelected = l_sSelected.split(',');

				$('#edit-field-unternehmensg-er-und').val(l_aSelected);
			}

			// Branche
			l_sSelected = $(l_aCanvas[i]).attr('bran');
			if (typeof l_sSelected != 'undefined' && l_sSelected != null ){
				var l_aSelected = l_sSelected.split(',');

				$('#edit-field-branche-und').val(l_aSelected);
			}
		}
	}

	return false;
};

// TODO
// Generate search string to search for several taxonomy ids (tid) using Apache Solr
// quick and dirty test
function generateSearchString(area) {
	var baseSolrSearchUrl = Drupal.settings.basePath + "search/site/";
    var solrSearchQuery = "";

    if (typeof $(area).attr('ugr') != 'undefined') {
        solrSearchQuery += $(area).attr('ugr');
        solrSearchQuery = solrSearchQuery.replace(/_none/g,"").replace(/,_none/g,"").replace(/,,/g,",");
    }

    if (typeof $(area).attr('bran') != 'undefined') {
        if (solrSearchQuery != "") {
            solrSearchQuery += "," + $(area).attr('bran');
            solrSearchQuery = solrSearchQuery.replace(/_none/g,"").replace(/,_none/g,"").replace(/,,/g,",");
        }
    }

    if (solrSearchQuery != "") {
        solrSearchQuery = "tid:" + solrSearchQuery;
        solrSearchQuery = solrSearchQuery.replace(/,/g, " AND tid:");
    } else {
        solrSearchQuery = "*";
    }

    var solrSearchUrl = baseSolrSearchUrl + solrSearchQuery;
    return solrSearchUrl;

};

var props = [];

function instanciateAreaDescription(){
	$('fieldset').prepend('<input type="submit" class="addAreaButton" value="">');
	$('fieldset').prepend('<div id="areadescription"></div>');
	gui_addArea(1);
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
	/*myimgmap.addEvent(props[id], 'mouseover', gui_row_mouseover);
	myimgmap.addEvent(props[id], 'mouseout',  gui_row_mouseout);
	myimgmap.addEvent(props[id], 'click',     gui_row_click);*/

	$('<input type="text"  name="img_id" class="img_id" value="' + id + '" readonly="1"/>').appendTo(props[id]);
	$('<input type="radio" name="img_active" class="img_active" id="img_active_'+id+'" value="'+id+'" hidden>').appendTo(props[id]);

	var l_oSelect = $('<select name="img_shape" class="img_shape">').appendTo(props[id]);
	$('<option value="rect">Recheck</option>').appendTo(l_oSelect);
	$('<option value="circle">Kreis</option>').appendTo(l_oSelect);
	$('<option value="poly">Polygon</option>').appendTo(l_oSelect);
	l_oSelect.val("rect");

	$('<Label class="img_label">Titel:</Label>').appendTo(props[id]);
	$('<input type="text" name="img_alt" class="img_alt" value="">').appendTo(props[id]);

	$('<input type="submit" class="removeAreaButton" value="">').appendTo(props[id]);

	//hook more event handlers to individual inputs
	/*myimgmap.addEvent(props[id].getElementsByTagName('input')[1],  'keydown', gui_cb_keydown);
	myimgmap.addEvent(props[id].getElementsByTagName('input')[2],  'keydown', gui_coords_keydown);
	myimgmap.addEvent(props[id].getElementsByTagName('input')[2],  'change', gui_input_change);
	myimgmap.addEvent(props[id].getElementsByTagName('input')[3],  'change', gui_input_change);
	myimgmap.addEvent(props[id].getElementsByTagName('input')[4],  'change', gui_input_change);
	myimgmap.addEvent(props[id].getElementsByTagName('select')[0], 'change', gui_input_change);
	myimgmap.addEvent(props[id].getElementsByTagName('select')[1], 'change', gui_input_change);
	if (myimgmap.isSafari) {
		//need these for safari
		myimgmap.addEvent(props[id].getElementsByTagName('select')[0], 'change', gui_row_click);
		myimgmap.addEvent(props[id].getElementsByTagName('select')[1], 'change', gui_row_click);
	}

	//set shape as nextshape if set
	if (myimgmap.nextShape) {props[id].getElementsByTagName('select')[0].value = myimgmap.nextShape;}
	//alert(this.props[id].parentNode.innerHTML);*/
	gui_row_select(id, true);
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
