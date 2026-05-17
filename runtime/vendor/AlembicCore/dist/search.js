import { SearchEngine } from './service/search/SearchEngine.js';
export { BM25Scorer } from './service/search/BM25Scorer.js';
export { CoarseRanker } from './service/search/CoarseRanker.js';
export { contextBoost } from './service/search/contextBoost.js';
export { FieldWeightedScorer } from './service/search/FieldWeightedScorer.js';
export { HybridRetriever } from './service/search/HybridRetriever.js';
export { MultiSignalRanker } from './service/search/MultiSignalRanker.js';
export { SearchEngine };
export { queryNonDeprecatedEntries, RawDbGuardAdapter, RawDbKnowledgeAdapter, RawDbSourceRefAdapter, unwrapRawDb, unwrapSearchDb, } from './repository/search/SearchRepoAdapter.js';
export { groupByKind, slimSearchResult, } from './service/search/SearchTypes.js';
export { tokenize } from './service/search/tokenizer.js';
/**
 * 创建完整搜索引擎。
 *
 * Core 只稳定本地检索、排序和可注入的语义检索契约；AI reranker/provider
 * 的实现、API key 和调用策略仍由宿主仓库负责。
 */
export function createSearchEngine(db, options = {}) {
    return new SearchEngine(db, options);
}
