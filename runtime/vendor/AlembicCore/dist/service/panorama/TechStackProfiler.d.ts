/**
 * TechStackProfiler — 技术栈画像聚合
 *
 * 根据外部依赖名称自动分类，生成项目技术栈画像。
 * 使用已知库名映射表 + 关键词启发式进行分类。
 *
 * @module TechStackProfiler
 */
import type { ExternalDepProfile, TechStackProfile } from './PanoramaTypes.js';
/**
 * 对外部依赖进行分类，生成技术栈画像
 */
export declare function profileTechStack(externalDeps: ExternalDepProfile[]): TechStackProfile;
