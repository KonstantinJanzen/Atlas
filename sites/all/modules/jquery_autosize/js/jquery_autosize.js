/**
 * Javascript for applying JQuery Autosize to textareas.
 *
 * @param {Object} $
 */

(function ($) {

Drupal.behaviors.autosize = {
  attach: function(context) {
    // Allow all textareas to autosize.
    $('textarea', context).not('.autosize-processed').autosize().addClass('autosize-processed');
  }
}

})(jQuery);
