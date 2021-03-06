
// http://stackoverflow.com/questions/11849562/how-to-save-the-output-of-a-console-logobject-to-a-file
!function(a){"use strict";a.save=function(b,c){if(!b)return void a.error("Console.save: No data");c||(c="console.json"),"object"==typeof b&&(b=JSON.stringify(b,void 0,4));var d=new Blob([b],{type:"text/json"}),e=document.createEvent("MouseEvents"),f=document.createElement("a");f.download=c,f.href=window.URL.createObjectURL(d),f.dataset.downloadurl=["text/json",f.download,f.href].join(":"),e.initMouseEvent("click",!0,!1,window,0,0,0,0,0,!1,!1,!1,!1,0,null),f.dispatchEvent(e)}}(console);

;(function($) {
'use strict';

const proofingApp = {

  /* ---------------------------------------------
   Timer
   --------------------------------------------- */  
  timer: function() {
    const headerSpan = $('.admin-header').children('span.e-text-label');
    headerSpan
      .after(' <span id="timer" class="e-text-label -color-grey-light"> <time>00:00:00</time> </span> ');
    
    let _timer = document.getElementById('timer') || undefined,
    seconds = 0,
    minutes = 0,
    hours = 0,
    t;
    
    function add() {
      const item_name = $('.existing-value.underlined').text();

      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
    //console.log( typeof _timer !== "undefined" );
    if( typeof _timer !== "undefined" ) {
      _timer.textContent = (hours ? hours > 9 ? hours : '0' + hours : '00') +
        ':' +
        (minutes ? minutes > 9 ? minutes : '0' + minutes : '00') +
        ':' +
        (seconds > 9 ? seconds : '0' + seconds);

    }
      
      
    if (typeof _timer !== "undefined" && _timer.textContent === '00:15:00') {
      $('#timer').css({
        'background': 'red',
        'color': 'white'
      });

      // If 15 minutes have passed and the reviewer is in another tab a nice Chrome Notification will be displayed.
      chrome.runtime.sendMessage({
        type: 'notification',
        options: {
          type: 'basic',
          iconUrl: chrome.extension.getURL('icons/48.png'),
          title: 'ThemeForest Proofing',
          message: 'An item is waiting for you.',
          contextMessage: item_name,
          buttons: [
            {
              title: 'Get me there!',
            },
            {
              title: 'Stay right here',
            },
          ],
          requireInteraction: true,
        },
      });
    }

      timer();
    }

    // Initialize the timer
    function timer() {
      t = setTimeout(add, 1000);
    }
    timer();
  },

  /* ---------------------------------------------
   Set Local Storage

   This function saves a log of items reviewed and put them in localStorage to -
   export it later to a txt file.
   --------------------------------------------- */
  setLocalStorage: function() {
    let current_time,
      data = [],
      all_items = [],
      item_url = $('.submission-details').children('a').attr('href') || '',
      item_name = $('.existing-value.underlined').text(),
      approve_button = $('fieldset#approve').children('button'),
      reject_button = $('fieldset#reject').children('button'),
      item_url_arr = item_url.split('/'),
      item_id = item_url_arr[item_url_arr.length - 1],
      action,
      existing_items;

    $('button.e-btn--3d.-color-primary, button.e-btn--3d.-color-destructive').on('click', function(e) {

      if ( $(this).is('.e-btn--3d.-color-primary.-size-l.-width-full')) {

        if ($('#item_item_attributes_attributes_5_select_value').val() === 'Unrated' ) {
          alert('Documentation cannot be unrated');
          return false;
        }
      }

      e.stopPropagation();


      action = $(this).is(approve_button) ? 'approved' : 'rejected';

      current_time = $('#timer').text();
      existing_items = JSON.parse(localStorage.getItem('allItems')) || [];
      data.push({
        id: item_id,
        item_url: item_url,
        item_name: item_name,
        current_time: current_time,
        action: action,
      });
      localStorage.setItem('item', JSON.stringify(data));
      existing_items.push(data);
      localStorage.setItem('allItems', JSON.stringify(existing_items));

    });
  },


  /* ---------------------------------------------
   Remove Local Storage

   Clears localStorage data when the reviewer clicks 'exit queue'
   --------------------------------------------- */
  removeLocalStorage: function() {
    const url = $('.header-right-container').children('a').attr('href');

    $('.header-right-container').children('a').addClass('exit');

    $('.exit').on('click', function(e) {
      let data = JSON.parse(localStorage.getItem('allItems')),
        downloadable_data,
        data_arr = [];
        
      const file_id = Math.random().toString(36).substr(2, 9);
        

      if (data !== null) {
        e.preventDefault();
        for (let i = 0; i < data.length; i++) {
          downloadable_data = i +
            ' — ' +
            ' Name: ' +
            data[i][0].item_name +
            '\n\n' +
            'ID: ' +
            data[i][0].id +
            '\n' +
            'URL: ' +
            'http://themeforest.net' +
            data[i][0].item_url +
            '\n' +
            'Time Reviewing: ' +
            data[i][0].current_time +
            '\n' +
            'Action: ' +
            data[i][0].action +
            '\n\n' +
            '-----' +
            '\n\n';

          data_arr.push(downloadable_data);
        }
      }

      console.save(data_arr.join('\n'), 'tf_review_report_' + file_id + '.txt');
      localStorage.removeItem('item');
      localStorage.removeItem('allItems');
      location.href = url;
    });
  },


  /* ---------------------------------------------
   Make List of Attr

   Making a list of attributes to compare
   --------------------------------------------- */
  makeListOfAttributes: function(list) {
    let mappedList;

    if (list.is('select#category')) {
      mappedList = list.children().map(function() {
        let str = $(this).text().replace(/\s+\-\s+/g, '');
        return str.toLowerCase();
      });
    } else {
      mappedList = list.map(function() {
        return $(this).text().toLowerCase().match(/^\s*([a-zA-Z0-9]+)/);
      });
    }
    return mappedList;
  },


  /* ---------------------------------------------
   Highlight Duplicated Tags
   --------------------------------------------- */
  highlightTags: function() { 
        $('#tags_tagsinput:last-child').addClass('remove_tags');

        const compatibleOptions = $('#attribute_fields').find('select'),
              cats = $('select#category');    

        /* ---------------------------------------------
         Helper: getFirstWord

         @param {str} String to pass to the function
         @return {str} First word of a sentence
         --------------------------------------------- */
        function getFirstWord(str) {
          if (str.indexOf(' ') === -1) return str;
          else return str.substr(0, str.indexOf(' '));
        }

        let compatibleList = this.makeListOfAttributes(compatibleOptions.children()),
            tags = $('#tags_tagsinput').find('span').not('.tag'),
            tagsList = this.makeListOfAttributes(tags),
            compatibleArr = _.uniq(compatibleList),
            tagsArr = _.uniq(tagsList),
            categoriesArr = this.makeListOfAttributes(cats),
            compatibleAndTagsArr = _.intersection(compatibleArr, tagsArr),
            catsAndTagsArr = _.intersection(categoriesArr, tagsArr);

        for (let i = 0; i < catsAndTagsArr.length; i++) {
          compatibleAndTagsArr.push(catsAndTagsArr[i]);
        }

        const existingTags = _.uniq(compatibleAndTagsArr);

        const highlightOnRemove = function() {
          findExistingTag();
        };

        $('#tags').tagsInput({
          height: 'auto',
          width: '180px',
          interactive: true,
          defaultText: 'add a tag',
          onRemoveTag: highlightOnRemove,
        });
        

        let findExistingTag = function() {
          tags = $('#tags_tagsinput').find('span');
          tags.each(function(index, el) {
            const str = el.innerText.replace(/\s+/g, ''),
              firstWord = getFirstWord(el.innerText);
              

            for (let i = 0; i < existingTags.length; i++) {
              if (str === existingTags[i] || firstWord === existingTags[i]) {
                $(el).parent().addClass('highlight');
              }
            }
          });
        };

        findExistingTag();
  },
  
  /* ---------------------------------------------
   Improve Select Fields

   This plugin improves the `category` select list on the proofing page
   It adds a search box to find categories easily
   --------------------------------------------- */
  improveSelect: function() {
    $('#category').select2();
  },


  /* ---------------------------------------------
   Check Preview Size
   --------------------------------------------- */

  checkPreviewSize: function() {
    const img = $('.item-preview').find('img'),
        width = img.width(),
        height = img.height();
    
    if( width !== 590 || height !== 300 ) {
      img.parents('.item-preview').prepend('<span class="incorrect"><i class="e-icon -icon-cancel -margin-left"></i> <b>Wrong Size:</b> '+ width +'px &times; '+height+'px. Should be 590px &times; 300px.</span>');
    } else {
      img.parents('.item-preview').prepend('<span class="correct"><i class="e-icon -icon-ok -margin-left"></i> '+ width +'px &times; '+height+'px.</span>');
    }
  },

  userNotes: function() {
    const envatoMarket = 'https://themeforest.net/user/',
        userID = $('a[title="author profile page"]').text(),

    // Construct the user's notes page
    userNotesPage = envatoMarket + userID + '/notes',

    // Cache DOM element
    proofingSidebar = $( ".sidebar-proofing" ),

    // Create our new request
    xhr = new XMLHttpRequest();

    // Add a div for the notes displayed
    proofingSidebar.append( '<div class="user-notes-container"><h3>User Notes</h3><div id="user-notes"></div></div>' );

    // Open the user's notes page
    xhr.open( 'GET', userNotesPage, true);

    xhr.onreadystatechange = function() {

      // Check for a successful response
      if( xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200 ) {

        const response = xhr.responseText,
            notes = $( response ).find( 'h2.underlined' ).nextUntil( '.page-controls' ),
            userNotesWrap = $('#user-notes');
        
        
        // Loop through the returned data object
        for ( let key in notes ){

          if( typeof( notes[key] ) !== 'undefined' ){

            // Limits number of notes shown and display button to user notes page
            if( key == 5 ){
              userNotesWrap.append('<a class ="e-btn" href="'  + userNotesPage + '" target="_blank">View More User Notes</a>');
            }  else if( key < 5 ) {
              userNotesWrap.append('<div class="note">' + notes[key].innerHTML + '</div>');
            }

          }
        }

      }
    };
    xhr.send();
  },

  
  /* ---------------------------------------------
   Add Snippets from WP REST API to the proofing page

   The addSnippets function will load snippets from WP REST API using the
   Review CPT WordPress plugin. https://github.com/ivorpad/review-cpt
   --------------------------------------------- */
  addSnippets: function() {
    chrome.storage.sync.get('snippets.ids', function(data) {
      let ids = [];
      for (let key in data['snippets.ids']) {
        if (data['snippets.ids'][key] === true) {
          ids.push(key);
          localStorage.setItem('idsList', ids.join(','));
        }
      }
    });

    const baseUrl = 'https://ivorpad.com/';
    
    let snippetCategoriesData = [];

    $.ajax({
      url: baseUrl + 'wp-json/wp/v2/snippet_categories?filter[orderby]=title&order=asc',
      dataType: 'json',
      success: function(categories) {
        categories.map(function(cat, i) {
          snippetCategoriesData.push(cat.id);
        });

        // Limit posts to 100 but it can be increased manually
        // I've removed the limit with a filter in the WP plugin.
        const categoriesUrl = '' +
          baseUrl +
          'wp-json/wp/v2/themeforest_snippets?snippet_categories=' +
          localStorage.getItem('idsList') +
          '&filter[orderby]=title&order=asc&per_page=100';
        $.get(categoriesUrl, function(posts) {
          let postObj = [];
          posts.map(function(post, index) {
            const category = _.findWhere(categories, {
              id: post.snippet_categories[0],
            });

            postObj.push({
              title: post.title.rendered,
              content: post.content.rendered,
              category_slug: category.slug,
              category_name: category.name,
            });
          });

          const ul = $('<ul>').addClass('accordion'),
                lists = Object.create(null),
                form = $('<form class="snippets-form">');

          postObj.forEach(function(post) {
            let list = lists[post.category_slug];

            let checkboxInputs = '<div class="form-control"><label><input type="checkbox" class="snippet-checkbox" name="checkbox" data-snippet="' +
              post.content +
              ' " value="' +
              post.title +
              '"> ' +
              post.title +
              ' </label><br></div>';

            if (!list) {
              list = (lists[post.category_slug] = $("<ul class='inner'>"));
              let item = $('<li>').addClass(
                'category ' + post.category_slug + ''
              );
              const anchor = $('<a href="#">')
                .addClass('toggle')
                .text(post.category_name)
                .append('<span class="check-count">');

              item.append(list).prepend(anchor);
              ul.append(item);
            }
            list.append(checkboxInputs);
          });

          // show/hide accordion of snippets onChange.
          $('#rejection-types').on('change', 'input:not(.snippet-checkbox)', function(e) {
            if ($(this).val() === 'soft' && $(this).prop('checked')) {
              ul.hide().appendTo('#rejection-types').slideDown('fast');
            } else {
              ul.slideUp('fast');
            }
          });

          // Handle textarea stuff
          let snippetData = [], count = 0;
          ul.on('change', 'input', function() {
            if ($(this).prop('checked')) {
              snippetData.push($(this).data('snippet'));
            } else {
              snippetData.splice(
                snippetData.indexOf($(this).data('snippet')),
                1
              );
            }

            let snippetText = [];
            snippetData.forEach(function(v, i) {
              if (snippetData.length > 1) {
                snippetText.push(i + 1 + '. ' + snippetData[i]);
              } else {
                snippetText.push(snippetData[i]);
              }
            });

            $('#proofing_action_fields_reject_reason')
              .val(snippetText.join('\n\n'))
              .removeClass('error');
          });
        });
      },
      beforeSend: function(xhr, opts) {
        chrome.storage.sync.get('general.enable_snippets', function(data) {
          if (data['general.enable_snippets'] === false) {
            xhr.abort();
          }
        });
      },
      error: function(e) {
        if (!e.statusText === 'abort') {
          $('#rejection-types').on('change', 'input:not(.snippet-checkbox)', function(e) {
            const message = $(
              '<p class="snippet-error error">Snippets couldn\'t be loaded. Please try again later.</p>'
            );
            if ($(this).val() === 'soft' && $(this).prop('checked')) {
              $('#rejection-types').append(message);
            } else {
              //ul.slideUp('fast');
              $('#rejection-types').find('.snippet-error').remove();
            }
          });
        }
      },
    });

    // Count checkboxes for each snippet category.
    $('body').on('change', 'input[type=checkbox].snippet-checkbox', function(e) {
      const closest = $(this).closest('li.category');
      const countCheckedCheckboxes = $(':checkbox', closest)
                                        .filter(':checked')
                                        .length;

      if (countCheckedCheckboxes > 0) {
        $('span.check-count', closest).text(countCheckedCheckboxes).show();
      } else {
        $('span.check-count', closest).text('').hide();
      }
    });

    // TODO: Use velocity instead of jQuery's slideUp for a smoother transition
    $('body').on('click', '.toggle', function(e) {
      e.preventDefault();
      let $this = $(this);
      const $next = $this.next();
      if ($next.hasClass('show')) {
        $next.removeClass('show').slideUp(100);
      } else {
        $this
          .closest('.inner, .accordion')
          .find('.inner')
          .removeClass('show')
          .slideUp(350);
        $next.toggleClass('show').slideToggle(100);
      }
    });
  },

  changeTopBarUrl: function() {
    // get logo and item id
    const logo = $('.logo'),
        itemId = $('#last_skipped_entry_id').val();

    // if the URL is /admin/awesome_proofing/{item_id} then change the URL to https://themeforest.net/admin/awesome_proofing/
    // instead of themeforest.net
    if( window.location.pathname === "/admin/awesome_proofing/" + itemId ) {
      logo.after('<a href="'+ logo.context.origin +'/admin/awesome_proofing" target="_blank">Back to Proofing Queue</a>');
    } else {
      $('.logo').css('display', 'block');
    }
  },

  toggleSetting: function(setting, fn) {
    chrome.storage.sync.get(setting, function(data) {
      if ( data[setting] === false ) {
        fn();
      }
    }.bind(this));
  },

  domReadyUtilities: function() {
      this.checkPreviewSize();
      this.improveSelect();
  },

  init: function() {
    this.timer();
    this.setLocalStorage();
    this.removeLocalStorage();
    this.addSnippets();
    this.changeTopBarUrl();
    this.toggleSetting('general.disable_user_notes', this.userNotes);
    this.toggleSetting('general.disable_tag_filter', this.highlightTags.bind(this));
  }    
}

// Init the app.
proofingApp.init();

$(function(){
  proofingApp.domReadyUtilities();
});

})(jQuery);
