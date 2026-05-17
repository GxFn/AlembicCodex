/**
 * SimilarityService — 轻量级 Recipe 相似度检测
 * 基于 Jaccard 相似度对候选与已有 Recipe 进行去重检测
 */
interface SimilarityCandidate {
    title: string;
    summary?: string;
    description?: string;
    code: string;
    [key: string]: unknown;
}
interface SimilarityOpts {
    threshold?: number;
    topK?: number;
}
/**
 * 在项目知识库中查找与候选相似的 Recipe
 * @param projectRoot 项目根目录
 * @param candidate { title, summary, usageGuide, code }
 * @param [opts] { threshold: 0.7, topK: 5 }
 * @returns >}
 */
export declare function findSimilarRecipes(projectRoot: string, candidate: SimilarityCandidate, opts?: SimilarityOpts): {
    file: string;
    title: string;
    similarity: number;
}[];
declare const _default: {
    findSimilarRecipes: typeof findSimilarRecipes;
};
export default _default;
