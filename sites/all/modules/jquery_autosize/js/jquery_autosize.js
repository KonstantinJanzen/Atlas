/**
 * Javascript for applying JQuery Autosize to textareas.
 *
 * @param {Object} $
 */

(function ($) {

Drupal.behaviors.autosize = {
  attach: function(context) {
    // Allow all textareas to autosize.
    var textArea = $('textarea', context).not('.autosize-processed');
    autosize(textArea).addClass('autosize-processed');
  }
}

})(jQuery);
