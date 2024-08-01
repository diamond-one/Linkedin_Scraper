"use strict";

CreateHeader();

function CreateHeader() {
	const headerDiv = document.getElementById("popup-header");
	const headerRow = document.createElement("div");
	headerRow.setAttribute("class", "hdr-flex");

	const headerIcon = document.createElement("div");
	headerIcon.setAttribute("class", "header-icon");
	headerRow.appendChild(headerIcon);
	headerDiv.appendChild(headerRow);

	const logoEl = document.createElement("img");
	logoEl.setAttribute("src", "./assets/eset-logo.svg");
	logoEl.setAttribute("class", "logo");
	logoEl.setAttribute("alt", chrome.i18n.getMessage("eset_logo_alt"));
	headerRow.appendChild(logoEl);
}
