"use strict";

function detectBrowser() {
	const userAgent = window.navigator.userAgent;

	if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
		document.getElementById("chrome-tile").style.display = "block";
	} else if (userAgent.includes("Edg")) {
		document.getElementById("edge-tile").style.display = "block";
	} else if (userAgent.includes("Firefox")) {
		document.getElementById("firefox-tile").style.display = "block";
	}
}

window.addEventListener("load", detectBrowser);
