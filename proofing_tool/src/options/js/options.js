chrome.options.opts.about = 'This is my about page :)';
chrome.options.addTab('General', [
  { name: '1', desc: 'Enable my feature' },
  { name: '2', desc: 'Enable watching' },
  { name: '3', desc: 'Allow users to start it out' },
  { name: '4', desc: 'Allow users to start it out 2' },
  { type: 'h3', desc: 'Section' },
  { name: '4', type: 'object', options: [
    { name: 'enabled', type: 'checkbox', desc: 'Enabled?' },
    { name: '4', type: 'text', desc: 'Your name please' },
    { name: '5', type: 'text', desc: 'Your jacket' },
  ], desc: 'My character description (this is an object type)' },
  { name: '4', desc: 'Try on some sushi', options: [
    { name: 'fresh', desc: 'Fresh sushi' },
    { name: 'roll', desc: 'Choose a type', type: 'select',
      options: [
        'Tuna Roll', 'Thumbtack Roll', 'Hairball Roll', 'Flem Roll'] },
    { name: 'color', type: 'color', desc: 'Choose a color fish' },
  ] },
  { type: 'h3', desc: 'My List' },
  { type: 'list', name: 'mylist', desc: 'Here\'s a list, add some things',
    head: true, sortable: true, fields: [
      { type: 'select', name: 'number', desc: 'Number',
        options: ['One', 'Two'] },
      { type: 'text', name: 'hello', desc: 'Name' },
      { type: 'checkbox', name: 'yes', desc: 'Yeah?' },
  ] }
]);




$(function() {
  "use strict";
  var baseUrl = 'https://ivorpad.com/';

    
    // this array will be fetched from Chrome Ext Options
    // Load the whole stuff when the user enters the queue instead and filter by market category.
    var snippetCategoriesData = [];
    
 

    //console.log(snippetsObj)

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


      //console.log( localStorage.getItem('myIds') )  

      // $.get(categoriesUrl, function (posts) {
            
      // });
      
      },
    });

});
      


