INTRODUCTION
------------

Makes HTML image maps responsive, so that they automatically stay scaled to the size of the image they are
attached to. It detects the window being resized and updates the co-ordinates of the image map accordingly.


REQUIREMENTS
------------

This module requires the following modules:

 * libraries (https://www.drupal.org/project/libraries): To load external js libraries.


RECOMMENDED MODULES
-------------------

 * form_wissenskarte_module: To let anybody create image / knowledge maps.


INSTALLATION
------------

This module can be installed like any other Drupal module:
 1. Place it in the custom modules directory for your site (e.g. sites/all/modules/custom).
 2. Download the Image Map resize plugin from https://github.com/davidjbradshaw/image-map-resizer
 3. Extract the imageMapResizer.min.js file into the sites/all/libraries/image-map-resizer/ directory.
 4. Enable it on the 'admin/modules' page.
 5. Set the content type that contains image maps and should be resized on the
    configuration page 'admin/config/content/imagemap_resizer'.


CONFIGURATION
-------------

The status of the imageMapResizer js plugin is displayed on the configuration page (admin/config/imagemap_resizer).
Set the content type the module and js plugin should be working on.

