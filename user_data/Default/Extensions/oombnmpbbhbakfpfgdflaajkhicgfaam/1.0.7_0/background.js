"use strict";
const isChrome = /chrome/i.test(navigator.userAgent);

if (isChrome) {
	try {
		importScripts("constants.js");
		importScripts("nativemsg.js");
	} catch (e) {
		
	}
}

let m_config = {
	version: 2, // Increment everytime you did any change in m_config,
	profile: "",
	exifClean: false,
	initialized: false,
	searchOption: isChrome,
	cookieSettings: isChrome,
	safeSearch: false,
	cleanupSettings: false,
	autoRemoveOption: false,
	excludedCookies: [],
	openTabsCheckbox: true,
	permissions: isChrome,
	productType: "ESET Security",
	privacyFeatures: "",
	protectionStatus: ProtectionStatus.Protected,
	tempClean: 0,
	histPeriod: 0,
	datatype: 0,
	histArPeriod: 0,
	datatypeAr: 0,
	activeTab: 1,
	settingsTab: 0,
	darkMode: false,
	notifications: false
};

// Default config for browsing data
let browsingData = {
	history: false,
	downloads: false,
	cookies: false,
	localStorage: false,
	indexedDB: false,
	cache: false,
	passwords: false,
	formData: false
};

if (isChrome) {
	browsingData.cacheStorage = false;
}

m_config.options = browsingData;
m_config.optionsAr = browsingData;
m_config.customOptions = {};
m_config.customArOptions = {};
m_config.msgCount = {
	exifCount: 0,
	searchCount: 0,
	privacyCount: 0
};

let cleanIntervalID = 0;
let clearCountDataIntervalID = 0;
const allUrls = "<all_urls>";
function ConfigUpdate(configVersion, updaterFcn) {
	return { version: configVersion, update: updaterFcn };
}
const configUpdateHistory = [ConfigUpdate(1, ConfigUpdate_1_0_5), ConfigUpdate(2, ConfigUpdate_1_0_7)];

function ConfigUpdate_1_0_5(prevConfig) {
	prevConfig.datatype = prevConfig.datatype === 1 ? 0 : prevConfig.datatype === 2 ? 1 : prevConfig.datatype;
	prevConfig.datatypeAr = prevConfig.datatypeAr === 1 ? 0 : prevConfig.datatypeAr === 2 ? 1 : prevConfig.datatypeAr;
}

function ConfigUpdate_1_0_7(prevConfig) {
	if (prevConfig.licence === false) {
		prevConfig.protectionStatus = ProtectionStatus.LicenseExpired;
	} else if (prevConfig.status === "restart-required") {
		prevConfig.protectionStatus = ProtectionStatus.RestartRequired;
	} else {
		prevConfig.protectionStatus = ProtectionStatus.Protected;
	}

	delete prevConfig.licence;
	delete prevConfig.status;
	delete prevConfig.connStatus;
}

chrome.runtime.onInstalled.addListener((details) => {
	if (details.reason === "install") {
		chrome.tabs.create({
			url: "/action/welcome.html"
		});
	} else if (details.reason === "update") {
		chrome.storage.local.get(["cfg"], (data) => {
			if (!data.cfg) {
				chrome.storage.local.set({ cfg: m_config });
			} else {
				RunUpdate(data.cfg, m_config);
				chrome.storage.local.set({ cfg: data.cfg });
			}
		});
	}
});

function RunUpdate(oldConfig, newConfig) {
	oldConfig.version = oldConfig.version || 0;

	for (const update_increment of configUpdateHistory) {
		if (oldConfig.version < update_increment.version) {
			try {
				update_increment.update(oldConfig);
				oldConfig.version = update_increment.version;
			} catch (error) {
				
				Object.assign(oldConfig, newConfig);
				break;
			}
		}
	}

	oldConfig.version = newConfig.version;
}

chrome.runtime.onStartup.addListener(() => {
	InitLocalSettings();
});

InitLocalSettings();

function InitLocalSettings() {
	try {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data && data.cfg) {
				SendNativeMessage("init", { profile: data.cfg.profile });
			} else {
				chrome.storage.local.set({ cfg: m_config }).then(() => {
					SendNativeMessage("init", {});
					CheckEndOfMonth();
				});
			}
		});
	} catch (e) {
		
	}
}

