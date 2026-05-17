/**
 * TriggerSymbol - Snippet 触发符配置
 *
 * 默认使用 @，可通过环境变量 ALEMBIC_TRIGGER_SYMBOL 覆盖（单字符）。
 * V2 ESM 版本，对应 V1 TriggerSymbol.js
 */
/** 当前触发符（可配置） */
export declare const TRIGGER_SYMBOL: string;
/** 用于拆分的触发符集合 */
export declare const TRIGGER_SYMBOLS: string[];
/** 用于按触发符拆分的正则 */
export declare const TRIGGER_SPLIT_REGEX: RegExp;
/** str 是否以触发符开头 */
export declare function hasTriggerPrefix(str: string): boolean;
/** 去掉 str 开头的连续触发符 */
export declare function stripTriggerPrefix(str: string): string;
/** 若 str 不以触发符开头，则加上默认触发符 */
export declare function ensureTriggerPrefix(str: string): string;
/** 获取 str 已带的触发符，否则返回默认触发符 */
export declare function getPrefixFromTrigger(str: string): string;
