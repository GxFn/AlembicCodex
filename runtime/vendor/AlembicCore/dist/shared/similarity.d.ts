/**
 * similarity — 统一相似度计算工具
 *
 * 项目内所有文本/向量相似度计算统一使用此模块：
 *   - jaccardSimilarity: 基于 token 集合的 Jaccard 系数
 *   - cosineSimilarity:  向量余弦相似度
 *   - textSimilarity:    高层文本相似度（Jaccard + 可选子串加分）
 *   - tokenizeForSimilarity: 通用 bigram 分词（面向相似度场景）
 *
 * @module shared/similarity
 */
/**
 * 通用 bigram 分词 — 面向相似度计算
 *
 * 将文本小写化、去标点后，生成 word + character n-gram 集合。
 * 同时支持 CJK（单字 + bigram）和英文（整词 + bigram）。
 *
 * @param text 原始文本
 * @param [n=2] n-gram 长度
 * @returns token 集合
 */
export declare function tokenizeForSimilarity(text: string, n?: number): Set<string>;
/**
 * Jaccard 相似度 — |A ∩ B| / |A ∪ B|
 *
 * @param a token 集合 A
 * @param b token 集合 B
 * @returns 0.0 - 1.0
 */
export declare function jaccardSimilarity(a: Set<string>, b: Set<string>): number;
/**
 * 余弦相似度 — 向量点积 / (||a|| * ||b||)
 *
 * @param a 向量 A
 * @param b 向量 B
 * @returns 0.0 - 1.0（输入均为正值时）
 */
export declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * 高层文本相似度 — Jaccard + 可选子串包含加分
 *
 * @param textA 文本 A
 * @param textB 文本 B
 * @param [opts.n=2] n-gram 长度
 * @param [opts.substringBonus=false] 是否启用子串包含加分 (+0.3)
 * @returns 0.0 - 1.0
 */
export declare function textSimilarity(textA: string, textB: string, opts?: {
    n?: number;
    substringBonus?: boolean;
}): number;
