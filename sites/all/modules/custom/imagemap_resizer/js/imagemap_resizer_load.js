(function ($) {
    Drupal.behaviors.imagemap_resizer = {
        attach: function (context, settings) {
            $('map').imageMapResize();
        }
    };
}(jQuery));
