// Get all comment author info (e.g. "Submitted by admin on Thu, 25/08/2016 - 20:16") from comments section.
var comments = jQuery('#comments');
var authors = comments.find('.author-datetime > span');

// Get all comment author rating (e.g. 5 stars) from comments section.
var authorRating = comments.find('.fivestar-widget-static');

// Append author info to the corresponding rating.
authors.each(function(index) {
    jQuery(this).prepend('&nbsp;').appendTo(authorRating[index]);
});


/* Add CSS */

// Remove vertical space between ratings and comments.
jQuery('.form-item.form-type-item').css('margin-bottom', '0em');