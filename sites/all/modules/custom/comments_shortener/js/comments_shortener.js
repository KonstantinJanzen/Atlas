/**
 * Created by friederikelauterbach on 29/08/16.
 */

//Create a Namespace for Indeko javascript objects (no objects in global namespace)
var Indeko = (function ($, Indeko) {

    Indeko.Comments = Indeko.Comments || {};

    Indeko.Comments.init = function () {

        $('.comment .comment-content .field-name-comment-body .field-item').each(function (index, comment) {
            // Trim if the text is longer than 50 characters
            comment = $(comment);
            if (comment.text().length > 50) {

                var text = comment.text().trim();
                comment.text(text.slice(0, 50));

                var a = document.createElement('a');
                var linkText = document.createTextNode("...");
                // Add Ellipsis
                a.appendChild(linkText);
                a.className = "comment-shortener-link";
                a.title = Drupal.t("view more");
                a.addEventListener('click', function (event) {
                    comment.text(text);
                });
                comment.append(a);
            }
        });
    };

    return Indeko;


})(jQuery, Indeko || {});


jQuery(document).ready(function () {

    Indeko.Comments.init();

});