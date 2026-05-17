/**
 * QualityScorer v2 — Recipe 质量评分器
 *
 * 面向知识管理场景重新设计，采用渐进式评分（非二元判断），
 * 充分利用 KnowledgeEntry 所有可用字段。
 *
 * 5 维度加权:
 * - completeness  (0.25): 结构完整性 — 核心字段齐全度
 * - contentDepth  (0.30): 内容深度   — markdown 丰富度、推理、溯源
 * - deliveryReady (0.20): 交付就绪   — trigger/language/tags/category
 * - actionability (0.15): 可操作性   — coreCode、do/dont/when 质量
 * - provenance    (0.10): 溯源可信   — confidence、sources、authority
 *
 * 设计参考:
 * - RAG Triad (TruLens): Relevance + Groundedness + Answer Relevance
 * - RAGAS: Context Precision + Faithfulness + Factual Correctness
 * - SonarQube: 多维度渐进评级，非二元判断
 */
export interface RecipeInput {
    title?: string;
    trigger?: string;
    description?: string;
    language?: string;
    category?: string;
    doClause?: string;
    dontClause?: string;
    whenClause?: string;
    coreCode?: string;
    usageGuide?: string;
    contentMarkdown?: string;
    contentRationale?: string;
    reasoningWhyStandard?: string;
    reasoningSources?: string[];
    reasoningConfidence?: number;
    source?: string;
    headers?: string[];
    tags?: string[];
    views?: number;
    clicks?: number;
    rating?: number;
    [key: string]: unknown;
}
export declare class QualityScorer {
    #private;
    constructor(options?: {
        weights?: Record<string, number>;
    });
    /**
     * 计算综合质量分
     * @returns { score: 0-1, dimensions: Record<string,number>, grade: A-F }
     */
    score(recipe: RecipeInput): {
        score: number;
        dimensions: {
            completeness: number;
            contentDepth: number;
            deliveryReady: number;
            actionability: number;
            provenance: number;
        };
        grade: string;
    };
    /** 批量评分 */
    scoreBatch(recipes: RecipeInput[]): {
        score: number;
        dimensions: {
            completeness: number;
            contentDepth: number;
            deliveryReady: number;
            actionability: number;
            provenance: number;
        };
        grade: string;
        recipe: RecipeInput;
    }[];
    /** 获取维度权重 */
    getWeights(): {
        completeness: 0.25;
        contentDepth: 0.3;
        deliveryReady: 0.2;
        actionability: 0.15;
        provenance: 0.1;
    };
}
