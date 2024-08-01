const ProtectionStatus = {
	Protected: 1,
	RestartRequired: 2,
	UnsupportedBrowser: 3,
	LicenseExpired: 4,
	MissingProduct: 5,
	ConnectionLost: 6
};

const ProductCode = {
	InternetSecurity: "eis",
	SmartSecurityPremium: "essp",
	SecurityUltimate: "esu",
	SmallBusinessSecurity: "esbs"
}

const ProductMap = new Map([
	[ProductCode.InternetSecurity, { name: "ESET Internet Security", privacy: false }],
	[ProductCode.SmartSecurityPremium, { name: "ESET Smart Security Premium", privacy: false }],
	[ProductCode.SecurityUltimate, { name: "ESET Security Ultimate", privacy: true }],
	[ProductCode.SmallBusinessSecurity, { name: "ESET Small Business Security", privacy: true }]
]);

const LangMap = new Map([
	["ar", "ar-EG"],
	["bg", "bg-BG"],
	["ca", "ca-ES"],
	["cs", "cs-CZ"],
	["de", "de-DE"],
	["da", "da-DK"],
	["es-cl", "es-CL"],
	["es", "es-ES"],
	["el", "el-GR"],
	["en", "en-US"],
	["en-jm", "en-JM"],
	["et", "et-EE"],
	["fi", "fi-FI"],
	["fr-ca", "fr-CA"],
	["fr", "fr-FR"],
	["he", "he-IL"],
	["hr", "hr-HR"],
	["hu", "hu-HU"],
	["hy", "hy-AM"],
	["it", "it-IT"],
	["id", "id-ID"],
	["ja", "ja-JP"],
	["kk", "kk-KZ"],
	["ko", "ko-KR"],
	["lt", "lt-LT"],
	["lv", "lv-LV"],
	["nb", "nb-NO"],
	["nl", "nl-NL"],
	["pl", "pl-PL"],
	["pt", "pt-BR"],
	["ro", "ro-RO"],
	["ru", "ru-RU"],
	["sk", "sk-SK"],
	["sl", "sl-SI"],
	["sr", "sr-Latn-RS"],
	["sv", "sv-SE"],
	["th", "th-TH"],
	["tr", "tr-TR"],
	["uk", "uk-UA"],
	["vi", "vi-VN"],
	["zh", "zh-CN"],
	["zh-tw", "zh-TW"]
]);

const BrowsingDataType = { private: 0, custom: 1 };
