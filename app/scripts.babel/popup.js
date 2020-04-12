'use strict';

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
	var url = tabs.shift().url;
	if (url.match(/^chrome\:/)) {
		return
	}
	document.getElementsByTagName('iframe')[0].src = `https://www.pagebubble.com/webpage-details/${encodeURIComponent(url)}`;
});