/**
 * @module discovery/index
 * @description ProjectDiscoverer 系统入口 - 初始化 Registry 并注册所有 Discoverer
 */
import { DiscovererRegistry } from './DiscovererRegistry.js';
/** 获取全局 DiscovererRegistry 单例 */
export declare function getDiscovererRegistry(): DiscovererRegistry;
/** 重置 Registry（仅用于测试） */
export declare function resetDiscovererRegistry(): void;
export { CustomConfigDiscoverer } from './CustomConfigDiscoverer.js';
export { DartDiscoverer } from './DartDiscoverer.js';
export { type ConflictResult, type DetectMatch, type DiscovererPreferenceData, detectConflict, loadPreference, promptDiscovererChoice, savePreference, } from './DiscovererPreference.js';
export { DiscovererRegistry } from './DiscovererRegistry.js';
export { GenericDiscoverer } from './GenericDiscoverer.js';
export { GoDiscoverer } from './GoDiscoverer.js';
export { JvmDiscoverer } from './JvmDiscoverer.js';
export { NodeDiscoverer } from './NodeDiscoverer.js';
export { ProjectDiscoverer } from './ProjectDiscoverer.js';
export { PythonDiscoverer } from './PythonDiscoverer.js';
export { RustDiscoverer } from './RustDiscoverer.js';
export { SpmDiscoverer } from './SpmDiscoverer.js';
