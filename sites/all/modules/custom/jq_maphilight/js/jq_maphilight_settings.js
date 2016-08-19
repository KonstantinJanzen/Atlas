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
                groupBy: (settings.jq_maphilight.groupBy == 'true')
            };

            if (settings.jq_maphilight.allMapsEnabled == 'true') {
                $('img[usemap]').maphilight(options);       // apply options to all image maps
            }
            else {
                $('.jq_maphilight').maphilight(options);    // apply options to image maps of class "jq_maphilight" only
            }

            // Use different highlighting settings for mouseover if highlighting is always on.
            var mapAreas = $('map area');
            if (settings.jq_maphilight.alwaysOn == 'true') {
                mapAreas.mouseover(function () {
                    var optionsMouseover = $(this).data('maphilight') || {};
                    optionsMouseover.fillOpacity = settings.jq_maphilight.fillOpacityMouseover;
                    optionsMouseover.strokeOpacity = settings.jq_maphilight.strokeOpacityMouseover;
                    $(this).data('maphilight', optionsMouseover).trigger('alwaysOn.maphilight');
                });

                // Return to previous highlighting settings if the mouse leaves a marked area.
                mapAreas.mouseleave(function () {
                    var optionsMouseover = $(this).data('maphilight') || {};
                    optionsMouseover.fillOpacity = options.fillOpacity;
                    optionsMouseover.strokeOpacity = options.strokeOpacity;
                    $(this).data('maphilight', optionsMouseover).trigger('alwaysOn.maphilight');
                });
            }
        }
    }
})(jQuery);


