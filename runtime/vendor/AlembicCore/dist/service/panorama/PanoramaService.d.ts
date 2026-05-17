/**
 * PanoramaService — 全景服务主入口
 *
 * 提供 4 个 operation:
 *   overview — 项目骨架 + 层级 + token 预算截断
 *   module   — 单模块详情 + Recipe 覆盖率
 *   gaps     — 知识空白区 (有代码无 Recipe)
 *   health   — 全景健康度 (覆盖率 + 耦合度 + 衰退)
 *
 * 模块发现委托给 ModuleDiscoverer（SRP）。
 * 内存缓存 + 24h 过期策略。
 *
 * @module PanoramaService
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type { KnowledgeRepositoryImpl } from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { ModuleDiscoverer } from './ModuleDiscoverer.js';
import type { PanoramaAggregator } from './PanoramaAggregator.js';
import type { PanoramaScanner } from './PanoramaScanner.js';
import type { HealthRadar, KnowledgeGap, PanoramaModule, PanoramaResult } from './PanoramaTypes.js';
export interface PanoramaServiceOptions {
    aggregator: PanoramaAggregator;
    edgeRepo: KnowledgeEdgeRepositoryImpl;
    knowledgeRepo: KnowledgeRepositoryImpl;
    projectRoot: string;
    scanner?: PanoramaScanner;
    moduleDiscoverer?: ModuleDiscoverer;
    signalBus?: SignalBus;
}
export interface PanoramaOverview {
    projectRoot: string;
    moduleCount: number;
    layerCount: number;
    totalFiles: number;
    totalRecipes: number;
    overallCoverage: number;
    layers: Array<{
        level: number;
        name: string;
        modules: Array<{
            name: string;
            role: string;
            fileCount: number;
            recipeCount: number;
        }>;
    }>;
    cycleCount: number;
    gapCount: number;
    /** 多维度知识健康雷达 */
    healthRadar: HealthRadar;
    computedAt: number;
    stale: boolean;
}
export interface PanoramaModuleDetail {
    module: PanoramaModule;
    layerName: string;
    neighbors: Array<{
        name: string;
        direction: 'in' | 'out';
        weight: number;
    }>;
    /** File groups by subdirectory within the module */
    fileGroups: Array<{
        group: string;
        files: string[];
        count: number;
    }>;
    /** Recipes matched to this module (by category/trigger/file path) */
    recipes: Array<{
        id: string;
        title: string;
        trigger: string;
        kind: string;
    }>;
    /** Files not covered by any matched recipe */
    uncoveredFileCount: number;
    /** Auto-generated structural summary for the agent */
    summary: string;
}
export interface PanoramaHealth {
    /** 多维度知识健康雷达 */
    healthRadar: HealthRadar;
    avgCoupling: number;
    cycleCount: number;
    gapCount: number;
    highPriorityGaps: number;
    moduleCount: number;
    /** 综合健康分 0-100 (维度覆盖 60 + 无循环 20 + 无高优空白 10 + 耦合适中 10) */
    healthScore: number;
}
export declare class PanoramaService {
    #private;
    constructor(opts: PanoramaServiceOptions);
    /**
     * 获取项目全景概览
     */
    getOverview(): Promise<PanoramaOverview>;
    /**
     * 获取单模块详情 (enriched with file groups, recipes, and summary)
     */
    getModule(moduleName: string): Promise<PanoramaModuleDetail | null>;
    /**
     * 获取知识空白区
     */
    getGaps(): Promise<KnowledgeGap[]>;
    /**
     * 获取全景健康度
     */
    getHealth(): Promise<PanoramaHealth>;
    /**
     * 获取完整 PanoramaResult（内部使用或 Bootstrap 注入）
     */
    getResult(): Promise<PanoramaResult>;
    /**
     * 确保全景数据已就绪（无数据时自动扫描）
     * MCP handler / HTTP route 应在返回数据前调用此方法
     */
    ensureData(): Promise<void>;
    /**
     * 强制刷新缓存
     */
    invalidate(): void;
    /**
     * 强制重新扫描（invalidate + 重置 scanner）
     */
    rescan(): Promise<void>;
}
