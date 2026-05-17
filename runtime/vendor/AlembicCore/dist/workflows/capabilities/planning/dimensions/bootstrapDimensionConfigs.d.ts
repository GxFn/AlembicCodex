/**
 * bootstrapDimensionConfigs — 维度配置表 + Tier Reflection 构建
 *
 * 从 DimensionRegistry 派生的维度执行配置：
 *   - DIMENSION_CONFIGS_V3: 维度的 outputType + allowedKnowledgeTypes（自动生成）
 *   - getFullDimensionConfig(): 合并 baseDimensions + V3 专属配置
 *   - buildTierReflection(): Tier 级反思聚合（规则化，不需要 AI）
 */
/**
 * 从统一注册表生成 V3 配置映射
 * dual 维度同时产出 Candidate + Project Skill
 */
export declare const DIMENSION_CONFIGS_V3: Record<string, {
    outputType: string;
    allowedKnowledgeTypes: string[];
}>;
/**
 * 获取完整维度配置（合并 baseDimensions + V3 专属配置 + SOP）
 *
 * @param dimId 维度 ID
 * @returns 完整维度配置，或 null（未知维度）
 */
export declare function getFullDimensionConfig(dimId: string): {
    id: string;
    label: string;
    guide: string;
    outputType: string;
    allowedKnowledgeTypes: string[];
    skillWorthy: boolean;
    dualOutput: boolean;
    knowledgeTypes: string[];
    sopSteps: import("../../../../domain/dimension/DimensionSop.js").FullSopStep[] | null;
    commonMistakes: string[];
    timeEstimate: string | null;
    focusKeywords: string[];
} | null;
/** A single finding from a dimension analysis */
interface DimensionFinding {
    dimId?: string;
    importance?: number;
    evidence?: string | unknown;
    finding?: string;
}
/** Minimal session store interface for tier reflection */
interface TierSessionStore {
    getDimensionReport(dimId: string): {
        findings?: DimensionFinding[];
        digest?: {
            gaps?: string[];
            remainingTasks?: Array<{
                signal?: string;
                reason?: string;
            }>;
        };
    } | undefined;
}
/**
 * 构建 Tier 级 Reflection — 在每个 Tier 完成后调用
 *
 * 无需 AI 调用，通过规则化聚合维度发现:
 * - 收集所有维度的关键发现并按重要性排序
 * - 检测跨维度重复模式
 * - 为下一 Tier 生成建议
 *
 * @param tierIndex Tier 索引 (0-based)
 * @param tierResults 本 Tier 的维度结果
 * @returns TierReflection
 */
export declare function buildTierReflection(tierIndex: number, tierResults: Map<string, unknown>, sessionStore: TierSessionStore): {
    tierIndex: number;
    completedDimensions: string[];
    topFindings: DimensionFinding[];
    crossDimensionPatterns: string[];
    suggestionsForNextTier: string[];
};
export {};
