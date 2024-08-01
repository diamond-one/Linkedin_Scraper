chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg === "isInjected") {
		sendResponse(true);
	}
});

const isChrome = /chrome/i.test(navigator.userAgent);
const htmlDirection = document.documentElement.getAttribute("dir");
let popupElement;

function ParseDom(nodes) {
	const resp = { msg: "secure-search" };
	if ((Array.isArray(nodes) || NodeList.prototype.isPrototypeOf(nodes)) && nodes.length) {
		resp.data = {};
		resp.data.urls = [];
		nodes.forEach(function (node) {
			const url = GetUrlFromNode(node);
			if (url) {
				resp.data.urls.push(url);
			}
		});

		if (resp.data.urls.length > 0) {
			chrome.runtime.sendMessage(resp, () => {
				
			});
		}
	} else if (typeof nodes === "string") {
		resp.err = nodes;
		chrome.runtime.sendMessage(resp, () => {
			
		});
	}
}

function GetUrlFromNode(node) {
	let url;

	if (node.nodeName.toLowerCase() === "a" && node.classList.contains("sVXRqc")) {
		url = node.getAttribute("data-pcu");
	} else {
		const urlNode = node.querySelector("a[href]:not(.b_adcaret)");

		if (urlNode) {
			url = UnpackUrl(urlNode.getAttribute("href"));
		}
	}
	return url;
}

function RenderDom(msg, nodes) {
	if (nodes.length && (Array.isArray(nodes) || NodeList.prototype.isPrototypeOf(nodes))) {
		for (let i = 0; i < nodes.length; i++) {
			const node = nodes[i];
			const url = GetUrlFromNode(node);
			if (msg.hasOwnProperty("warn")) {
				if (msg["warn"].includes(url)) {
					CreateIcon(node, { flag: "warning" });
				} else {
					CreateIcon(node, { flag: "safe" });
				}
			} else if (msg.hasOwnProperty("bad")) {
				if (msg["bad"].includes(url)) {
					CreateIcon(node, { flag: "threat" });
				} else {
					CreateIcon(node, { flag: "safe" });
				}
			} else {
				CreateIcon(node, { flag: "safe" });
			}
		}
	}
}

function CreateStyledShadowDom(styleSheet, stylesCSS) {
	const shadowHost = document.createElement("span");
	const shadowRoot = shadowHost.attachShadow({ mode: "open" });

	shadowHost.className = "shadowHost";

	// TODO: Check if the bug with adoptedStyleSheets in Firefox was fixed. https://bugzilla.mozilla.org/show_bug.cgi?id=1751346
	if (isChrome) {
		shadowRoot.adoptedStyleSheets = [styleSheet];
	} else {
		const innerStyles = document.createElement("style");

		innerStyles.innerText = stylesCSS;
		shadowRoot.appendChild(innerStyles);
	}

	return [shadowHost, shadowRoot];
}

function SetElementDir(node) {
	if (htmlDirection === "rtl") {
		node.dir = "rtl";
	}
}

function CreateIcon(node, msg) {
	const queryResult = GetTargetNode(node);

	if (queryResult instanceof Element) {
		const [shadowHost, shadowRoot] = CreateStyledShadowDom(safetyIconStyleSheet, safetyIconStylesCSS);
		const iconElem = document.createElement("span");

		if (queryResult.classList.contains("d8lRkd")) {
			iconElem.className = "icon-ad-container";
		} else {
			iconElem.className = "icon-container";
		}

		const iconImgWrapper = document.createElement("span");
		iconImgWrapper.className = "icon-img-wrapper";

		CreateIconImage(iconImgWrapper, msg.flag);

		iconElem.appendChild(iconImgWrapper);
		shadowRoot.appendChild(iconElem);
		queryResult.appendChild(shadowHost);

		iconElem.addEventListener("mouseenter", () => {
			ShowPopup(iconImgWrapper, msg);
		});

		iconElem.addEventListener("mouseleave", () => {
			const timeoutId = setTimeout(function () {
				HidePopup();
			}, 100);
			iconElem.addEventListener("mouseenter", () => {
				clearTimeout(timeoutId);
			});
		});
	}
}

