/**
 * CouplingAnalyzer — 模块耦合分析
 *
 * 三边融合 (import + call + dataFlow) 构建加权依赖图，
 * 使用 Tarjan SCC 检测循环依赖，计算 fanIn/fanOut。
 *
 * @module CouplingAnalyzer
 */
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
import type { CyclicDependency, Edge } from './PanoramaTypes.js';
export interface CouplingMetrics {
    fanIn: number;
    fanOut: number;
}
export interface ExternalDepMetrics {
    name: string;
    fanIn: number;
    /** 依赖此外部库的本地模块列表 */
    dependedBy: string[];
}
export interface CouplingResult {
    cycles: CyclicDependency[];
    metrics: Map<string, CouplingMetrics>;
    edges: Edge[];
    /** 外部依赖 fan-in 统计（按 fan-in 降序排列） */
    externalDeps: ExternalDepMetrics[];
}
export declare class CouplingAnalyzer {
    #private;
    constructor(edgeRepo: KnowledgeEdgeRepositoryImpl, entityRepo: CodeEntityRepositoryImpl, projectRoot: string);
    /**
     * 分析模块间耦合关系
     * @param moduleFiles - Map<moduleName, filePaths[]>
     * @param externalModules - 外部模块名集合（无源码但参与依赖图）
     */
    analyze(moduleFiles: Map<string, string[]>, externalModules?: Set<string>): Promise<CouplingResult>;
}
