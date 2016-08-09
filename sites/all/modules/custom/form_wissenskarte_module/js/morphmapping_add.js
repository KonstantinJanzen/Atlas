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

	initView();

	// if no node title is set use the filename as title
	var filename = $(".file").find("a").text();
	if (!$("#edit-title").val()) {
		$("#edit-title").val(filename);
	}

	count++;
});

var config = { subtree: true, childList: true };
observer.observe(div, config);