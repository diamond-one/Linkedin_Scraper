"use strict";

const secureSearchBtnUltimate = document.querySelector("#features-section-ultimate .secure-search-btn");
const secureSearchBtn = document.querySelector("#features-section-default .secure-search-btn");
const secureSearchIconUltimate = document.querySelector("#features-section-ultimate .secure-search-icon");
const secureSearchIcon = document.querySelector("#features-section-default .secure-search-icon");
const featuresSectionUltimate = document.getElementById("features-section-ultimate");
const featuresSectionDefault = document.getElementById("features-section-default");
const metadataBtn = document.getElementById("metadata-btn");
const restartIcon = document.getElementById("metadata-icon");
const metadataIcon = document.querySelector(".metadata-cleanup-icon");
const protectedBanner = document.querySelector(".ok-banner");
const restartBanner = document.querySelector(".restart-banner");
const versionSpan = document.getElementById("version_no");

chrome.storage.local.get(["cfg"], (data) => {
	if (data && data.cfg && data.cfg.initialized) {
		HideLoadingPage();
		LoadPopupFeatures(data.cfg);
	} else {
		ShowLoadingPage();
	}
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
	if (
		changes.cfg?.newValue.privacyFeatures === false ||
		(changes.cfg?.newValue.privacyFeatures === true && namespace === "local")
	) {
		DisplayFeaturesSection(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.initialized) {
		HideLoadingPage();
		LoadPopupFeatures(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.protectionStatus) {
		DisplayRestartRequired(changes.cfg.newValue);
	}

	if (changes.cfg?.newValue.exifClean !== undefined) {
		UpdateExifCleanTile(changes.cfg.newValue);
	}
});

function DisplayFeaturesSection(config) {
	if (config.privacyFeatures) {
		featuresSectionUltimate.style.display = "grid";
		featuresSectionDefault.style.display = "none";
	} else {
		featuresSectionUltimate.style.display = "none";
		featuresSectionDefault.style.display = "flex";
	}
}

function DisplayRestartRequired(config) {
	if (config.protectionStatus === ProtectionStatus.RestartRequired) {
		restartBanner.style.display = "block";
		protectedBanner.style.display = "none";
		restartIcon.style.display = "block";
		metadataBtn.style.display = "none";
	} else if (config.protectionStatus === ProtectionStatus.Protected && config.exifClean === false) {
		restartBanner.style.display = "none";
		protectedBanner.style.display = "block";
		restartIcon.style.display = "none";
		metadataBtn.style.display = "block";
	} else {
		restartBanner.style.display = "none";
		protectedBanner.style.display = "block";
		restartIcon.style.display = "none";
	}
}

function HideLoadingPage() {
	document.querySelector(".loading-container").style.display = "none";
	document.querySelector(".main-container").style.display = "block";
}

function ShowLoadingPage() {
	document.querySelector(".loading-container").style.display = "block";
	document.querySelector(".main-container").style.display = "none";
}

function UpdateExifCleanTile(config) {
	if (config.exifClean) {
		metadataBtn.style.display = "none";
		metadataIcon.classList.add("metadata-icon-active");
	} else {
		if (config.protectionStatus === ProtectionStatus.RestartRequired) {
			metadataBtn.style.display = "none";
		} else {
			metadataBtn.style.display = "block";
		}
		metadataIcon.classList.remove("metadata-icon-active");
	}
}

function LoadPopupFeatures(data) {
	DisplayRestartRequired(data);
	DisplayFeaturesSection(data);
	UpdateExifCleanTile(data);
	if (data.searchOption && data.permissions) {
		secureSearchBtnUltimate.style.display = "none";
		secureSearchBtn.style.display = "none";
		secureSearchIconUltimate.classList.add("search-icon-active");
		secureSearchIcon.classList.add("search-icon-active");
	} else {
		secureSearchBtnUltimate.style.display = "block";
		secureSearchBtn.style.display = "block";
		secureSearchIconUltimate.classList.remove("search-icon-active");
		secureSearchIcon.classList.remove("search-icon-active");
	}
}

const secureSearchDefault = document.getElementById("secure-search-row-item");
secureSearchDefault.addEventListener("click", function () {
	window.location.href = "./securesearch.html";
});

const browserCleanupDefault = document.getElementById("browser-cleanup-row-item");
browserCleanupDefault.addEventListener("click", function () {
	window.location.href = "./browsingprivacy.html";
});

const secureSearchUltimate = document.getElementById("secure-search-tile");
secureSearchUltimate.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_secure-search" });
	window.location.href = "./securesearch.html";
});

const browserCleanupUltimate = document.getElementById("browser-cleanup-tile");
browserCleanupUltimate.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_browser-cleanup" });
	window.location.href = "./browsingprivacy.html";
});

const metadataCleanupUltimate = document.getElementById("metadata-cleanup-tile");
metadataCleanupUltimate.addEventListener("click", () => {
	chrome.runtime.sendMessage({ msg: "tile_metadata-cleanup" });
	window.location.href = "./exifcleaner.html";
});

const websiteSettingUltimate = document.getElementById("website-setting-tile");
websiteSettingUltimate.addEventListener("click", () => {
	chrome.storage.local.get(["cfg"], (data) => {
		if (data.cfg) {
			data.cfg.settingsTab = 2;
			chrome.storage.local.set({ cfg: data.cfg }, function () {
				chrome.tabs.query({ url: chrome.runtime.getURL("/action/settings.html") }, function (tabs) {
					if (tabs && tabs.length > 0) {
						chrome.tabs.update(tabs[0].id, { active: true }).then(() => window.close());
					} else {
						chrome.runtime.sendMessage({ msg: "tile_website-settings-review" });
						chrome.tabs.create({ url: "/action/settings.html" }).then(() => window.close());
					}
				});
			});
		}
	});
});

const gridItems = document.querySelectorAll(".item-hover");
gridItems.forEach((item) => {
	const icon = item.querySelector(".fl-icon > svg");
	const heading = item.querySelector(".fr-heading-text");
	const text = item.querySelector(".fr-text");
	item.addEventListener("mouseenter", () => {
		item.classList.add("item-hovered");
		icon.classList.add("icon-hovered");
		heading.classList.add("hide-on-hover");
		text.classList.add("show-on-hover");
	});
	item.addEventListener("mouseleave", () => {
		item.classList.remove("item-hovered");
		icon.classList.remove("icon-hovered");
		heading.classList.remove("hide-on-hover");
		text.classList.remove("show-on-hover");
	});
});

versionSpan.textContent = chrome.runtime.getManifest().version;
