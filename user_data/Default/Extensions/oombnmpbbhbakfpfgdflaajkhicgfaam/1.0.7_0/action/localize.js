"use strict";

function LocalizePageHtml() {
	const htmlEl = document.getElementsByTagName("html");
	for (let i = 0; i < htmlEl.length; i++) {
		const el = htmlEl[i];
		const htmlStr = el.innerHTML.toString();
		const lookupStr = htmlStr.replace(/__MSG_(\w+)__/g, function (match, v1) {
			return v1 ? chrome.i18n.getMessage(v1) : "";
		});

		if (lookupStr != htmlStr) {
			el.innerHTML = lookupStr;
		}
	}
}

LocalizePageHtml();

const directionLocale = chrome.i18n.getMessage("direction");
directionLocale === "rtl" ? (document.documentElement.dir = "rtl") : null;
