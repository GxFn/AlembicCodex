/**
 * EnhancementSuggester — 使用数据反推增强建议
 *
 * 4 种增强策略：
 *   ① Guard 频繁命中但无 coreCode → 建议补充代码示例
 *   ② Search 高频命中但 adoptions=0 → 建议改善 usageGuide
 *   ③ 同类知识中 authority 偏低 → 建议补充 whenClause
 *   ④ 关联 Recipe 已 deprecated → 建议检查引用是否过时
 */
import type { ReportStore } from '../../infrastructure/report/ReportStore.js';
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
export type EnhancementType = 'missing_code_example' | 'low_adoption' | 'low_authority' | 'deprecated_reference';
export interface EnhancementSuggestion {
    recipeId: string;
    title: string;
    type: EnhancementType;
    description: string;
    priority: 'high' | 'medium' | 'low';
    evidence: string[];
}
export declare class EnhancementSuggester {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, options?: {
        signalBus?: SignalBus;
        reportStore?: ReportStore;
    });
    /**
     * 运行全部 4 种增强策略
     */
    analyzeAll(): Promise<EnhancementSuggestion[]>;
}
