/**
 * LanguageExtensions — 语言检测与语言特有扩展字段构建
 *
 * 负责：
 *   - 文件扩展名 → 语言映射（委托 LanguageService）
 *   - langStats 聚合 → 主语言推断（委托 LanguageService）
 *   - 主语言 → 语言扩展字段（分析维度、典型模式、反模式、Guard 规则等）
 *
 * 注册表驱动：
 *   所有语言知识集中在 LANG_REGISTRY 中，新增语言只需添加条目即可。
 *   覆盖 LanguageService.KNOWN_PROGRAMMING_LANGS 全部 14 种编程语言。
 */
/** 根据文件扩展名推断语言 — 委托给 LanguageService（唯一来源） */
export declare function inferLang(filename: string): string;
/** 从 langStats 推断主语言 — 委托给 LanguageService（唯一来源） */
export declare function detectPrimaryLanguage(langStats: Record<string, number>): string;
/**
 * 根据主语言构建语言扩展字段
 * 包含：语言特有的分析关注点、典型模式、反模式、Guard 规则、Agent 注意事项
 *
 * @param lang 规范化语言 ID (如 'swift', 'typescript')
 * @returns }
 */
export declare function buildLanguageExtension(lang: string | null): {
    language: string;
    customFields: {};
    extraDimensions: never[];
    typicalPatterns: never[];
    commonAntiPatterns: never[];
    suggestedGuardRules: never[];
    agentCautions: never[];
};
