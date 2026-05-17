/**
 * PanoramaAggregator — 全景数据汇总
 *
 * 编排 RoleRefiner → CouplingAnalyzer → LayerInferrer，
 * 汇总为统一的 PanoramaResult，附加知识覆盖率和空白区检测。
 *
 * @module PanoramaAggregator
 */
import type { BootstrapRepositoryImpl } from '../../repository/bootstrap/BootstrapRepository.js';
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type { KnowledgeRepositoryImpl } from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { CouplingAnalyzer } from './CouplingAnalyzer.js';
import { DimensionAnalyzer } from './DimensionAnalyzer.js';
import type { ConfigLayer, LayerInferrer } from './LayerInferrer.js';
import type { PanoramaResult } from './PanoramaTypes.js';
import type { ModuleCandidate, RoleRefiner } from './RoleRefiner.js';
export interface PanoramaAggregatorOptions {
    roleRefiner: RoleRefiner;
    couplingAnalyzer: CouplingAnalyzer;
    layerInferrer: LayerInferrer;
    bootstrapRepo: BootstrapRepositoryImpl;
    entityRepo: CodeEntityRepositoryImpl;
    edgeRepo: KnowledgeEdgeRepositoryImpl;
    knowledgeRepo: KnowledgeRepositoryImpl;
    projectRoot: string;
    dimensionAnalyzer?: DimensionAnalyzer;
}
export declare class PanoramaAggregator {
    #private;
    constructor(opts: PanoramaAggregatorOptions);
    /**
     * 计算完整全景数据
     * @param moduleCandidates 模块候选列表
     * @param options.configLayers 来自配置文件的层级声明（如 Boxfile layer 定义）
     */
    compute(moduleCandidates: ModuleCandidate[], options?: {
        configLayers?: ConfigLayer[] | null;
    }): Promise<PanoramaResult>;
}
