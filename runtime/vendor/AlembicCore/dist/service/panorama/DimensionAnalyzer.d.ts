/**
 * DimensionAnalyzer — 多维度知识健康分析
 *
 * **v2: 从统一维度注册表 (DimensionRegistry) 派生维度**
 *
 * 灵感来源:
 *   - ISO/IEC 25010 质量模型 (8 大特性: 可靠性、安全性、可维护性…)
 *   - ThoughtWorks Tech Radar (Adopt/Trial/Assess/Hold 四环)
 *   - 雷达图/蛛网图可视化模型
 *
 * 核心思路: 按「知识维度」衡量项目在各工程方向上的规范成熟度。
 * 某维度 Recipe 为 0 → 该方向完全空白，标示为 gap。
 *
 * @module DimensionAnalyzer
 */
import type { BootstrapRepositoryImpl } from '../../repository/bootstrap/BootstrapRepository.js';
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeRepositoryImpl } from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { HealthRadar, KnowledgeGap } from './PanoramaTypes.js';
export declare class DimensionAnalyzer {
    #private;
    constructor(bootstrapRepo: BootstrapRepositoryImpl, entityRepo: CodeEntityRepositoryImpl, knowledgeRepo: KnowledgeRepositoryImpl, projectRoot: string);
    /**
     * 分析项目知识健康雷达
     *
     * @param moduleRoles — 项目中存在的模块角色 (用于 gap 优先级推断)
     */
    analyze(moduleRoles: string[]): Promise<{
        radar: HealthRadar;
        gaps: KnowledgeGap[];
    }>;
}
