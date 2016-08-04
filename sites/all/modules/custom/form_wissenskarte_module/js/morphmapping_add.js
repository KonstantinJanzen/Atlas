// globals
var myimgmap = {};
$ = jQuery;
var ViewMode = true;


var fieldset = document.createElement("fieldset");
var legend = document.createElement("legend");
legend.innerText = "Bild auswählen";

var imagemap = document.getElementById("edit-field-markierte-bereiche");
var div = document.getElementById("edit-field-wk-bild");
var parent = div.parentNode;

fieldset.appendChild(legend);
fieldset.appendChild(div);

parent.insertBefore(fieldset, imagemap);

var chooseDescription = document.createElement("span");
chooseDescription.innerText = "Bild vom Computer auswählen: ";

var acceptImage = document.createElement("span");
acceptImage.innerText = "Bild akzeptieren und hochladen: ";

var upload = document.getElementById("edit-field-wk-bild-und-0-upload");
var fileChoose = document.getElementById("edit-field-wk-bild-und-0-upload-button");

$("#edit-field-wk-bild-und-0-upload", div).before(chooseDescription);
$("#edit-field-wk-bild-und-0-upload-button", div).before(acceptImage);

var count = 1;
var observer = new MutationObserver(function(mutations) {
	if (count >= 2) {
		observer.disconnect();
	}
	if ($('#field-markierte-bereiche-add-more-wrapper').length > 0) ViewMode = false;
	if ($('.field-name-field-markierte-bereiche').length > 0) ViewMode = true;

	if (document.getElementsByClassName('image-style-wissenkarte')){

		var l_oImageEdit = document.getElementsByClassName('image-style-wissenkarte');
		var l_oImageView = document.getElementsByClassName('image-style-none');

		if (l_oImageEdit.length > 0){
			// EditMode
			myimgmap = {};

			var loadedValue = $("#field-markierte-bereiche-add-more-wrapper :input").val();
			//if (loadedValue != "") $(loadedValue).appendTo($('.image-preview'));

			instanciate_maschek_image(document.getElementsByClassName("image-preview")[0]);
			myimgmap.setMapHTML(loadedValue);
			myimgmap.addNewArea();
		} else if (l_oImageView.length > 0) {
			// ViewMode
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

			$('area').click(function(e){
				var message = "ugr " + $(e.target).attr('ugr');
				message += " bran " + $(e.target).attr('bran');
				alert(message);
			})
		}
	}
	count++;
});

var config = { subtree: true, childList: true };
observer.observe(div, config);