"use strict";

const isChrome = /chrome/i.test(navigator.userAgent);

const config = {};

const privateBrowsingData = {
	history: true,
	downloads: true,
	cookies: true,
	localStorage: true,
	formData: true
};

if (isChrome) {
	privateBrowsingData.cacheStorage = true;
}

const checkboxMap = {
	browsingHistory: { history: true },
	downloadHistory: { downloads: true },
	cookiesAndSiteData: isChrome
		? { cookies: true, localStorage: true, indexedDB: true, cacheStorage: true }
		: { cookies: true, localStorage: true, indexedDB: true },
	cachedImages: { cache: true },
	passwords: { passwords: true },
	formData: { formData: true }
};
let checkboxOptions = {};
let checkboxArOptions = {};

const cleanBtnDiv = document.querySelector(".clean-btn-div");
const saveBtnDiv = document.querySelector(".save-btn-div");
const cleanBtn = document.querySelector("#clean-btn");
const saveBtn = document.querySelector("#save-btn");
const saveBtnText = document.querySelector("#save-btn .btn-text");
const cleanBtnText = document.querySelector("#clean-btn .btn-text");
const saveBtnAnimation = document.querySelector("#save-btn .rotating-circle");
const cleanBtnAnimation = document.querySelector("#clean-btn .rotating-circle");

const dataBts = document.querySelectorAll(".data-otr-btn");
const dataArBts = document.querySelectorAll(".data-ar-btn");
const dataArBtsSection = document.querySelector("#data-ar-bts");
const periodSelectForm = document.querySelector("#period-select");
const periodArSelectForm = document.querySelector("#period-ar-select");

const leftTab = document.querySelector("#left-tab");
const rightTab = document.querySelector("#right-tab");
const leftTabText = document.querySelector("#left-tab-text");
const rightTabText = document.querySelector("#right-tab-text");
const formArSection = document.querySelectorAll(".form-ar-section");
const formArContent = document.querySelector("#form-ar-content");
const formOtrContent = document.querySelector("#form-otr-content");
const arContent = document.querySelector("#content-ar");

const btnDiv = document.querySelector(".clean-btn-div");
const dataDescriptionSection = document.querySelector("#data-description-section");
const dataArDescriptionSection = document.querySelector("#data-ar-description-section");

const checkboxes = document.querySelectorAll('input[type=checkbox][name="custom"]');
const checkboxesAr = document.querySelectorAll('input[type=checkbox][name="customAr"]');

const customInput = document.querySelector(".custom-input-data");

const customArInput = document.querySelector(".custom-input-ar-data");

const arSwitch = document.querySelector("#ar-switch");
const headerLink = document.querySelector("#popup-subheader-text > span");

const deleteBtnDefaultText = chrome.i18n.getMessage("browsing_one_time_cleanup_delete_btn");
const deleteBtnDeletingText = chrome.i18n.getMessage("browsing_one_time_cleanup_delete_btn_deleting_text");
const deleteBtnDeletedText = chrome.i18n.getMessage("browsing_one_time_cleanup_delete_btn_deleted_text");

const saveBtnDefaultText = chrome.i18n.getMessage("browsing_regular_cleanup_save_btn");
const saveBtnSavingText = chrome.i18n.getMessage("browsing_regular_cleanup_save_btn_saving_text");
const saveBtnSavedText = chrome.i18n.getMessage("browsing_regular_cleanup_save_btn_saved_text");

chrome.storage.local.get("cfg", (data) => {
	Object.assign(config, data.cfg);
	CreateSelectForm(periodSelectForm, config.histPeriod);
	CreateSelectForm(periodArSelectForm, config.histArPeriod);
	arSwitch.checked = Boolean(config.autoRemoveOption);
	arSwitch.checked ? EnableSelection() : DisableSelection();
	config.activeTab === 2 ? DisplayTab("right") : DisplayTab("left");
	Object.assign(checkboxOptions, config.customOptions);
	UpdateCheckboxes("custom", checkboxOptions);
	Object.assign(checkboxArOptions, config.customArOptions);
	UpdateCheckboxes("customAr", checkboxArOptions);
	HandleDataConfig(config.datatype);
	HandleDataArConfig(config.datatypeAr);

	if (config.datatype === BrowsingDataType.private) {
		dataDescriptionSection.style.display = "block";
	}

	if (config.datatype === BrowsingDataType.custom) {
		document.body.style.height = "600px";
		customInput.style.display = "block";
	}

	if (config.datatypeAr === BrowsingDataType.private) {
		dataArDescriptionSection.style.display = "block";
	}

	if (config.datatypeAr === BrowsingDataType.custom) {
		document.body.style.height = "600px";
		customArInput.style.display = "block";
	}

	if (config.histPeriod === 0) {
		DisableBtnEvents(cleanBtn);
	} else {
		EnableBtnEvents(cleanBtn);
	}
	if (config.histArPeriod === 0 || !arSwitch.checked) {
		DisableBtnEvents(saveBtn);
	} else {
		EnableBtnEvents(saveBtn);
	}

	SelectBtn(dataBts, config.datatype);
	SelectBtn(dataArBts, config.datatypeAr);
});

