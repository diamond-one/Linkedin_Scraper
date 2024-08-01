"use strict";

const options = {};
const searchSwitch = document.getElementById("search-switch");
const searchSlider = document.getElementById("search-slider");

const isChrome = /chrome/i.test(navigator.userAgent);

const permissionsToRequest = {
	origins: ["<all_urls>"]
};

CheckPermission(permissionsToRequest, (isPermissionGranted) => {
	if (!isPermissionGranted) {
		chrome.storage.local.get("cfg", (data) => {
			data.cfg.searchOption = false;
			searchSwitch.checked = false;
			searchSlider.style.display = "block";
			chrome.storage.local.set({ cfg: data.cfg });
		});
	} else {
		chrome.storage.local.get("cfg", (data) => {
			Object.assign(options, data.cfg);
			searchSwitch.checked = Boolean(options.searchOption);
			searchSlider.style.display = "block";
		});
	}
});

searchSwitch.addEventListener("change", (event) => {
	chrome.permissions.request(permissionsToRequest);

	chrome.storage.local.get("cfg", (data) => {
		data.cfg.searchOption = event.target.checked;
		chrome.storage.local.set({ cfg: data.cfg });
	});

	CheckPermission(permissionsToRequest, (isPermissionGranted) => {
		if (!isPermissionGranted && !isChrome) {
			setTimeout(() => window.close(), 500);
		}
	});
});

function CheckPermission(permission, callback) {
	chrome.permissions.contains(permission, (result) => {
		if (result) {
			callback(true);
		} else {
			
			callback(false);
		}
	});
}
