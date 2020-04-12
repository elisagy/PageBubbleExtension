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

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  chrome.pageAction.show(tabId);
  if (changeInfo.url && !changeInfo.url.match(/^chrome\:/)) {
    request(`https://www.pagebubble.com/api/webpages/${encodeURIComponent(changeInfo.url)}`, 'PUT');
  }
});