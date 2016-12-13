<?php

/**
 * @file
 * JQuery Autosize settings form include file.
 */

/**
 * Admin settings menu callback.
 *
 * @see jquery_autosize_menu()
 */
function jquery_autosize_settings_form() {
  $form['jquery_autosize_variant'] = array(
    '#type' => 'radios',
    '#title' => t('Variant'),
    '#options' => array(
      'minified' => t('Production (minified)'),
      'uncompressed' => t('Development (uncompressed)'),
    ),
    '#default_value' => variable_get('jquery_autosize_variant', 'minified'),
  );
  return system_settings_form($form);
}
