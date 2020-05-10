'use strict';

function request(url, method, body, headers) {
  headers = headers || {};
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest;
    xhr.open(method, url, true);
    for (let header in headers) {
      xhr.setRequestHeader(header, headers[header]);
    }
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
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
    xhr.send(JSON.stringify(body));
  });
}

chrome.runtime.onConnect.addListener(port => {
  port.onMessage.addListener((req, sender) => {
    switch (req.function) {
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
      case 'updateWebpage':
        chrome.identity.getAuthToken({
          'interactive': true
        }, token => {
          request(`https://www.pagebubble.com/api/webpages/${encodeURIComponent(req.params.url)}`, 'PUT', req.params, {
            'Authorization': `Bearer ${token}`
          });
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
  // if (changeInfo.url && !changeInfo.url.match(/^chrome\:/)) {
  //   chrome.identity.getAuthToken({
  //     'interactive': true
  //   }, token => {
  //     request(`https://www.pagebubble.com/api/webpages/${encodeURIComponent(changeInfo.url)}`, 'PUT', {}, {
  //       'Authorization': `Bearer ${token}`
  //     });
  //   });
  // }
});