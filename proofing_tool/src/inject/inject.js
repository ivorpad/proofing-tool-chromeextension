(function(console){
"use strict";
    console.save = function(data, filename){

        if(!data) {
            console.error('Console.save: No data')
            return;
        }

        if(!filename) filename = 'console.json'

        if(typeof data === "object"){
            data = JSON.stringify(data, undefined, 4)
        }

        var blob = new Blob([data], {type: 'text/json'}),
            e    = document.createEvent('MouseEvents'),
            a    = document.createElement('a')

        a.download = filename
        a.href = window.URL.createObjectURL(blob)
        a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
        e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
        a.dispatchEvent(e)
    }
})(console)

;(function($) {
"use strict";
    var _headerSpan = $('.admin-header').children('span.e-text-label');
_headerSpan.after(' <span id="timer"> <time>00:00:00</time> </span> ');

var _timer = document.getElementById('timer') || '',
    seconds = 0, minutes = 0, hours = 0,
    t;

function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    
    _timer.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    
    if ( _timer.textContent === '00:15:00' ) {
      $('#timer').css('color', 'red');
    }
  
    timer();
}
function timer() {
    t = setTimeout(add, 1000);
}
timer();


function setLocalStorage() {
var current_time,
 data = [],
 all_items = [],
 item_url = $('.submission-details').children('a').attr('href') || '',
 item_name = $('.existing-value.underlined').text(),
 approve_button = $('fieldset#approve').children('button'),
 reject_button = $('fieldset#reject').children('button'),
 item_url_arr = item_url.split('/'),
 item_id = item_url_arr[ item_url_arr.length - 1 ],
 action,
 existing_items;

$('button.e-btn--3d.-color-primary, button.e-btn--3d.-color-destructive').on('click', function(e) {
    
    if( $(this).is('.e-btn--3d.-color-primary.-size-l.-width-full') ) {
       if( $('#item_item_attributes_attributes_5_select_value').val() === 'Unrated' ) { 
            alert('Documentation cannot be unrated');
            return false;
        }
    }
    
    e.stopPropagation();
    
    action = $(this).is(approve_button) ? 'approved' : 'rejected';
    
    // TODO: Set currentState of timer with localStorage to avoid starting from 0 if the page reloads.
    current_time = $("#timer").text();
    existing_items = JSON.parse( localStorage.getItem('allItems') ) || [];
    data.push( { id: item_id, item_url: item_url, item_name: item_name, current_time: current_time, action: action } );
    localStorage.setItem('item', JSON.stringify( data ));
    existing_items.push( data );
    localStorage.setItem('allItems', JSON.stringify(existing_items));
    console.log(existing_items);
});
}
setLocalStorage();

function removeLocalStorage() {
  var url = $('.header-right-container').children('a').attr('href');

  $('.header-right-container').children('a').addClass('exit');
  
  $('.exit').on('click', function(e) {
    var data = JSON.parse( localStorage.getItem('allItems') ),
    downloadable_data,
    file_id = Math.random().toString(36).substr(2, 9),
    data_arr = [];
    
    if(data !== null) {
        e.preventDefault();
          for(var i = 0; i < data.length; i++) { 
            downloadable_data = 
                i + " — " + " Name: " + data[i][0].item_name + "\n\n" +
                
                "ID: " + data[i][0].id + "\n" + 
                "URL: " + "http://themeforest.net" + data[i][0].item_url + "\n" +
                "Time Reviewing: " + data[i][0].current_time + "\n" +
                "Action: " + data[i][0].action + "\n\n" +
                "-----" + "\n\n";

            data_arr.push(downloadable_data);
          }
    }
    
    //console.log(data_arr);
    // TODO: file name should be `tf_review_report_` + date to find it easily.
    console.save(data_arr.join('\n'), 'tf_review_report_' + file_id + '.txt');
    localStorage.removeItem('item');
    localStorage.removeItem('allItems');
    location.href = url;
  });
}
removeLocalStorage();

function makeListOfAttributes( list ) {
  var mappedList;
  
  if( list.is('select#category') ) {
    mappedList = list.children().map(function() {
    var str = $(this).text().replace(/\s+\-\s+/g,"");
    return str.toLowerCase();
    })
  } else {
    mappedList = list.map(function() {
      return $(this).text().toLowerCase().match(/^\s*([a-zA-Z0-9]+)/);
    });
  }
    return mappedList;
}

function getFirstWord(str) {
  if (str.indexOf(' ') === -1)
    return str;
  else
    return str.substr(0, str.indexOf(' '));
};

function highlightTags() {

  var compatibleOptions = $('#attribute_fields').find('select'),
      tags = $('#tags_tagsinput').find('span').not('.tag'),
      cats = $('select#category'),
      compatibleList = makeListOfAttributes( compatibleOptions.children() ),
      tagsList = makeListOfAttributes( tags ),
      compatibleArr = _.uniq( compatibleList ),
      tagsArr = _.uniq( tagsList ),
      categoriesArr = makeListOfAttributes( cats ),
      compatibleAndTagsArr = _.intersection(compatibleArr, tagsArr),
      catsAndTagsArr = _.intersection(categoriesArr, tagsArr);

  
  for(var i = 0; i < catsAndTagsArr.length; i++) {
    compatibleAndTagsArr.push(catsAndTagsArr[i]);
  }

  var existingTags = _.uniq(compatibleAndTagsArr);
 
  var highlightOnRemove = function() {
    findExistingTag();
  }      

  $('#tags').tagsInput({
   'height':'450px',
   'width':'200px',
   'interactive':true,
   'defaultText':'add a tag',
   'onRemoveTag':highlightOnRemove,
  });

  var findExistingTag = function() {
    tags = $('#tags_tagsinput').find('span');
    tags.each( function(index, el) {
          var str = el.innerText.replace(/\s+/g, ''),
              firstWord = getFirstWord(el.innerText),
              that = $(this);
          
          for( var i = 0; i < existingTags.length; i++) {
            if( ( str === existingTags[i] ) || ( firstWord === existingTags[i] ) ) {
              $(el)
                .parent()
                .addClass('highlight');
            }
          }   
          
      });
  }
  
  findExistingTag();

}
highlightTags();

})(jQuery);
