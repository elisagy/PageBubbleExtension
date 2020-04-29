'use strict';

function request(url, method) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest;
    xhr.open(method, url, true);
    xhr.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status >= 200 && this.status < 400) {
          resolve(JSON.parse(this.responseText || '{}'));
        }
        if (this.status >= 400 && this.status < 600) {
          reject(JSON.parse(this.responseText || '{}'));
        }
      }
    };
    xhr.send();
  });
}

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((request, sender) => {
    switch (request.function) {
      case 'getProfileUserInfo':
        chrome.identity.getProfileUserInfo(profileUserInfo => sender.postMessage(profileUserInfo));
        break;
      case 'getAuthToken':
        chrome.identity.getAuthToken({
          'interactive': true
        }, token => {
          sender.postMessage(token);
          chrome.identity.removeCachedAuthToken({ token });
        });
        break;
      default:
        sendResponse();
        break;
    }
  });
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  chrome.pageAction.show(tabId);
  if (changeInfo.url && !changeInfo.url.match(/^chrome\:/)) {
    request(`https://www.pagebubble.com/api/webpages/${encodeURIComponent(changeInfo.url)}`, 'PUT');
  }
});