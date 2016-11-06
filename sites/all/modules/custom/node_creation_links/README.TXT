-- SUMMARY --
Dynamically creates node creation links (if the user has sufficient permissions) and adds them to the user menu block.


-- INSTALLATION --

1. Install the node_creation_links Drupal module as you would any Drupal module.
2. (Only extends the block "User menu". This block shoueld be assigned to a visible region in structure > blocks settings.)


-- CONFIGURATION --
To prevent the module to create links for specific content types edit
$staticFilter in morphsearch_block_view_system_user_menu_alter() function. (TODO module config menu)