function SelectBtn(btns, value) {
	btns.forEach((btn) => {
		parseInt(btn.value) === value ? btn.classList.add("data-btn-active") : null;
	});
}

function UpdateCheckboxes(checkboxName, checkboxOptions) {
	document.querySelectorAll(`input[name="${checkboxName}"]`).forEach((checkbox) => {
		const mappedProperties = checkboxMap[checkbox.value];
		if (mappedProperties) {
			const isAnyPropertyChecked = Object.keys(mappedProperties).some((property) => checkboxOptions[property]);
			checkbox.checked = isAnyPropertyChecked;
		}
	});
}

function CreateSelectForm(elRef, value = 0) {
	const selElmnt = elRef.getElementsByTagName("select")[0];
	selElmnt.selectedIndex = +value;
	const selItem = document.createElement("div");
	selItem.setAttribute("class", "select-selected");
	selItem.textContent = selElmnt.options[selElmnt.selectedIndex].textContent;
	elRef.appendChild(selItem);
	const optionList = document.createElement("div");
	optionList.setAttribute("class", "select-items select-hide");
	for (let j = 1; j < selElmnt.length; j++) {
		const optionItem = document.createElement("div");
		optionItem.textContent = selElmnt.options[j].textContent;
		optionItem.addEventListener("click", function (e) {
			const selBox = this.parentNode.parentNode.getElementsByTagName("select")[0];
			const prevSibl = this.parentNode.previousSibling;
			for (let i = 0; i < selBox.length; i++) {
				if (selBox.options[i].textContent == this.textContent) {
					selBox.selectedIndex = i;
					prevSibl.textContent = this.textContent;
					const sameEl = this.parentNode.getElementsByClassName("same-as-selected");
					for (let k = 0; k < sameEl.length; k++) {
						sameEl[k].removeAttribute("class");
					}
					this.setAttribute("class", "same-as-selected");
					selBox.dispatchEvent(new window.Event("change"));
					break;
				}
			}
			prevSibl.click();
		});
		optionList.appendChild(optionItem);
	}
	elRef.appendChild(optionList);
	selItem.addEventListener("click", (e) => {
		e.stopPropagation();
		CloseAllSelect(this);
		selItem.nextSibling.classList.toggle("select-hide");
		selItem.classList.toggle("select-arrow-active");
	});
}

function CloseAllSelect(elmnt) {
	let arrNo = [];
	const selItems = document.getElementsByClassName("select-items");
	const selected = document.getElementsByClassName("select-selected");
	for (let i = 0; i < selItems.length; i++) {
		if (elmnt == selected[i] || elmnt === undefined) {
			arrNo.push(i);
		} else {
			selected[i].classList.remove("select-arrow-active");
		}
	}
}

const periodSelect = document.querySelector("#period-selector");
periodSelect.addEventListener("change", (e) => {
	EnableBtnEvents(cleanBtn);
	StoreConfigOptions("histPeriod", parseInt(e.target.value));
});

const periodArSelect = document.querySelector("#period-ar-selector");
periodArSelect.addEventListener("change", (e) => {
	EnableBtnEvents(saveBtn);
	StoreConfigOptions("histArPeriod", parseInt(e.target.value));
});

function SendMessageToBackground(msg, data) {
	chrome.runtime.sendMessage({ msg, data }, (response) => {
		
	});
}