chrome.storage.onChanged.addListener(function (changes) {
	const cfg = changes.cfg?.newValue;

	if (!cfg) {
		return;
	}

	switch (cfg.protectionStatus) {
		case ProtectionStatus.LicenseExpired:
			chrome.action.setPopup({ popup: "./action/alert_expired_license.html" });
			break;
		case ProtectionStatus.ConnectionLost:
			chrome.action.setPopup({ popup: "./action/alert_connection_lost.html" });
			break;
		case ProtectionStatus.UnsupportedBrowser:
			chrome.action.setPopup({ popup: "./action/alert_unsupported_browser.html" });
			break;
		case ProtectionStatus.MissingProduct:
			chrome.action.setPopup({ popup: "./action/alert_missing_product.html" });
			break;
		default:
			chrome.action.setPopup({ popup: "./action/popup.html" });
			break;
	}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete") {
		const googleDomains = ["https://www.google.*/search*", "https://www.google.*.*/search*"];
		const bingDomains = ["https://www.bing.*/search*", "https://www.bing.*.*/search*"];
		const permissionsToRequest = {
			origins: [allUrls]
		};
		const commonJsFile = "./secure-search/common.js";
		const iconStyles = "./secure-search/styles/iconStyles.js";
		const iconPopupStyles = "./secure-search/styles/popupStyles.js";
		let domainJSFile = null;

		if (googleDomains.some((domain) => MatchWithWildcard(tab.url, domain))) {
			domainJSFile = "./secure-search/g-search.js";
		} else if (bingDomains.some((domain) => MatchWithWildcard(tab.url, domain))) {
			domainJSFile = "./secure-search/b-search.js";
		}

		if (domainJSFile) {
			CheckPermission(permissionsToRequest, (isPermissionGranted) => {
				if (isPermissionGranted) {
					chrome.tabs.sendMessage(tabId, "isInjected", { frameId: 0 }, () => {
						if (chrome.runtime.lastError) {
							InjectScript(tabId, iconStyles, iconPopupStyles, commonJsFile, domainJSFile);
						}
					});
				}
			});
		}
	}
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

chrome.permissions.onAdded.addListener(function (permissions) {
	if (permissions.origins && permissions.origins.includes(allUrls)) {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data.cfg) {
				data.cfg.permissions = true;
				chrome.storage.local.set({ cfg: data.cfg });
			}
		});
	}
});

chrome.permissions.onRemoved.addListener(function (permissions) {
	if (permissions.origins && permissions.origins.includes(allUrls)) {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data.cfg) {
				data.cfg.permissions = false;
				chrome.storage.local.set({ cfg: data.cfg });
			}
		});
	}
});

function InjectScript(tabId, ...jsFiles) {
	chrome.scripting.executeScript({
		target: { tabId: tabId },
		files: jsFiles
	});
}

function MatchWithWildcard(url, pattern) {
	const regexPattern = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*").replace(/\//g, "\\/");
	const regex = new RegExp(`^${regexPattern}$`);
	return regex.test(url);
}

const SetAutoRemoveOption = (value) => {
	chrome.storage.local.get(["cfg"], (data) => {
		if (data.cfg) {
			data.cfg.autoRemoveOption = value;
			chrome.storage.local.set({ cfg: data.cfg });
		}
	});
};

const ClearMonthlyStats = () => {
	chrome.storage.local.get(["cfg"], (data) => {
		if (data.cfg) {
			data.cfg.msgCount = { exifCount: 0, privacyCount: 0, searchCount: 0 };
			chrome.storage.local.set({ cfg: data.cfg });
		}
	});
};

const IsFirstDayOfMonth = (date = new Date()) => {
	const oneDayInMs = 1000 * 60 * 60 * 24;
	return new Date(date.getTime() + oneDayInMs).getDate() === 2;
};

const CheckEndOfMonth = () => {
	clearInterval(clearCountDataIntervalID);
	const oneDayInMs = 1000 * 60 * 60 * 24;
	clearCountDataIntervalID = setInterval(() => {
		if (IsFirstDayOfMonth()) {
			ClearMonthlyStats();
		}
	}, oneDayInMs);
};