function CreateIconImage(node, msg) {
	const iconImg = document.createElement("img");
	iconImg.className = "icon-img";

	if (msg === "warning") {
		iconImg.src = chrome.runtime.getURL("images/icon_warning.svg");
	} else if (msg === "threat") {
		iconImg.src = chrome.runtime.getURL("images/icon_threat.svg");
	} else {
		iconImg.src = chrome.runtime.getURL("images/icon_ok.svg");
	}

	node.appendChild(iconImg);
}

function CreatePopup() {
	const [shadowHost, shadowRoot] = CreateStyledShadowDom(safetyIconPopupStyleSheet, safetyIconPopupStylesCSS);

	const popup = document.createElement("div");
	popup.className = "popup";
	SetElementDir(popup);

	chrome.storage.local.get("cfg", (data) => {
		popup.classList.add(data.cfg.darkMode ? "dark-mode" : "light-mode");
	});

	const popupContent = document.createElement("div");
	popupContent.className = "popup-content";

	const popupImg = document.createElement("img");
	popupImg.className = "popup-img";
	popupImg.src = chrome.runtime.getURL("images/icon_eset.svg");

	const popupText = document.createElement("p");
	popupText.className = "popup-text";

	popupContent.append(popupImg, popupText);
	popup.appendChild(popupContent);
	shadowRoot.appendChild(popup);
	popupElement = { popup, popupText };
	HidePopup();
	document.body.append(shadowHost);
}

function ShowPopup(node, msg) {
	const { popup, popupText } = popupElement;

	if (msg.flag === "threat") {
		popup.classList.remove("popup-yellow", "popup-green");
		popup.classList.add("popup-red");
		popupText.innerText = chrome.i18n.getMessage("secure_search_red_popup_text");
	} else if (msg.flag === "warning") {
		popup.classList.remove("popup-red", "popup-green");
		popup.classList.add("popup-yellow");
		popupText.innerText = chrome.i18n.getMessage("secure_search_yellow_popup_text");
	} else {
		popup.classList.remove("popup-red", "popup-yellow");
		popup.classList.add("popup-green");
		popupText.innerText = chrome.i18n.getMessage("secure_search_green_popup_text");
	}

	popup.classList.remove("popup-hidden");
	SetPositionAt(node, popup);
}

function HidePopup() {
	popupElement.popup.classList.add("popup-hidden");
}

function GetElemCoords(elem) {
	let box = elem.getBoundingClientRect();
	return {
		top: box.top + window.scrollY,
		right: box.right + window.scrollX,
		bottom: box.bottom + window.scrollY,
		left: box.left + window.scrollX
	};
}

function SetPositionAt(anchor, elem) {
	let anchorCoords = GetElemCoords(anchor);
	if (htmlDirection === "rtl") {
		elem.style.left = anchorCoords.right - elem.offsetWidth - anchor.offsetWidth * 1.5 + "px";
	} else {
		elem.style.left = anchorCoords.left + anchor.offsetWidth * 1.5 + "px";
	}

	elem.style.top = anchorCoords.top - anchor.offsetHeight + 10 + "px";
}

function UnpackUrl(extractedUrl) {
	try {
		const urlObj = new URL(extractedUrl);

		if (urlObj.host === "www.bing.com" && ["/ck/a", "/aclick", "/aclk"].includes(urlObj.pathname)) {
			const baseUrl = urlObj.searchParams.get("u");

			if (baseUrl) {
				let decodedUrl;

				if (urlObj.pathname === "/ck/a") {
					let modifiedBaseUrl = baseUrl.startsWith("a1a") ? `a${baseUrl.substring(3)}` : baseUrl;
					const chars = {
						"-": "+",
						_: "/"
					};
					decodedUrl = atob(modifiedBaseUrl.replace(/[-_]/g, (match) => chars[match]));
				} else {
					decodedUrl = decodeURIComponent(atob(baseUrl));
				}

				return decodedUrl;
			}
		}
	} catch (e) {
		
	}

	return extractedUrl;
}
