/**
 * File: md-slider-field-configure.js
 * Author: MegaDrupal
 */
(function($) {
    Drupal.behaviors.md_slider_field = {
        attach: function(context, settings) {
            var previous;

            $(".md-slider-field-select", context).one("focus", function() {
                var $others = $(".md-slider-field-select", context).not(this),
                    $current = $(this);

                $others.each(function() {
                    if ($(this).val() != -1)
                        $("option[value=" + $(this).val() + "]", $current).hide();
                });

                previous = $(this).val();
            }).change(function() {
                var sliderId = $(this).val(),
                    sliderId = $(".fake-select-slider").find("option[value=" + sliderId + "]").data('sliderid');
                if (sliderId != -1) {
                    $(".configure-link", $(this).next()).attr("href", settings.basePath + settings.pathPrefix + "?q=admin/structure/md-slider/"+sliderId+"/configure");
                    $(".edit-link", $(this).next()).attr("href", settings.basePath + settings.pathPrefix + "?q=admin/structure/md-slider/"+sliderId+"/edit");
                    $(".field-suffix", $(this).parent()).show();
                }
                else {
                    $(".field-suffix", $(this).parent()).hide();
                }
            }).trigger("change");
        }
    }
})(jQuery);