function MonitorTab(tabId, url, parentId) {
	
	return false;
}

function GetTimeOrigin() {
	const timeOrigin = performance.timeOrigin;
	SaveTimeToLocalStorage(timeOrigin);
	return timeOrigin;
}

function SaveTimeToLocalStorage(value) {
	chrome.storage.local.get("cfg", (data) => {
		data.cfg.tempClean = value;
		chrome.storage.local.set(data);
	});
}

function GetTime(msecs) {
	return new Date().getTime() - msecs;
}

async function GetExcludedUrls() {
	chrome.storage.local.get(["cfg"], (data) => {
		return data.cfg.excludedCookies || [];
	});
}

function GetRemovalPeriod(choice) {
	const msecsPerHour = 1000 * 60 * 60;

	switch (parseInt(choice)) {
		case 1:
			return null;
		case 2:
			return GetTimeOrigin();
		case 3:
			return GetTime(msecsPerHour);
		case 4:
			return GetTime(msecsPerHour * 24);
		case 5:
			return GetTime(msecsPerHour * 24 * 7);
		case 6:
			return GetTime(msecsPerHour * 24 * 7 * 4);
		default:
			return null;
	}
}

function ParseOrigin(stringUrl) {
	return new URL(stringUrl).origin;
}

function GetOrigins(tabs) {
	let origins = new Set();
	tabs.forEach(function (tab) {
		if (/^((http|https):\/\/)/.test(tab.url)) {
			const origin = ParseOrigin(tab.url);
			origins.add(origin);
		}
	});
	return Array.from(origins);
}

async function GetActiveTabs() {
	return chrome.tabs.query({}).then(GetOrigins);
}

function RemoveBrowsingData(period, options) {
	const removeCookies = options.cookies;
	const removeData = { ...options };
	delete removeData.cookies;
	delete removeData.localStorage;
	delete removeData.indexedDB;
	if (isChrome) {
		delete removeData.cacheStorage;
	}

	chrome.browsingData.remove({ since: period }, removeData);
	if (removeCookies) {
		RemoveCookies(period);
	}
}

