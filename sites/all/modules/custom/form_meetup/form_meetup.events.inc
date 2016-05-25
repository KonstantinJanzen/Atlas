<?php
/**
 * Created by PhpStorm.
 * User: hofer
 * Date: 03.03.2016
 * Time: 16:11
 */

function form_meetup_page()
{
    return drupal_get_form('form_meetup_event');
}


function form_meetup_event($form, &$form_state)
{
    $form = array();

    $form['choice'] = array(
		'#prefix' => '<p>Wir freuen uns auf Ihre Teilnahme an der Veranstaltung</p>
						<h2>Save the Date Praxisforum, Donnerstag, März 10, 2016 bis Freitag, März 11, 2016</h2>
						<p>Welche Aufgabe werden Sie übernehmen ?</p>
						',
        '#type' => 'select',
        '#title' => t('Aufgabe'),
        '#options' => array(
            'besucher' => t('Nur Besucher'),
            'workshop' => t('Workshop'),
            'vortrag' => t('Vortrag'),
        ),

    '#default_value' => 'besucher',
    '#required' => TRUE,
    );


    $form['buttons']['submit'] = array(
      '#type' => 'submit',
      '#value' => t('Submit'),
    );
    return $form;
}

function form_meetup_event_submit($form, &$form_state)
{
    dsm($form_state['values']);
    //TODO Speicher Daten in DB

    $form_state['redirect'] = ''; //TODO Redirect zur Personenauflistung

}
