"use strict";

const exifSwitch = document.getElementById("exif-switch");
const notifSwitch = document.getElementById("notif-switch");
const exifSlider = document.getElementById("exif-slider");
const notifSlider = document.getElementById("notif-slider");
const notifSection = document.getElementById("exif-notif-section");
const restartTooltip = document.getElementById("metadata-tooltip");

const isChrome = /chrome/i.test(navigator.userAgent);
const permissionsToRequest = {
	origins: ["<all_urls>"]
};

const options = {};
chrome.storage.local.get("cfg", (data) => {
	Object.assign(options, data.cfg);
	exifSwitch.checked = Boolean(options.exifClean);
	exifSwitch.checked ? EnableEvents(notifSection) : DisableEvents(notifSection);
	notifSwitch.checked = Boolean(options.notifications);
	exifSlider.style.display = "block";
	notifSlider.style.display = "block";
	restartTooltip.style.display = options.protectionStatus === ProtectionStatus.RestartRequired ? "flex" : "none";
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
	const cfg = changes.cfg?.newValue;

	if (cfg && namespace === "local") {
		if (cfg.exifClean !== undefined) {
			exifSwitch.checked = Boolean(cfg.exifClean);
			exifSwitch.checked ? EnableEvents(notifSection) : DisableEvents(notifSection);
		}
		if (cfg.protectionStatus) {
			restartTooltip.style.display = cfg.protectionStatus === ProtectionStatus.RestartRequired ? "flex" : "none";
		}
	}
});

function DisableEvents(el) {
	el.style.opacity = "0.5";
	el.style.pointerEvents = "none";
}
function EnableEvents(el) {
	el.style.opacity = "1";
	el.style.pointerEvents = "auto";
}

exifSwitch.addEventListener("change", (event) => {
	event.target.checked ? EnableEvents(notifSection) : DisableEvents(notifSection);

	options.exifClean = event.target.checked;

	chrome.storage.local
		.set({ cfg: options })
		.then(chrome.runtime.sendMessage({ msg: "exif", setting: event.target.checked }));
});

CheckPermission(permissionsToRequest, (isPermissionGranted) => {
	if (!isPermissionGranted) {
		chrome.storage.local.get("cfg", (data) => {
			data.cfg.notifications = false;
			notifSwitch.checked = false;
			chrome.storage.local.set({ cfg: data.cfg });
		});
	} else {
		chrome.storage.local.get("cfg", (data) => {
			Object.assign(options, data.cfg);
			notifSwitch.checked = Boolean(options.notifications);
		});
	}
});

notifSwitch.addEventListener("change", (event) => {
	chrome.permissions.request(permissionsToRequest);
	chrome.storage.local.get("cfg", (data) => {
		data.cfg.notifications = event.target.checked;
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
