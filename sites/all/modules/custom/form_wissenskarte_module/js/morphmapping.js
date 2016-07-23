// globals
var myimgmap = {};
$ = jQuery;

window.onload = function(){
	if (document.getElementsByClassName('image-style-wissenkarte')){
		
		var l_oImage = document.getElementsByClassName('image-style-wissenkarte');
		
		if (l_oImage.length > 0){
			myimgmap = {};
			instanciate_maschek_image();
		} 
	}
}

function instanciate_maschek_image(){
	myimgmap = new imgmap({
		mode : "editor",
		button_container: document.getElementById('button_container'),
		imgroot: 'example1_files/',
		buttons : ['add','delete','preview','html'],
		custom_callbacks : {},
		pic_container: document.getElementsByClassName("image-preview")[0],//elements on your page
		html_container: document.getElementsByClassName("image-preview")[0],
		status_container: document.getElementsByClassName("image-preview")[0],
		form_container: document.getElementsByClassName("image-preview")[0],
		bounding_box : true
	});
	
	var l_oUnternehmensgr  = document.getElementById('edit-field-unternehmensg-er-und')
	if (l_oUnternehmensgr.length != 0) {
		l_oUnternehmensgr.addEventListener('change', function(e){
			document.getElementById('edit-field-markierte-bereiche-und-0-value').value = myimgmap.getMapHTML('noscale');
			//$('#edit-field-unternehmensg-er-und').val()
		});
	}
	
	myimgmap.useImage(document.getElementsByClassName("image-preview")[0]);
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
	myimgmap.currentid
	
	var myCurrentId = myimgmap.currentid;
	if (myimgmap.currentid >= this.areas.length - 1 && this.areas.length > 1)
		myCurrentId--;
	
	//foreach area properties
	for (var i=0, le = this.areas.length; i<le; i++) {
		if (this.areas[i]) {
			//if (this.areas[i].shape && this.areas[i].shape != 'undefined') {
				coords = this.areas[i].lastInput;
				if (typeof coords == undefined || coords == null) continue;
				
				if (flags && flags.match(/noscale/)) {
					//for preview use real coordinates, not scaled
					var cs = coords.split(',');
					for (var j=0, le2 = cs.length; j<le2; j++) {
						cs[j] = Math.round(cs[j] * this.globalscale);
					}
					coords = cs.join(',');
				}
				if (this.areas[myCurrentId].id == this.areas[i].id){
					html+= '<area shape="' + this.areas[i].shape + '"' +
					' alt="' + this.areas[i].aalt + '"' +
					' title="' + this.areas[i].atitle + '"' +
					' id="' + this.areas[i].id + '"' +
					' ugr="' + l_aUnternehmensgr + '"' +
					' coords="' + coords + '"' +
					' href="' +	this.areas[i].ahref + '"' +
					' target="' + this.areas[i].atarget + '" />';
				} else {
					html+= '<area shape="' + this.areas[i].shape + '"' +
					' alt="' + this.areas[i].aalt + '"' +
					' title="' + this.areas[i].atitle + '"' +
					' id="' + this.areas[i].id + '"' +
					' coords="' + coords + '"' +
					' href="' +	this.areas[i].ahref + '"' +
					' target="' + this.areas[i].atarget + '" />';
				}
				
			//}
		}
	}
	//alert(html);
	return html;
};



