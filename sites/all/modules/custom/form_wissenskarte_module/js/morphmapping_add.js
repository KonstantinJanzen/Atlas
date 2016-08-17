$ = jQuery;

/*
 * Create a Namespace for Indeko javascript objects (no objects in global namespace)
 */
var Indeko = Indeko || {};

Indeko.AddForm = (function() {

	var module = {};
	var imageDiv = null;

	/*
	 * Modify the html elements to fit the mockups
	 */
	function modifyControls() {

		$("#edit-field-markierte-bereiche").hide();
		$("#morphological-box").hide();

		var fieldset = document.createElement("fieldset");
		var legend = document.createElement("legend");
		legend.innerText = "Bild hochladen";

		var imagemap = document.getElementById("edit-field-markierte-bereiche");
		imageDiv = document.getElementById("edit-field-wk-bild");
		var parent = imageDiv.parentNode;

		fieldset.appendChild(legend);
		fieldset.appendChild(imageDiv);

		parent.insertBefore(fieldset, imagemap);

		$("#edit-field-wk-bild-und-0-upload").wrap("<div>Bild vom Computer auswählen:  </div>");
		$("#edit-field-wk-bild-und-0-upload-button").wrap("<div>Bild akzeptieren und hochladen: </div>");
	}

	/*
	 * Add Maschek Editor to the image and show the morphological box
	 */
	function addEditor() {
		initView(true);
		// if no node title is set use the filename as title
		var filename = $(".file").find("a").text();
		if (!$("#edit-title").val()) {
			$("#edit-title").val(filename);
		}

		$("#edit-field-markierte-bereiche").show();
		$("#morphological-box").show();
	}

	module.init = function() {

		modifyControls();

		/*
		 * The observer looks for modification inside the drupal
		 * standard image field. If drupal modifies the html via
		 * AJAX/JS, the observer fires and provides more information
		 * about the DOM manipulation in the mutations parameter.
		 */
		var observer = new MutationObserver(function(mutations) {

			var imageAdded = [];

			/*
			 * Drupal modifies the DOM multiple times, so it
			 * checks each time if the image was added...
			 */
			if(mutations[mutations.length-1].addedNodes.length > 0)
			{
				imageAdded = mutations[mutations.length-1].addedNodes[0].getElementsByClassName('image-style-wissenkarte');
			}


			if(imageAdded.length > 0) {
				/*
				 * If the image tag was added, attach a load function.
				 * This function is called after the image tag has loaded
				 * the actual image data.
				 *
				 * Todo: the observer fires 3 times, the last two times the mutations
				 * Object contains the img tag, hence this if branch is called twice.
				 * This is no problem, because the onload function is attached two times,
				 * but the image tag calls it only one time (when the image is loaded).
				 */
				imageAdded[0].onload = function() {
					addEditor();
				};
			}
		});

		var config = { subtree: true, childList: true };
		observer.observe(imageDiv, config);
	}

	return module;

})();

jQuery(document).ready(function() {

	Indeko.AddForm.init();

});





