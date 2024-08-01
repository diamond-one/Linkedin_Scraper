"use strict";

const options = {};
const productInfo = document.querySelectorAll(".product-info");
const reloadBtn = document.getElementById("reload-btn");
const linkBtn = document.getElementById("link-btn");
const onlineHelpLink = document.querySelector(".online-help-link");
const supportedBrowsersLink = document.querySelector(".supported-browsers-link");

chrome.storage.local.get("cfg", (data) => {
	Object.assign(options, data.cfg);
	productInfo.forEach((element) => {
		element.textContent = options.productType;
	});
});

reloadBtn?.addEventListener("click", function () {
	chrome.runtime.sendMessage({ msg: "conn-error" });
});

linkBtn?.addEventListener("click", function () {
	chrome.runtime.sendMessage({ msg: "open-gui" });
});

const openHelpPage = () => {
	chrome.tabs.create({ url: GetHelpLink(options.productType) }).then(() => window.close());
};

onlineHelpLink?.addEventListener("click", openHelpPage);

supportedBrowsersLink?.addEventListener("click", openHelpPage);
