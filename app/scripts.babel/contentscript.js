'use strict';

function request(url, method, headers) {
  headers = headers || {};
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest;
    xhr.open(method, url, true);
    for (let header in headers) {
      xhr.setRequestHeader(header, headers[header]);
    }
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

var observeDOM = (function() {
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    timer;

  return function(obj, callback) {
    if (!obj || !obj.nodeType === 1) return; // validation

    if (MutationObserver) {
      // define a new observer
      var obs = new MutationObserver(function(mutations, observer) {
        clearTimeout(timer);
        timer = setTimeout(callback, 1000, mutations);
      })
      // have the observer observe foo for changes in children
      obs.observe(obj, { childList: true, subtree: true });
    } else if (window.addEventListener) {
      obj.addEventListener('DOMNodeInserted', callback, false);
      obj.addEventListener('DOMNodeRemoved', callback, false);
    }
  }
})();

var urls = [];
observeDOM(document, () => {
  for (var url of [...document.querySelectorAll('a[href]')].map(link => link.href)) {
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }
  var port = chrome.runtime.connect();
  port.postMessage({ function: 'updateWebpage', params: { url: location.href, title: ([...document.querySelectorAll('title')].shift() || {}).innerHTML, hrefs: urls.map(url => ({ url })) } });
  port.onMessage.addListener(response => {
    resolve(response);
    port.disconnect();
  });
});