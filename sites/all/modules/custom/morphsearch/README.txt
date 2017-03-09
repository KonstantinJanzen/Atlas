INTRODUCTION
------------

Dynamically creates a search block (fulltext search, dynamical content type search,
morphological search by taxonomy terms, publication search).


REQUIREMENTS
------------

This module requires the following modules:

 * Libraries (https://www.drupal.org/project/libraries)
 * jQuery Update (https://www.drupal.org/project/jquery_update)
 * Apache Solr Search (https://www.drupal.org/project/apachesolr): Module extends the Atlas content types' by
     additional information for the Solr index.
 * Chosen (https://www.drupal.org/project/chosen): Works even without chosen module, but the standard select elements
     are not styled for use in the search block
 * Font Awesome Icons (https://www.drupal.org/project/fontawesome): Just needed for the expand icon after morphological
     or publication search links.


RECOMMENDED MODULES
-------------------
 * Bibliography Module (https://www.drupal.org/project/biblio): To make use of the search block's publication search
     capabilities.
 * Taxonomy (Drupal core module): Used to build the morphological search.


INSTALLATION
------------

This module can be installed like any other Drupal module:
 1. Place it in the custom modules directory for your site (e.g. sites/all/modules/custom).
 2. Enable the 'taxonomy' Drupal core module.
 2. Enable it on the 'admin/modules' page.
 3. Set the content types that should be displayed in the search block's type search section
    on the configuration page (admin/config/search/morphsearch).
 4. (optional) Download the qTip2 jQuery plugin (http://qtip2.com/) and extract the file under sites/all/libraries/qtip.
    Otherwise no search syntax tooltips or notifications will be displayed.
 5. (optional) Install the biblio Drupal module to make use of the search block's publication search capabilities


CONFIGURATION
-------------

(TODO config menu Schnickschnack)

 * Configure content type search (admin/config/search/morphsearch)
 You can select which content types should be displayed in the search block's type search section.

 * Configure morphological search:
Create new taxonomy vocabulary for each morphological dimension to be displayed (admin/structure/taxonomy).
Use prefix 'tax_morph_m_' for dimensions (taxonomy vocabularies) that allow multi-select, use prefix 'tax_morph_' for single-select.

 * Configure publication search:
Install biblio module and publication search data (author, year, publisher, ...) will be made available for search automatically.