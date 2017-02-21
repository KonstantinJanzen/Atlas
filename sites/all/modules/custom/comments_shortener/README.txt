INTRODUCTION
------------

The comments_shortener module makes adjustments to the standard Drupal comments behaviour (in particular for the
comments section of knowledge maps).
 1. Comments are displayed descending, newest comment first (Drupal core has no option to change this through
   comment settings page).
 2. Comments body is truncated to 50 characters and ellipsis is added that will show the full comment on click.
 3. User is redirected to the first comment page after posting a comment.


REQUIREMENTS
------------

This module requires no additional modules.


RECOMMENDED MODULES
-------------------

 * form_wissenskarte_module: The comments_shortener module adjustments are tailored to the knowledge map requirements,
   but can be run without it.


INSTALLATION
------------

This module can be installed like any other Drupal module:
 1. Place it in the custom modules directory for your site (e.g. sites/all/modules/custom).
 2. Enable it on the 'admin/modules' page.


CONFIGURATION
-------------

The module has no menu or modifiable settings. There is no configuration.

To redirect to first comment page after posting comment for all content, alter "comments_shortener_form_alter"
function ($form_id == 'comment_node_wissenskarte_form').

