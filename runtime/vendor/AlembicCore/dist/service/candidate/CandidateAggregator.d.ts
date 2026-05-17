/**
 * CandidateAggregator — 候选条目去重聚合
 *
 * 对候选列表按 title 进行模糊去重，保留最优条目。
 * 被 knowledge handler 的 submitKnowledgeBatch 使用。
 *
 * @module service/candidate/CandidateAggregator
 */
interface CandidateItem {
    title: string;
    code?: string;
    [key: string]: unknown;
}
interface AggregateOpts {
    threshold?: number;
}
/**
 * 对候选条目列表进行去重聚合
 *
 * @returns > }}
 */
export declare function aggregateCandidates(items: CandidateItem[], opts?: AggregateOpts): {
    items: CandidateItem[];
    duplicates: {
        item: CandidateItem;
        duplicateOf: string;
    }[];
};
export {};