function HandleButtonAction(btn, actionType, btnAnimation, btnText) {
	Promise.resolve()
		.then(() => Delay(200))
		.then(() => {
			btn.classList.remove("cleanup-btn");
			btn.classList.add("cleanup-btn-disabled");
			btnText.classList.add("btn-text-disabled");
			btnAnimation.style.display = "block";
			btnText.innerText = actionType === "clean" ? deleteBtnDeletingText : saveBtnSavingText;
		})
		.then(() => Delay(1500))
		.then(() => SendMessageToBackground(actionType, config))
		.then(() => {
			btnAnimation.style.display = "none";
			btnText.innerText = actionType === "clean" ? deleteBtnDeletedText : saveBtnSavedText;
		})
		.then(() => Delay(1000))
		.then(() => {
			btn.classList.remove("cleanup-btn-disabled");
			btn.classList.add("cleanup-btn");
			btnText.classList.remove("btn-text-disabled");
			btnText.innerText = actionType === "clean" ? deleteBtnDefaultText : saveBtnDefaultText;
		});
}

function Delay(duration) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

cleanBtn.addEventListener("click", () => {
	if (
		((config.datatype === BrowsingDataType.custom && IsCheckboxChecked(checkboxOptions)) ||
			config.datatype !== BrowsingDataType.custom) &&
		config.histPeriod > 0
	) {
		HandleButtonAction(cleanBtn, "clean", cleanBtnAnimation, cleanBtnText);
	}
});

saveBtn.addEventListener("click", () => {
	if (
		((config.datatypeAr === BrowsingDataType.custom && IsCheckboxChecked(checkboxArOptions)) ||
			config.datatypeAr !== BrowsingDataType.custom) &&
		config.histArPeriod > 0
	) {
		HandleButtonAction(saveBtn, "clean-auto", saveBtnAnimation, saveBtnText);
		chrome.storage.local.set({ cfg: config });
	}
});

dataBts.forEach((btn) => {
	btn.addEventListener("click", () => {
		dataBts.forEach((otherBtn) => {
			if (otherBtn !== btn) {
				otherBtn.classList.remove("data-btn-active");
			}
		});
		btn.classList.add("data-btn-active");
		HandleDataConfig(btn.value);
	});
});

function DisplayOptions(val, arTab) {
	const bodyHeight = val === 1 ? "600px" : "550px";
	const descriptionDisplay = val === 0 ? "block" : "none";
	const customInputDisplay = val === 1 ? "block" : "none";

	document.body.style.height = bodyHeight;
	(arTab ? dataArDescriptionSection : dataDescriptionSection).style.display = descriptionDisplay;
	(arTab ? customArInput : customInput).style.display = customInputDisplay;
}

dataArBts.forEach((btn) => {
	btn.addEventListener("click", () => {
		dataArBts.forEach((otherBtn) => {
			if (otherBtn !== btn) {
				otherBtn.classList.remove("data-btn-active");
			}
		});
		btn.classList.add("data-btn-active");

		HandleDataArConfig(btn.value);
	});
});

function HandleDataConfig(dataTypeVal) {
	const val = parseInt(dataTypeVal);
	SetConfigOptions(val, false, checkboxOptions);
	DisplayOptions(val, false);
	StoreConfigOptions("datatype", val);
}

function HandleDataArConfig(dataTypeVal) {
	const val = parseInt(dataTypeVal);
	SetConfigOptions(val, true, checkboxArOptions);
	DisplayOptions(val, true);
	StoreConfigOptions("datatypeAr", val);
}

function SetConfigOptions(val, autoRemove, checkBoxSelection) {
	let optionsKey = autoRemove ? "optionsAr" : "options";
	let customOptionsKey = autoRemove ? "customOptionsAr" : "customOptions";
	if (val === 0) {
		StoreConfigOptions(optionsKey, privateBrowsingData);
	} else if (val === 1) {
		StoreConfigOptions(customOptionsKey, checkBoxSelection);
	}
}

function StoreConfigOptions(storageKey, value) {
	config[storageKey] = value;
	chrome.storage.local.set({ cfg: config });
}

function HandleCheckboxChange(checkbox, options, optionKey) {
	checkbox.addEventListener("change", () => {
		const mappedProperties = checkboxMap[checkbox.value];
		if (mappedProperties) {
			if (checkbox.checked) {
				Object.assign(options, mappedProperties);
			} else {
				for (const key in mappedProperties) {
					if (mappedProperties.hasOwnProperty(key)) {
						delete options[key];
					}
				}
			}
			StoreConfigOptions(optionKey, options);
		}
	});
}

