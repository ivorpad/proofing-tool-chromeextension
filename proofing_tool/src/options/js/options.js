chrome.options.opts.about = 'This is my about page :)';
chrome.options.addTab('General', [
  { name: 'disable_snippets', desc: 'Disable Snippets' },
  { name: 'disable_tag_filter', desc: 'Disable Tag Filter' },
]);

$(function() {
  "use strict";
  var baseUrl = 'https://ivorpad.com/';

    
    // this array will be fetched from Chrome Ext Options
    // Load the whole stuff when the user enters the queue instead and filter by market category.
    var snippetCategoriesData = [];


  $.ajax({
    url: '' +baseUrl+ 'wp-json/wp/v2/snippet_categories',
    dataType: 'json',
    success: function(categories) {
        var snippetsObj = [];
        categories.map(function(cat , i){
            snippetCategoriesData.push(cat.id);
            snippetsObj.push( { name: cat.id, type: 'checkbox', desc: cat.name } );
        });
      
      // Remove 'Uncategorized' category.
        for (var i = 0; i < snippetsObj.length; i++) {
          if ( snippetsObj[i].hasOwnProperty('desc') && snippetsObj[i].desc === 'Uncategorized' ) {
            var index = snippetsObj.indexOf( snippetsObj[i] );
            snippetsObj.splice(index, 1);
          }
        }

        chrome.options.addTab('Snippets', [
          { name: 'ids', type: 'object', options: snippetsObj, desc: 'Select the snippets you want in your queue.' },
        ]);
      },
    });

});
