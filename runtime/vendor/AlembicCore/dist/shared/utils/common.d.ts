/**
 * 通用工具函数 — 消除跨模块重复代码
 *
 * @module shared/utils/common
 */
/**
 * 安全解析 JSON 字符串，失败时返回 fallback
 * 消除各 Repository / handler 中重复的 try-catch JSON.parse
 *
 * @param value 值（可能是 JSON 字符串、对象或空值）
 * @param [fallback=null] 解析失败时的回退值
 */
export declare function safeJsonParse(value: unknown, fallback?: null): any;
/**
 * 安全序列化到 JSON，处理 toJSON() 方法和空值
 * 消除 _entityToRow 中重复的 JSON.stringify 逻辑
 *
 * @param value 需要序列化的值
 * @param [fallback='{}'] 值为空时的回退
 */
export declare function safeJsonStringify(value: unknown, fallback?: string): string;
/**
 * 返回当前 Unix 时间戳（秒）
 * 消除各处 Math.floor(Date.now() / 1000) 的重复
 */
export declare function unixNow(): number;
/** 返回非空字符串值或 fallback */
export declare function strOr(value: unknown, fallback?: string): string;
declare const _default: {
    safeJsonParse: typeof safeJsonParse;
    safeJsonStringify: typeof safeJsonStringify;
    unixNow: typeof unixNow;
    strOr: typeof strOr;
};
export default _default;
