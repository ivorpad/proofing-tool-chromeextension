chrome.options.opts.about = 'This un-official tool was made by Ivor Padilla for ThemeForest to increase Reviewers\' productivity.';
chrome.options.addTab('General', [
  { name: 'enable_snippets', desc: 'Enable Dynamic Snippets' },
  { name: 'disable_tag_filter', desc: 'Disable Tag Filter' },
  { name: 'disable_user_notes', desc: 'Disable User Notes'}
]);

$(function() {
  "use strict";
  const baseUrl = 'https://ivorpad.com/';

    
    // this array will be fetched from Chrome Ext Options
    // Load the whole stuff when the user enters the queue instead and filter by market category.


  $.ajax({
    url: '' +baseUrl+ 'wp-json/wp/v2/snippet_categories',
    dataType: 'json',
    success: function(categories) {
        let snippetsObj = [];
        categories.map(function(cat , i){
            snippetsObj.push( { name: cat.id, type: 'checkbox', desc: cat.name } );
        });
      
      // Remove 'Uncategorized' category.
        for (let i = 0; i < snippetsObj.length; i++) {
          if ( snippetsObj[i].hasOwnProperty('desc') && snippetsObj[i].desc === 'Uncategorized' ) {
            const index = snippetsObj.indexOf( snippetsObj[i] );
            snippetsObj.splice(index, 1);
          }
        }

        chrome.options.addTab('Snippets', [
          { name: 'ids', type: 'object', options: snippetsObj, desc: 'Select the snippets you want in your queue.' },
        ]);
      },
    });

});
