-- SUMMARY --
Dynamically creates a search block in the right sidebar (fulltext search, dynamical content type search,
morphological search by taxonomy terms, publication search).


-- INSTALLATION --

1. Install the morphsearch Drupal module as you would any Drupal module.
2. (optional) Download the qTip2 jQuery plugin (http://qtip2.com/) and extract the file under sites/all/libraries/qtip.
    Otherwise no search syntax tooltips or notifications will be displayed.

3. (only necessary if the supplied atlas project 'solr_config' was not used on installation of the apachesolr Drupal module)
    Change morphsearch.js baseSolrSearchUrl to your Solr server or setup Solr server url 'search/site/'
4. (optional) Install the biblio Drupal module to make use of the search block's publication search capabilities

-- CONFIGURATION -- (TODO config menu Schnickschnack)

Configure content type search:
Edit morphsearch.module buildTypeSearchHtml(array('analysereport', 'biblio', 'forschungsergebnis', 'projekt', 'wissenskarte')).
Enter no parameter to display all content types in search block or enter array with content type machine names that should be displayed in the search block like in the example above.

Configure morphological search:
Create new taxonomy vocabulary for each morphological dimension to be displayed.
Use prefix 'tax_morph_m_' for dimensions (taxonomy vocabularies) that allow multi-select, use prefix 'tax_morph_' for single-select.

Configure publication search:
Install biblio module and publication search data (author, year, publisher, ...) will be made available for search automatically.