
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "notification" && sender.tab.selected === false) {
      chrome.notifications.create('notification', request.options, function() { });
    }
      
    chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
      
      if (btnIdx === 0) {
          chrome.tabs.update(sender.tab.id, {active: true}, function() {});
      } else if (btnIdx === 1) {
          chrome.notifications.clear(notifId, function() {});
      }
      
    });

    chrome.notifications.onClicked.addListener(function(id) {
      chrome.notifications.clear(id, function() {});
    });

    sendResponse();
});
