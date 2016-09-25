$ = jQuery;

// Reset morphsearch block
$('#morphsearch-reset').click( function() {
    $('#fulltextsearch').val('');
    $(".morphsearch-type").val(-1).trigger("chosen:updated");
    $(".morphsearch-select").val(-1).trigger("chosen:updated");
});


