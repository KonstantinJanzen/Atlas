<?php

/**
 * @file
 * Process theme data.
 *
 * Use this file to run your theme specific implimentations of theme functions,
 * such preprocess, process, alters, and theme function overrides.
 *
 * Preprocess and process functions are used to modify or create variables for
 * templates and theme functions. They are a common theming tool in Drupal, often
 * used as an alternative to directly editing or adding code to templates. Its
 * worth spending some time to learn more about these functions - they are a
 * powerful way to easily modify the output of any template variable.
 *
 * Preprocess and Process Functions SEE: http://drupal.org/node/254940#variables-processor
 * 1. Rename each function and instance of "adaptivetheme_subtheme" to match
 *    your subthemes name, e.g. if your theme name is "footheme" then the function
 *    name will be "footheme_preprocess_hook". Tip - you can search/replace
 *    on "adaptivetheme_subtheme".
 * 2. Uncomment the required function to use.
 */


/**
 * Preprocess variables for the html template.
 */
/* -- Delete this line to enable.
function indeko7_preprocess_html(&$vars) {
  global $theme_key;

  // Two examples of adding custom classes to the body.

  // Add a body class for the active theme name.
  // $vars['classes_array'][] = drupal_html_class($theme_key);

  // Browser/platform sniff - adds body classes such as ipad, webkit, chrome etc.
  // $vars['classes_array'][] = css_browser_selector();

}
// */


/**
 * Process variables for the html template.
 */
/* -- Delete this line if you want to use this function
function indeko7_process_html(&$vars) {
}
// */


/**
 * Override or insert variables for the page templates.
 */
/* -- Delete this line if you want to use these functions
function indeko7_preprocess_page(&$vars) {
}
function indeko7_process_page(&$vars) {
}
// */


/**
 * Override or insert variables into the node templates.
 */
/* -- Delete this line if you want to use these functions
function indeko7_preprocess_node(&$vars) {
}
function indeko7_process_node(&$vars) {
}
// */


/**
 * Override or insert variables into the comment templates.
 */
/* -- Delete this line if you want to use these functions
function indeko7_preprocess_comment(&$vars) {
}
function indeko7_process_comment(&$vars) {
}
// */


/**
 * Override or insert variables into the comment wrapper templates.
 */
function indeko7_preprocess_comment_wrapper(&$vars) {
  // Add JavaScript to style wissenskarte comments
  if (!empty($vars['theme_hook_original']) && $vars['theme_hook_original'] == "comment_wrapper__node_wissenskarte") {
    drupal_add_js(drupal_get_path('theme', 'indeko7') . '/js/node-wissenskarte-comments-style.js', array('scope' => 'footer'));
  }
}


/**
 * Override or insert variables into the block templates.
 */
 /* -- Delete this line if you want to use these functions
function indeko7_preprocess_block(&$vars) {
}
function indeko7_process_block(&$vars) {
}
// */
