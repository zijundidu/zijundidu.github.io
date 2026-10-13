import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { zh_CN } from "./languages/zh_CN";

export type Translation = {
	[K in I18nKey]: string;
};

// 站点为中文单语，所有语言代码统一回落到简体中文
const defaultTranslation = zh_CN;

const map: { [key: string]: Translation } = {
	zh_cn: zh_CN,
	zh_tw: zh_CN,
	en: zh_CN,
	en_us: zh_CN,
	en_gb: zh_CN,
	en_au: zh_CN,
	ja: zh_CN,
	ja_jp: zh_CN,
	ru: zh_CN,
	ru_ru: zh_CN,
	ko: zh_CN,
	ko_kr: zh_CN,
};

export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(key: I18nKey): string {
	const lang = siteConfig.lang || "zh_cn";
	const currentLang = getTranslation(lang);
	const value = currentLang[key];

	return value || defaultTranslation[key];
}
