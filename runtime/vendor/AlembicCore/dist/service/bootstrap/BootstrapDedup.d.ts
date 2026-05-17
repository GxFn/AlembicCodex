/**
 * BootstrapDedup — 冷启动期间的会话级去重缓存
 *
 * 生命周期: 随 bootstrap session 创建/销毁
 * 作用:
 *   1. 缓存当前 session 已提交的候选摘要（解决 DB 写入延迟导致的盲区）
 *   2. 提供快速结构相似度比较（纯内存，不查 DB）
 *   3. 同步写入，避免并行维度竞态
 *
 * 相似度算法: 复用 ConsolidationAdvisor 的 4 维权重
 *   title 0.2 + clause 0.3 + code 0.3 + guard 0.2
 */
export interface CandidateSummary {
    id: string;
    title: string;
    category: string;
    coreCode: string;
    doClause: string;
    dontClause: string;
    guardPattern?: string;
}
export interface DedupMatch {
    existingId: string;
    existingTitle: string;
    similarity: number;
}
export declare class BootstrapDedup {
    #private;
    /** 注册已提交的候选（knowledge 提交成功后调用） */
    register(summary: CandidateSummary): void;
    /** 检查新候选是否与已注册候选重复 */
    findDuplicate(candidate: CandidateSummary, threshold?: number): DedupMatch | null;
    /** 批量检查（返回所有匹配到重复的条目） */
    findDuplicates(candidates: CandidateSummary[], threshold?: number): DedupMatch[];
    /** 清空（session 结束时调用） */
    clear(): void;
    get count(): number;
}
