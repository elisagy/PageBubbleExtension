'use strict';

function getBackgroundData(functionStr) {
  return new Promise(resolve => {
    var port = chrome.runtime.connect();
    port.postMessage({ function: functionStr });
    port.onMessage.addListener(response => {
      resolve(response);
      port.disconnect();
    });
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  var url = tabs.shift().url;
  if (url.match(/^chrome\:/)) {
    return
  }
  document.getElementsByTagName('iframe')[0].src = `https://www.pagebubble.com/webpage-details/${encodeURIComponent(url)}`;
  window.addEventListener('message', message => {
    var request = JSON.parse(message.data);
    getBackgroundData(request.functionStr).then(response => document.getElementsByTagName('iframe')[0].contentWindow.postMessage(JSON.stringify({ hash: request.hash, response }), '*'));
  });
});