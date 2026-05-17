/**
 * CoverageAnalyzer — Guard 覆盖率矩阵 + Panorama 协同
 *
 * 计算模块级 Rule 覆盖率，识别零覆盖和低覆盖模块。
 * 与 PanoramaService 协同：利用模块划分 + gaps 数据做精准评估。
 */
import type { GuardViolationRepositoryImpl } from '../../repository/guard/GuardViolationRepository.js';
import type { KnowledgeRepositoryImpl } from '../../repository/knowledge/KnowledgeRepository.impl.js';
interface RuleLearnerLike {
    getMetrics(ruleId: string): {
        precision: number;
        recall: number;
        f1: number;
        triggers: number;
        falsePositiveRate: number;
    };
    getAllStats(): Record<string, {
        triggers: number;
        metrics?: {
            precision?: number;
            recall?: number;
            f1?: number;
        };
    }>;
}
export interface ModuleCoverage {
    module: string;
    ruleCount: number;
    fpRate: number;
    coverage: number;
    level: 'good' | 'low' | 'zero';
}
export interface CoverageMatrix {
    modules: ModuleCoverage[];
    overallCoverage: number;
    zeroModules: string[];
    lowModules: string[];
}
export declare class CoverageAnalyzer {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, guardViolationRepo: GuardViolationRepositoryImpl, options?: {
        ruleLearner?: RuleLearnerLike;
    });
    /**
     * 计算覆盖率矩阵
     * @param moduleFiles 模块名 → 文件路径列表的映射
     */
    analyze(moduleFiles: Map<string, string[]>): CoverageMatrix;
}
export {};
