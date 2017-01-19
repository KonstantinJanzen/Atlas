// Add JavaScript to page using Drupal behaviours.
(function ($) {
    Drupal.behaviors.jq_maphilight = {
        attach: function (context, settings) {
            var options = {
                fill: (settings.jq_maphilight.fill == 'true'),
                fillColor: settings.jq_maphilight.fillColor,
                fillOpacity: settings.jq_maphilight.fillOpacity,
                stroke: (settings.jq_maphilight.stroke == 'true'),
                strokeColor: settings.jq_maphilight.strokeColor,
                strokeOpacity: settings.jq_maphilight.strokeOpacity,
                strokeWidth: settings.jq_maphilight.strokeWidth,
                fade: (settings.jq_maphilight.fade == 'true'),
                alwaysOn: (settings.jq_maphilight.alwaysOn == 'true'),
                neverOn: (settings.jq_maphilight.neverOn == 'true'),
                groupBy: (settings.jq_maphilight.groupBy == 'true'),
                fillOpacityMouseover: settings.jq_maphilight.fillOpacityMouseover,
                strokeOpacityMouseover: settings.jq_maphilight.strokeOpacityMouseover
            };

            settings.jq_maphilight.options = options;

            if (settings.jq_maphilight.allMapsEnabled == 'true') {
                $('img[usemap]').maphilight(options);       // apply options to all image maps
            }
            else {
                $('.jq_maphilight').maphilight(options);    // apply options to image maps of class "jq_maphilight" only
            }

            // Use additional highlighting settings for mouseover if highlighting is always on.
                var mapAreas = $('map area');
                Drupal.behaviors.jq_maphilight.attachHover(mapAreas);
        }
    };

    // Use additional highlighting settings for mouseover if highlighting is set to always on.
    Drupal.behaviors.jq_maphilight.attachHover = function(selector) {
        if (Drupal.settings.jq_maphilight.alwaysOn == 'true') {
            selector.on("mouseover.maphilight", function () {
                var optionsMouseover = {};
                optionsMouseover.fillOpacity = Drupal.settings.jq_maphilight.fillOpacityMouseover;
                optionsMouseover.strokeOpacity = Drupal.settings.jq_maphilight.strokeOpacityMouseover;
                $(this).data('maphilight', optionsMouseover).trigger('alwaysOn.maphilight');
            });

            // Return to previous highlighting settings if the mouse leaves a map area.
            selector.on("mouseleave.maphilight", function () {
                var optionsMouseLeave = {};
                optionsMouseLeave.fillOpacity = Drupal.settings.jq_maphilight.fillOpacity;
                optionsMouseLeave.strokeOpacity = Drupal.settings.jq_maphilight.strokeOpacity;
                $(this).data('maphilight', optionsMouseLeave).trigger('alwaysOn.maphilight');
            });
        }
    }
})(jQuery);


