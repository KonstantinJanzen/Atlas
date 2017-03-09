INTRODUCTION
------------

Dynamically creates node creation links (if the user has sufficient permissions) and adds them to the user menu block.


REQUIREMENTS
------------

This module requires no additional modules.


INSTALLATION
------------

This module can be installed like any other Drupal module:
 1. Place it in the custom modules directory for your site (e.g. sites/all/modules/custom).
 2. Enable it on the 'admin/modules' page.
 3. Set the content types that should be available as a clickable element on the configuration page
    (admin/config/content/node_creation_links).
 4. This module only extends the "User menu" block.
    This block should be assigned to a visible region in structure > blocks settings.


CONFIGURATION
-------------

Set the content types that should be available as a clickable element on the configuration page
(admin/config/content/node_creation_links). By default no content types are selected. Nothing is added to the
user menu block if no content types are set.

Check user permissions if you set a content type but no link gets created. Links are only created for a user if he has
'create' permissions for the configured content types.