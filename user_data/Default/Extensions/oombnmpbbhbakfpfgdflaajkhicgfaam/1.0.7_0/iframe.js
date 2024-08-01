"use strict";

chrome.storage.local.get("cfg", (data) => {
	if (data.cfg.darkMode) {
		document.body.classList.toggle("dark-mode");
	}
});

document.addEventListener("DOMContentLoaded", function () {
	chrome.storage.local.get("cfg", (data) => {
		if (data.cfg) {
			document.querySelector("#exifCount").textContent = data.cfg.msgCount.exifCount;
		}
	});

	const closeBtn = document.getElementById("close-btn");
	const imgCloseNotificationElement = closeBtn.querySelector("svg");
	imgCloseNotificationElement.addEventListener("click", function () {
		try {
			window.parent.postMessage({ type: "closeIframe" }, "*");
		} catch (error) {
			
		}
	});
});
