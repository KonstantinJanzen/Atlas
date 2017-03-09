INTRODUCTION
------------

Creates a link to export Apache Solr search results as a CSV file and adds an export link to the search results page.


REQUIREMENTS
------------

This module requires the following modules:

 * Apache Solr Search (https://www.drupal.org/project/apachesolr): This module uses the Apache Solr search capabilities
     to export search results as a csv file.
 * Font Awesome Icons (https://www.drupal.org/project/fontawesome): Just needed for the export icon as long as there is
     no new custom made icon.


INSTALLATION
------------

This module can be installed like any other Drupal module:
 1. Place it in the custom modules directory for your site (e.g. sites/all/modules/custom).
 2. Enable it on the 'admin/modules' page.
 3. Set the Apache Solr URL on the configuration page 'admin/config/search/morphsearch_csv_export'.


CONFIGURATION
-------------

To use the module in a live environment, the network accessible Apache Solr URL has to be set in the configuration menu
(admin/config/morphsearch_csv_export). During the installation an URL for local development will be set automatically.