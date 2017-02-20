INTRODUCTION
------------

Allows created elements of the user to be displayed in the user profile.


REQUIREMENTS
------------

This module requires no additional modules.
TODO font-awesome required cause of default icon '<i class='fa fa-file default' aria-hidden='true'></i>'


INSTALLATION
------------

This module can be installed like any other Drupal module:
 1. Place it in the custom modules directory for your site (e.g. sites/all/modules/custom).
 2. Enable it on the 'admin/modules' page.


CONFIGURATION
-------------

The module has no menu or modifiable settings.

Only the defined content types (by machine name) set in user_profile_elements_overview_user_view_alter() function are
displayed. Edit 'elements_overview_html(array('biblio', 'wissenskarte', 'projekt', 'analysereport', 'forschungsergebnis'))'
to display more content types.