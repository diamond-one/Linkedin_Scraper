"use strict";

var timerID;
clearInterval(timerID);

timerID = setTimeout(function () {
	RemoveElement("eset-iframe");
	const iframe = AppendIframe();
	const removeTimerID = setTimeout(function () {
		if (document.body.contains(iframe)) {
			document.body.removeChild(iframe);
		}
	}, 10000);

	window.addEventListener("message", function (event) {
		if (event.data.type === "closeIframe") {
			if (document.body.contains(iframe)) {
				clearInterval(removeTimerID);
				document.body.removeChild(iframe);
			}
		}
	});
}, 1000);

function AppendIframe() {
	let iframe = document.createElement("iframe");
	iframe.id = "eset-iframe";
	iframe.src = chrome.runtime.getURL("notification.html");

	iframe.style.position = "fixed";
	iframe.style.top = "20px";

	chrome.i18n.getMessage("direction") === "rtl" ? (iframe.style.left = "20px") : (iframe.style.right = "20px");

	const lenThreshold = 35;
	const msgLen = chrome.i18n.getMessage("notification_message_text").length;
	const headerLen = chrome.i18n.getMessage("product_title").length;

	iframe.style.width = "360px";

	if (msgLen < lenThreshold) {
		iframe.style.height = "100px";
	} else if (headerLen > lenThreshold && msgLen > lenThreshold) {
		iframe.style.height = "145px";
	} else {
		iframe.style.height = "130px";
	}

	iframe.style.zIndex = "2147483647";
	iframe.style.borderColor = "rgba(155,155,155,0.1)";
	iframe.style.boxShadow = "0px 0px 14px 1px rgba(0,0,0,0.06)";
	iframe.style.borderWidth = "3px";
	iframe.style.borderRadius = "4px";

	document.body.appendChild(iframe);
	return iframe;
}

function RemoveElement(elementId) {
	const iframe = document.getElementById(elementId);
	if (iframe) {
		iframe.parentNode.removeChild(iframe);
	}
}
