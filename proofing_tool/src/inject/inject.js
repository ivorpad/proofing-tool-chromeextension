
// http://stackoverflow.com/questions/11849562/how-to-save-the-output-of-a-console-logobject-to-a-file
;(function(console) {
'use strict';
console.save = function(data, filename) {
  if (!data) {
    console.error('Console.save: No data');
    return;
  }

  if (!filename) filename = 'console.json';

  if (typeof data === 'object') {
    data = JSON.stringify(data, undefined, 4);
  }

  var blob = new Blob([data], { type: 'text/json' }),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a');

  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  e.initMouseEvent(
    'click',
    true,
    false,
    window,
    0,
    0,
    0,
    0,
    0,
    false,
    false,
    false,
    false,
    0,
    null
  );
  a.dispatchEvent(e);
};
})(console)
;(function($) {
'use strict';

var headerSpan = $('.admin-header').children('span.e-text-label');
headerSpan.after(' <span id="timer"> <time>00:00:00</time> </span> ');

var _timer = document.getElementById('timer') || '',
  seconds = 0,
  minutes = 0,
  hours = 0,
  t;

// This function adds a timer to the top of the page.
function add() {
  var item_name = $('.existing-value.underlined').text();

  seconds++;
  if (seconds >= 60) {
    seconds = 0;
    minutes++;
    if (minutes >= 60) {
      minutes = 0;
      hours++;
    }
  }

  _timer.textContent = (hours ? hours > 9 ? hours : '0' + hours : '00') +
    ':' +
    (minutes ? minutes > 9 ? minutes : '0' + minutes : '00') +
    ':' +
    (seconds > 9 ? seconds : '0' + seconds);

  if (_timer.textContent === '00:15:00') {
    $('#timer').css('background', 'red');

    // If 15 have passed and the reviewer is in another tab, it'll receive a notification.
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


// This function saves a log of items reviewed and put them in localStorage to
// export it later to a txt file.
function setLocalStorage() {
  var current_time,
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
}
setLocalStorage();


// Removes localStorage data when the reviewer clicks 'exit queue'
function removeLocalStorage() {
  var url = $('.header-right-container').children('a').attr('href');

  $('.header-right-container').children('a').addClass('exit');

  $('.exit').on('click', function(e) {
    var data = JSON.parse(localStorage.getItem('allItems')),
      downloadable_data,
      file_id = Math.random().toString(36).substr(2, 9),
      data_arr = [];

    if (data !== null) {
      e.preventDefault();
      for (var i = 0; i < data.length; i++) {
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
}
removeLocalStorage();

// Making a list of attributes to compare
function makeListOfAttributes(list) {
  var mappedList;

  if (list.is('select#category')) {
    mappedList = list.children().map(function() {
      var str = $(this).text().replace(/\s+\-\s+/g, '');
      return str.toLowerCase();
    });
  } else {
    mappedList = list.map(function() {
      return $(this).text().toLowerCase().match(/^\s*([a-zA-Z0-9]+)/);
    });
  }
  return mappedList;
}

// Helper to get the first word of tags
function getFirstWord(str) {
  if (str.indexOf(' ') === -1) return str;
  else return str.substr(0, str.indexOf(' '));
}

// Highlight tags that require reviewer's attention
function highlightTags() {
  chrome.storage.sync.get('general.disable_tag_filter', function(data) {
    if (data['general.disable_tag_filter'] === false) {
      $('#tags_tagsinput:last-child').addClass('remove_tags');

      var compatibleOptions = $('#attribute_fields').find('select'),
        tags = $('#tags_tagsinput').find('span').not('.tag'),
        cats = $('select#category'),
        compatibleList = makeListOfAttributes(compatibleOptions.children()),
        tagsList = makeListOfAttributes(tags),
        compatibleArr = _.uniq(compatibleList),
        tagsArr = _.uniq(tagsList),
        categoriesArr = makeListOfAttributes(cats),
        compatibleAndTagsArr = _.intersection(compatibleArr, tagsArr),
        catsAndTagsArr = _.intersection(categoriesArr, tagsArr);

      for (var i = 0; i < catsAndTagsArr.length; i++) {
        compatibleAndTagsArr.push(catsAndTagsArr[i]);
      }

      var existingTags = _.uniq(compatibleAndTagsArr);

  function userNotes() {

    // Get the users notes page
    var envatoMarket = 'https://themeforest.net/user/',
        userID = $('a[title="author profile page"]').text(),
        userNotesPage = envatoMarket + userID + '/notes',

        // Create our new request
        xhr = new XMLHttpRequest();

    // Add a div for the notes displayed
    $( ".sidebar-proofing" ).append( '<h3>User Notes</h3><div id="user-notes"></div>' );

    // Open the user's notes page
    xhr.open( 'GET', userNotesPage, true);

    xhr.onreadystatechange = function() {

      // Check for a successful response
      if( xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200 ) {

        var response = xhr.responseText;
        var notes = $( response ).find( 'h2.underlined' ).nextUntil( '.page-controls' );

        // Loop through the returned data object
        for ( var key in notes ){
          if( typeof( notes[key].innerHTML) != 'undefined' ){
            // Display each note
            $('#user-notes').append('<div class="note">' + notes[key].innerHTML + '</div>');
          }
        }

      }
    };
    xhr.send();

  }
  userNotes();

  // invoking improveSelect on document.ready
  $(function() {
    function improveSelect() {
      $('#category').select2();
    }
    improveSelect();
  });

      var highlightOnRemove = function() {
        findExistingTag();
      };

      $('#tags').tagsInput({
        height: 'auto',
        width: '180px',
        interactive: true,
        defaultText: 'add a tag',
        onRemoveTag: highlightOnRemove,
      });

      var findExistingTag = function() {
        tags = $('#tags_tagsinput').find('span');
        tags.each(function(index, el) {
          var str = el.innerText.replace(/\s+/g, ''),
            firstWord = getFirstWord(el.innerText),
            that = $(this);

          for (var i = 0; i < existingTags.length; i++) {
            if (str === existingTags[i] || firstWord === existingTags[i]) {
              $(el).parent().addClass('highlight');
            }
          }
        });
      };

      findExistingTag();
    }
  });
}
highlightTags();

// This plugin improves the `category` select list on the proofing page
// It adds a search box to find categories easily
$(function() {
  function improveSelect() {
    $('#category').select2();
  }
 // invoking improveSelect on document.ready
  improveSelect();
});

// The addSnippets function will load snippets from WP REST API using the
// Review CPT WordPress plugin. https://github.com/ivorpad/review-cpt
function addSnippets() {
  chrome.storage.sync.get('snippets.ids', function(data) {
    var ids = [];
    for (var key in data['snippets.ids']) {
      if (data['snippets.ids'][key] === true) {
        ids.push(key);
        localStorage.setItem('idsList', ids.join(','));
      }
    }
  });

  var baseUrl = 'https://ivorpad.com/',
      snippetCategoriesData = [];

  $.ajax({
    url: '' +
      baseUrl +
      'wp-json/wp/v2/snippet_categories?filter[orderby]=title&order=asc',
    dataType: 'json',
    success: function(categories) {
      categories.map(function(cat, i) {
        snippetCategoriesData.push(cat.id);
      });

      // Limit posts to 100 but it can be increased manually
      // I've removed the limit with a filter in the WP plugin.
      var categoriesUrl = '' +
        baseUrl +
        'wp-json/wp/v2/themeforest_snippets?snippet_categories=' +
        localStorage.getItem('idsList') +
        '&filter[orderby]=title&order=asc&per_page=100';
      $.get(categoriesUrl, function(posts) {
        var postObj = [];
        posts.map(function(post, index) {
          var category = _.findWhere(categories, {
            id: post.snippet_categories[0],
          });

          postObj.push({
            title: post.title.rendered,
            content: post.content.rendered,
            category_slug: category.slug,
            category_name: category.name,
          });
        });

        var ul = $('<ul>').addClass('accordion');
        var lists = Object.create(null);
        var form = $('<form class="snippets-form">');

        postObj.forEach(function(post) {
          var list = lists[post.category_slug];

          var checkboxInputs = '<div class="form-control"><label><input type="checkbox" class="snippet-checkbox" name="checkbox" data-snippet="' +
            post.content +
            ' " value="' +
            post.title +
            '"> ' +
            post.title +
            ' </label><br></div>';

          if (!list) {
            list = (lists[post.category_slug] = $("<ul class='inner'>"));
            var item = $('<li>').addClass(
              'category ' + post.category_slug + ''
            );
            var anchor = $('<a href="#">')
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
        var snippetData = [], count = 0;
        ul.on('change', 'input', function() {
          if ($(this).prop('checked')) {
            snippetData.push($(this).data('snippet'));
          } else {
            snippetData.splice(
              snippetData.indexOf($(this).data('snippet')),
              1
            );
          }

          var snippetText = [];
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
          var message = $(
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
    var closest = $(this).closest('li.category');
    var countCheckedCheckboxes = $(':checkbox', closest)
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
    var $this = $(this);
    var $next = $this.next();
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
}

addSnippets();
})(jQuery);
