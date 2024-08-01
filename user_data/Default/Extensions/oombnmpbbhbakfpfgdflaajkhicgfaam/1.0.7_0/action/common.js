const RobotoFont = new FontFace("Roboto", "url('./assets/fonts/Roboto-Regular.ttf')");
document.fonts.add(RobotoFont);

const currentPage = window.location.pathname;
chrome.runtime.sendMessage({ msg: "popup-opened" });

chrome.storage.local.get("cfg", (data) => {
	if (data.cfg.darkMode) {
		EnableDarkMode();
	}
});

const lang = chrome.i18n.getUILanguage();

const longWordLangs = [
	"bg",
	"de",
	"el",
	"es-ES",
	"es-MX",
	"fr",
	"it",
	"pt-BR",
	"ro",
	"ru",
	"sr",
	"tr",
	"uk",
];

if (longWordLangs.includes(lang)) {
	document.documentElement.style.setProperty("--flex-font-header", "13px");
	document.documentElement.style.setProperty("--flex-font-text", "12px");
}

if (lang === "el") {
	document.documentElement.style.setProperty("--custom-input-margin", "0px");
}

function EnableDarkMode() {
	let element = document.body;
	document.documentElement.style.setProperty("--font-color", " #e8ecee");
	document.documentElement.style.setProperty("--bg-color", "#232323");
	document.documentElement.style.setProperty("--hover-fill", "#E9EDF0");
	element.classList.toggle("dark-mode");
	if (currentPage === "/action/popup.html") {
		document.querySelector(".banner-title").classList.toggle("dark-mode");
		document.querySelector(".menu-box").classList.toggle("dark-mode");
		document.querySelectorAll(".menu-item").forEach((element) => {
			element.classList.toggle("dark-mode");
		});

		const menuItems = document.querySelectorAll(".grid-item, .row-item");
		menuItems.forEach((element) => {
			element.classList.toggle("dark-mode");
		});
	} else if (currentPage === "/action/browsingprivacy.html") {
		const selectForms = document.querySelectorAll(".custom-select");
		selectForms.forEach((element) => {
			element.classList.toggle("dark-mode");
		});
		const selectOptions = document.querySelectorAll(".select-items");
		selectOptions.forEach((element) => {
			element.classList.toggle("dark-mode");
		});

		const dataBtns = document.querySelectorAll(".data-btn");
		dataBtns.forEach((element) => {
			element.classList.toggle("dark-mode");
		});

		const activeBtn = document.querySelector(".data-btn-active");
		activeBtn.classList.toggle("dark-mode");
	}

	if (currentPage !== "/action/popup.html") {
		const backArrow = document.querySelector(".chevron-right-icon");
		if (backArrow) {
			backArrow.classList.toggle("dark-mode");
		}
	}
}