function AddRemoveProto(hostsArr, addProto) {
	let origins = [];
	hostsArr.forEach(function (hostName) {
		if (addProto) {
			const url = new URL("https://" + hostName);
			origins.push(url.origin);
		} else {
			const url = hostName.replace(/^https?:\/\//, "");
			origins.push(url);
		}
	});
	return origins;
}

async function GetExcludedUrlList() {
	let activeTabs = await GetActiveTabs();
	return chrome.storage.local.get(["cfg"]).then((data) => {
		if (data.cfg.cookieSettings) {
			let excludedUrlList = data.cfg.excludedCookies ? AddRemoveProto(data.cfg.excludedCookies, true) : [];
			if (data.cfg.openTabsCheckbox) {
				excludedUrlList.push(...activeTabs);
			}
			return excludedUrlList;
		}
		return [];
	});
}

async function RemoveCookies(period) {
	const excludedUrlList = await GetExcludedUrlList();
	if (isChrome) {
		let removalOptions = { since: period };
		if (excludedUrlList.length) {
			removalOptions.excludeOrigins = excludedUrlList;
		}
		chrome.browsingData.remove(removalOptions, {
			cookies: true,
			localStorage: true,
			indexedDB: true,
			cacheStorage: true
		});
	} else {
		if (excludedUrlList.length) {
			await RemoveCookiesExceptDomainsFirefox(excludedUrlList, period);
		} else {
			chrome.browsingData.removeCookies({ since: period });
			chrome.browsingData.remove({}, { localStorage: true, indexedDB: true });
		}
	}
}

async function RemoveCookiesExceptDomainsFirefox(urlList, period) {
	const urlListNoProto = AddRemoveProto(urlList, false);
	const cookieStores = await chrome.cookies.getAllCookieStores();
	for (const store of cookieStores) {
		const cookies = await chrome.cookies.getAll({ storeId: store.id });
		cookies.forEach((cookie) => {
			const cookieDomain =
				cookie.hostOnly === false && cookie.domain.startsWith(".") ? cookie.domain.slice(1) : cookie.domain;
			let shouldDelete = true;
			if (cookie.hostOnly === true) {
				shouldDelete = !urlListNoProto.includes(cookieDomain);
			} else {
				shouldDelete = !urlListNoProto.some(
					(excldedUrl) =>
						excldedUrl.endsWith(cookieDomain) &&
						(excldedUrl == cookieDomain || excldedUrl[excldedUrl.length - 1 - cookieDomain.length] == ".")
				);
			}
			if (shouldDelete) {
				chrome.browsingData.removeCookies({ hostnames: [cookieDomain], since: period });
				chrome.browsingData.remove({ hostnames: [cookieDomain] }, { localStorage: true, indexedDB: true });
			}
		});
	}
}

async function SetAutoRemoveOn(periodInput, config) {
	const period = GetRemovalPeriod(periodInput);
	const interval = 1000 * 60 * 60;

	clearInterval(cleanIntervalID);
	RemoveBrowsingData(period, config);

	cleanIntervalID = setInterval(() => {
		RemoveBrowsingData(period, config);
	}, interval);
}

function checkAutoRemoveOption(configData) {
	if (!configData) {
		return;
	}

	if (configData.autoRemoveOption === false) {
		clearInterval(cleanIntervalID);

		return;
	}

	switch (configData.datatypeAr) {
		case BrowsingDataType.private:
			SetAutoRemoveOn(configData.histArPeriod, configData.optionsAr);
			break;
		case BrowsingDataType.custom:
			SetAutoRemoveOn(configData.histArPeriod, configData.customArOptions);
			break;
		default:
			break;
	}
}

async function OnMessage(request) {
	if (request.msg === "clean-auto") {
		checkAutoRemoveOption(request.data);
	}
	if (request.msg === "clean") {
		const period = GetRemovalPeriod(request.data.histPeriod);
		if (request.data.datatype === 1) {
			RemoveBrowsingData(period, request.data.customOptions);
		} else {
			RemoveBrowsingData(period, request.data.options);
		}
	}
	if (request.msg === "secure-search") {
		SendNativeMessage(request.msg, { data: request.data });
	}
	if (request.msg === "exif") {
		SendNativeMessage("cfg", { data: { exifClean: request.setting } });
	}

	if (request.msg === "get-site-settings") {
		SendNativeMessage(request.msg, {});
	}
	if (request.msg === "get-active-tabs") {
		let activeTabs = await GetActiveTabs();
		chrome.runtime.sendMessage({ type: "active-tabs", urls: activeTabs });
	}
	if (request.msg === "conn-error") {
		RestartConnector();
		InitLocalSettings();
	}
	if (request.msg === "open-gui") {
		SendNativeMessage("open-gui", {});
	}
	if (request.msg === "popup-opened") {
		SendNativeMessage("popup-opened", {});
	}
	if (
		[
			"options_open",
			"tile_secure-search",
			"tile_browser-cleanup",
			"tile_metadata-cleanup",
			"tile_website-settings-review"
		].includes(request.msg)
	) {
		SendNativeMessage("trace", { data: request.msg });
	}
	if (request.msg === "log-info") {
		SendNativeMessage("log", { data: request.info });
	}

	return { clean: "ok" };
}

// Main listener for the messages from the content scripts and the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (
		![
			"clean",
			"exif",
			"clean-auto",
			"get-screen",
			"status",
			"openSB",
			"stayUnsecured",
			"secure-search",
			"get-site-settings",
			"settings",
			"get-active-tabs",
			"conn-error",
			"open-gui",
			"popup-opened",
			"options_open",
			"tile_secure-search",
			"tile_browser-cleanup",
			"tile_metadata-cleanup",
			"tile_website-settings-review",
			"log-info"
		].includes(request.msg)
	) {
		return;
	}

	if (
		m_config?.protectionStatus === ProtectionStatus.LicenseExpired &&
		!["popup-opened", "open-gui"].includes(request.msg)
	) {
		return;
	}

	if (request.msg === "secure-search") {
		if (!request.err) {
			request.data.tabId = sender.tab.id;
		}
	}

	OnMessage(request).then((response) => sendResponse(response));

	return true;
});
