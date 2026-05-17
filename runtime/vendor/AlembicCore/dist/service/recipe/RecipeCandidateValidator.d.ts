/**
 * RecipeCandidateValidator — Recipe 候选校验器 (V3)
 *
 * 验证候选是否满足 V3 结构化字段要求。
 * 核心变更：用 content 对象替代旧版 code 字符串。
 */
interface CandidateContent {
    pattern?: string;
    markdown?: string;
    rationale?: string;
}
interface CandidateReasoning {
    whyStandard?: string;
    sources?: unknown[];
    confidence?: number;
}
interface RecipeCandidate {
    title?: string;
    trigger?: string;
    kind?: string;
    category?: string;
    language?: string;
    content?: CandidateContent;
    headers?: unknown[];
    knowledgeType?: string;
    usageGuide?: string;
    reasoning?: CandidateReasoning;
    tags?: unknown[];
    [key: string]: unknown;
}
export declare class RecipeCandidateValidator {
    /**
     * 验证单个候选（V3 结构）
     * @returns }
     */
    validate(candidate: RecipeCandidate): {
        valid: boolean;
        errors: string[];
        warnings: string[];
    };
    /**
     * 批量验证
     * @returns }}
     */
    validateBatch(candidates: RecipeCandidate[]): {
        valid: {
            candidate: RecipeCandidate;
            valid: boolean;
            errors: string[];
            warnings: string[];
        }[];
        invalid: {
            candidate: RecipeCandidate;
            valid: boolean;
            errors: string[];
            warnings: string[];
        }[];
        summary: {
            total: number;
            validCount: number;
            invalidCount: number;
        };
    };
    /** 获取有效类别列表 */
    getValidCategories(): string[];
    /** 获取有效 kind 列表 */
    getValidKinds(): string[];
    /** 获取所有必填字段名列表 */
    getRequiredFields(): string[];
}
export {};