checkboxes.forEach((checkbox) => {
	HandleCheckboxChange(checkbox, checkboxOptions, "customOptions");
});

checkboxesAr.forEach((checkbox) => {
	HandleCheckboxChange(checkbox, checkboxArOptions, "customArOptions");
});

leftTab.addEventListener("click", () => {
	DisplayTab("left");
	DisplayOptions(config.datatype, false);
	StoreConfigOptions("activeTab", 1);
});

rightTab.addEventListener("click", () => {
	DisplayTab("right");
	DisplayOptions(config.datatypeAr, true);
	StoreConfigOptions("activeTab", 2);
});

function DisplayTab(tab) {
	const isLeftTab = tab === "left";
	if (isLeftTab) {
		leftTabText.classList.add("active-tab");
		rightTabText.classList.remove("active-tab");
	} else {
		rightTabText.classList.add("active-tab");
		leftTabText.classList.remove("active-tab");
	}
	formOtrContent.style.display = isLeftTab ? "flex" : "none";
	formArContent.style.display = isLeftTab ? "none" : "flex";
	rightTab.style.borderBottom = isLeftTab ? "0px" : "2px solid #168B8F";
	leftTab.style.borderBottom = isLeftTab ? "2px solid #168B8F" : "0px";
	cleanBtnDiv.style.display = isLeftTab ? "block" : "none";
	saveBtnDiv.style.display = isLeftTab ? "none" : "block";
}

arSwitch.addEventListener("change", (event) => {
	event.target.checked ? EnableSelection() : DisableSelection();
	config.autoRemoveOption = event.target.checked;
	if (!event.target.checked) {
		SendMessageToBackground("clean-auto", config);
		chrome.storage.local.set({ cfg: config });
	}
});

function DisableSelection() {
	if (customArInput) {
		DisableEvents(customArInput);
		customArInput.style.display = "none";
	}
	document.querySelectorAll(".select-items")[1].classList.add("select-hide");
	document.querySelectorAll(".select-selected")[1].classList.remove("select-arrow-active");

	formArSection.forEach((el) => {
		DisableEvents(el);
	});

	DisableEvents(dataArBtsSection);
	DisableEvents(dataArDescriptionSection);
	DisableBtnEvents(saveBtn);
}

function DisableEvents(el) {
	el.style.opacity = "0.5";
	el.style.pointerEvents = "none";
}
function EnableEvents(el) {
	el.style.opacity = "1";
	el.style.pointerEvents = "auto";
}

function DisableBtnEvents(el) {
	el.classList.remove("cleanup-btn");
	el.disabled = true;
	el.style.pointerEvents = "none";
	el.lastElementChild.classList.add("btn-text-disabled");
	el.classList.add("cleanup-btn-disabled");
}

function EnableBtnEvents(el) {
	el.style.pointerEvents = "auto";
	el.classList.add("cleanup-btn");
	el.disabled = false;
	el.lastElementChild.classList.remove("btn-text-disabled");
	el.classList.remove("cleanup-btn-disabled");
}

function EnableSelection() {
	config.datatypeAr === BrowsingDataType.custom ? (customArInput.style.display = "block") : null;

	if (customArInput) {
		EnableEvents(customArInput);
	}
	formArSection.forEach((el) => {
		EnableEvents(el);
	});

	EnableEvents(dataArBtsSection);
	if (config.histArPeriod > 0) {
		EnableBtnEvents(saveBtn);
	}
	EnableEvents(dataArDescriptionSection);
}

headerLink.classList.add("link-text");
headerLink.addEventListener("click", function () {
	chrome.storage.local.get(["cfg"], (data) => {
		if (data.cfg) {
			data.cfg.settingsTab = 1;
			chrome.storage.local.set({ cfg: data.cfg }, function () {
				chrome.tabs.query({ url: chrome.runtime.getURL("/action/settings.html") }, function (tabs) {
					if (tabs && tabs.length > 0) {
						chrome.tabs.update(tabs[0].id, { active: true });
					} else {
						chrome.tabs.create({ url: "/action/settings.html" });
					}
				});
			});
		}
	});
});

function IsCheckboxChecked(obj) {
	return Object.values(obj).some((val) => val);
}
