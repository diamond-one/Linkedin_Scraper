"use strict";

const NATIVE_APP = "com.eset.browserprivacyandsecurity";
const MissingProductErrorsList = [
	"Specified native messaging host not found.",
	`No such native application ${NATIVE_APP}`
];
let g_connector = null;
let exifMsgCounter = 0;
let exifMsgResetTimer;
let initErrorCounter = 0;
let lastError;

function NativeMsgListener(msg) {
	
	if (!(msg instanceof Object)) {
		lastError = `Invalid message format: ${JSON.stringify(msg)}`;
	} else if (msg.log) {
		
	} else if (msg.connect === "error") {
		ShowAlertPopup(ProtectionStatus.ConnectionLost);
		if (initErrorCounter === 0) {
			g_connector.disconnect();
			g_connector = null;
			initErrorCounter++;
			GetConnector();
		}
	} else {
		ProcessMessage(msg).then((replyDetail) => {
			FinishRequest(msg?.syn || 0, replyDetail);
		});
	}

	if (lastError) {
		FinishRequest(0, lastError);
		lastError = "";
	}
}

async function ProcessMessage(msg) {
	let reply = null;

	if (msg.cmd) {
		if (msg.cmd === "init") {
			initErrorCounter = 0;
			reply = await UpdateSettings(msg.settings, msg?.profile);

			ShowAlertPopup(reply.protectionStatus);
            checkAutoRemoveOption(reply);
		} else if (msg.cmd === "secure-search" && msg.tabId) {
			chrome.tabs.sendMessage(msg.tabId, { payload: msg }, () => {
				
			});
		} else if (msg.cmd === "uninstall") {
			chrome.management.uninstallSelf();
		} else if (msg.cmd === "get-site-settings") {
			if (msg.user_data && isChrome) {
				chrome.runtime.sendMessage({ type: "site-setting", user_data: msg.user_data });
			}
		}
	} else if (msg.settings) {
		reply = await UpdateSettings(msg.settings, msg?.profile);
	} else if (msg.notification?.metadata_cleanup) {
		chrome.storage.local.get(["cfg"], (data) => {
			if (data.cfg.notifications) {
				exifMsgCounter++;
				PushNotification(exifMsgCounter);
			}
		});
	}

	return reply;
}

function FinishRequest(msgId, detail) {
	SendNativeMessage("log", {
		data: {
			ack: msgId,
			detail: detail ? JSON.stringify(detail) : ""
		}
	});
}

function UpdateSettings(settings, profile = null) {
	return new Promise((resolve) => {
		chrome.storage.local.get(["cfg"], (data) => {
			data.cfg.initialized = true;
			data.cfg.exifClean = settings.exif;
			data.cfg.productType = ProductMap.get(settings.product).name;
			data.cfg.privacyFeatures = ProductMap.get(settings.product).privacy;

			if (settings.protectionStatus) {
				data.cfg.protectionStatus = settings.protectionStatus;
			} else if (settings.licence === false) {
				data.cfg.protectionStatus = ProtectionStatus.LicenseExpired;
			} else if (settings.status === "restart-required") {
				data.cfg.protectionStatus = ProtectionStatus.RestartRequired;
			} else {
				data.cfg.protectionStatus = ProtectionStatus.Protected;
			}

			if (!data.cfg.profile && profile) {
				data.cfg.profile = profile;
			}

			chrome.storage.local.set({ cfg: data.cfg }).then(() => {
				resolve(data.cfg);
			});
		});
	});
}

function ResetCounter() {
	exifMsgCounter = 0;
	chrome.storage.local.get(["cfg"], (data) => {
		data.cfg.msgCount.exifCount = exifMsgCounter;
		chrome.storage.local.set({ cfg: data.cfg });
	});
}

function PushNotification(count) {
	clearTimeout(exifMsgResetTimer);

	const UpdateCounter = () => {
		return new Promise((resolve) => {
			chrome.storage.local.get(["cfg"], (data) => {
				data.cfg.msgCount.exifCount = count;
				chrome.storage.local.set({ cfg: data.cfg }, () => {
					resolve();
				});
			});
		});
	};

	UpdateCounter().then(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.scripting.executeScript({ target: { tabId: tabs[0].id }, files: ["notifications.js"] });
		});

		exifMsgResetTimer = setTimeout(ResetCounter, 10000);
	});
}

function SendNativeMessage(cmd, { profile = null, data = null }) {
	let nativemsg = {
		cmd: cmd,
		syn: Math.floor(Math.random() * Math.pow(2, 20))
	};

	if (profile !== null && profile.length) {
		nativemsg.profile = profile;
	}

	if (data !== null) {
		nativemsg.data = data;
	}

	
	GetConnector()?.postMessage(nativemsg);
}

function NativeDisconnect(onDisconnectArg) {
	
	if (chrome.runtime.lastError) {
		lastError = chrome.runtime.lastError.message;
	} else if (onDisconnectArg && onDisconnectArg.error.message) {
		lastError = onDisconnectArg.error.message;
	}

	g_connector = null;

	if (MissingProductErrorsList.includes(lastError)) {
		ShowAlertPopup(ProtectionStatus.MissingProduct);
	} else {
		ShowAlertPopup(ProtectionStatus.ConnectionLost);
	}
}

function ShowAlertPopup(alertCode) {
	let isAlert = true;

	switch (alertCode) {
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
			isAlert = false;
			break;
	}

	if (!isAlert) {
		return;
	}

	chrome.storage.local.get(["cfg"], (data) => {
		data.cfg.protectionStatus = alertCode;
		chrome.storage.local.set({ cfg: data.cfg });
	});
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

function GetConnector() {
	if (!g_connector) {
		try {
			g_connector = chrome.runtime.connectNative(NATIVE_APP);
			g_connector.onMessage.addListener(NativeMsgListener);
			g_connector.onDisconnect.addListener(NativeDisconnect);
		} catch (e) {
			ShowAlertPopup(ProtectionStatus.ConnectionLost);
			
			lastError = e.message;
			g_connector = null;
		}
	}

	return g_connector;
}

function RestartConnector() {
	if (g_connector) {
		g_connector.disconnect();
		g_connector = null;
		initErrorCounter = 0;
	}
}
