/**
 * DimensionRegistry — 统一维度注册表 (Single Source of Truth)
 *
 * 25 个维度定义:
 *   Layer 1 (Universal): D1-D13 — 所有项目适用
 *   Layer 2 (Language):  DL1-DL7 — 按项目语言激活
 *   Layer 3 (Framework): DF1-DF5 — 按检测到的框架激活
 *
 * 这是整个系统中维度定义的唯一来源。
 * Bootstrap / Panorama / Rescan / Dashboard 均从此模块消费维度元数据。
 *
 * @module domain/dimension/DimensionRegistry
 */
import type { DimensionId, UnifiedDimension } from './UnifiedDimension.js';
export declare const DIMENSION_REGISTRY: readonly UnifiedDimension[];
/**
 * 维度 ID → 展示分组 ID 映射
 *
 *  展示分组:
 *   - 'architecture'     — 架构与设计
 *   - 'best-practice'    — 规范与实践
 *   - 'data-event-flow'  — 数据与并发
 *   - 'deep-scan'        — 深度扫描（语言/框架条件维度）
 */
export declare const DIMENSION_DISPLAY_GROUP: Record<string, string>;
/** 按 ID 获取维度 */
export declare function getDimension(id: string): UnifiedDimension | undefined;
/** 获取指定层级的所有维度 */
export declare function getDimensionsByLayer(layer: 'universal' | 'language' | 'framework'): readonly UnifiedDimension[];
/**
 * 根据项目语言和框架过滤出活跃维度
 *
 * - Layer 1 (universal): 全部返回
 * - Layer 2 (language): 仅当项目语言匹配时返回
 * - Layer 3 (framework): 仅当项目语言+框架均匹配时返回
 */
export declare function resolveActiveDimensions(primaryLang: string, detectedFrameworks?: string[]): readonly UnifiedDimension[];
/**
 * 构建 Tier 分层调度计划
 *
 * 基于每个维度的 tierHint 字段动态分为 N 层 (不再硬编码 3 层):
 * - tierHint=1: 基础数据层 — architecture + 语言/框架条件维度
 * - tierHint=2: 规范+设计层 — coding-standards, design-patterns 等
 * - tierHint=3+: 实践+质量层 — 按声明值自动分桶
 *
 * 未声明 tierHint 的维度默认归入最后一层 (tierHint=max 或 3)。
 */
export declare function buildTierPlan(activeDims?: readonly UnifiedDimension[]): string[][];
/**
 * 将 Recipe 分类到最匹配的维度
 *
 * 优先级: category 即维度 ID（legacy） → topicHint 精确匹配 → category 匹配 → null
 *
 * 新 Bootstrap/Rescan 路径应使用显式 dimensionId；这里保留 category 维度 ID
 * 仅用于旧数据回推。topicHint 值（如 'networking'、'architecture'）偏宏观，
 * 仅作为后备分类依据。
 */
export declare function classifyRecipeToDimension(topicHint: string, category: string): DimensionId | null;
