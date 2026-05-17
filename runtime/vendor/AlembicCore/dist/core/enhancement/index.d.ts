/**
 * @module enhancement/index
 * @description Enhancement Pack 自动加载器与 Registry 初始化
 *
 * 使用方式:
 *   import { getEnhancementRegistry } from '../core/enhancement/index.js';
 *   const registry = getEnhancementRegistry();
 *   const packs = registry.resolve(primaryLang, detectedFrameworks);
 */
import { EnhancementRegistry } from './EnhancementRegistry.js';
/**
 * 获取全局 EnhancementRegistry 单例
 * 注意: 首次访问前必须调用 initEnhancementRegistry() 完成异步加载
 * 如果未初始化, 返回空 Registry（不会抛错, 但 resolve() 结果为空）
 */
export declare function getEnhancementRegistry(): EnhancementRegistry;
/**
 * 异步初始化 — 加载所有增强包
 * 需要在使用 resolve() 之前调用
 */
export declare function initEnhancementRegistry(): Promise<EnhancementRegistry>;
export { EnhancementPack } from './EnhancementPack.js';
export { EnhancementRegistry } from './EnhancementRegistry.js';
