function GetLangCode() {
	const localeCode = chrome.i18n.getUILanguage();

	return LangMap.get(localeCode) || localeCode;
}

function GetHelpLink(productType) {
	let productCode = ProductCode.SecurityUltimate;

	for (const [key, value] of ProductMap) {
		if (value.name === productType) {
			productCode = key;

			break;
		}
	}

	const version = "17";
	const helpURL = `https://help.eset.com/getHelp?product=${productCode}&version=${
		version || "latest"
	}&lang=${GetLangCode()}&topic=idh_config_bps`;

	return helpURL;
}
