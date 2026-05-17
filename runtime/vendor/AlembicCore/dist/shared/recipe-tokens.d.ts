/**
 * recipe-tokens — Recipe 代码标识符提取（共享基础设施）
 *
 * 从 Recipe 全字段（coreCode、content.markdown 代码块、content.pattern、content.steps）
 * 提取有意义的 API 标识符，供以下模块复用：
 *
 *   - ContentImpactAnalyzer: diff token 与 recipe token 交集 → 影响级别
 *   - RecipeSimilarity: 两条 recipe token 集合 Jaccard → 内容相似度
 *   - diff-parser: tokenizeIdentifiers 用于 diff 行标识符提取
 *
 * @module shared/recipe-tokens
 */
/** Recipe 的特征标识符集合 */
export interface RecipeTokens {
    /** 所有去重后的特征标识符 */
    tokens: Set<string>;
    /** 来源映射（用于调试） */
    sources: Map<string, 'coreCode' | 'markdown' | 'pattern' | 'steps'>;
}
/** extractRecipeTokens 接受的最小字段集 */
export interface RecipeTokenInput {
    coreCode?: string | null;
    language?: string | null;
    content?: {
        markdown?: string | null;
        pattern?: string | null;
        steps?: Array<{
            code?: string;
        }>;
    } | null;
}
/**
 * 从 Recipe 的所有代码字段提取特征标识符。
 *
 * 提取来源（优先级从低到高）：
 *   1. coreCode — 教学模板，含占位符前缀
 *   2. content.markdown 中的代码块 — 真实代码，最高价值
 *   3. content.pattern — 代码片段
 *   4. content.steps[].code — 实施步骤代码
 */
export declare function extractRecipeTokens(entry: RecipeTokenInput): RecipeTokens;
/**
 * 从代码文本中提取有意义的 API 标识符。
 *
 * 过滤规则：
 *   - 长度 < 4 → 排除（for, let, var 等）
 *   - 占位符前缀（My*, Example*, Sample*...）→ 排除
 *   - 语言关键字 → 排除
 *
 * @param code 任意代码文本
 * @returns 去重后的标识符数组
 */
export declare function extractApiTokens(code: string): string[];
/**
 * 从代码文本中提取所有标识符 token。
 *
 * 预处理：移除注释和字符串字面量（避免从文档/字符串中误提取标识符）。
 *
 * @param code 任意代码文本
 * @returns 标识符数组（未去重）
 */
export declare function tokenizeIdentifiers(code: string): string[];
