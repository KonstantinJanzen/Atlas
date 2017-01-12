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
function indeko7_preprocess_node(&$vars) {
  // Hide comment title and marked areas field on write comment page of knowledge maps.
  $pathWriteComment = 'comment/reply/*';
  $isPathWriteComment = drupal_match_path(current_path(), $pathWriteComment);
  if (isset($vars['type']) && $vars['type'] === 'wissenskarte' && $isPathWriteComment) {
    $vars['title'] = '';
    hide($vars['content']['field_markierte_bereiche']);
  }
}

function indeko7_process_node(&$vars) {
  // change project node  design
  if (isset($vars['type']) && $vars['type'] === 'projekt') {

    // combine two bkm related fields into one
    if (isset($vars['content']['group_methode_bkm']['field_weiterentwicklung_von'])) {
      $fieldgroup_bkm = $vars['content']['group_methode_bkm'];
      $method_name =  t(' von ') . $fieldgroup_bkm['field_weiterentwicklung_von'][0]['#markup'];

      $vars['content']['group_methode_bkm']['field_weiter_oder_neuentwicklung'][0]['#markup'] .= $method_name;
      unset($vars['content']['group_methode_bkm']['field_weiterentwicklung_von']);
    }
  }
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
  if (isset($vars['theme_hook_original']) && $vars['theme_hook_original'] == "comment_wrapper__node_wissenskarte") {
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

/**
 * Implementation of hook_form_FORM_ID_alter().
 * Change forschungsergebnis title to textarea (ID: 95)
 */
function morphsearch_form_forschungsergebnis_node_form_alter(&$form, &$form_state) {
  $form['title']['#type'] = 'textarea';
  $form['title']['#rows'] = '1';
  return $form;
}

/*function indeko7_preprocess_search_results(&$variables)
{
  dpm($variables);

}*/