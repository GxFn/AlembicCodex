/**
 * CrossEncoderReranker — deterministic search reranker.
 *
 * Local LLM scoring has been removed from AlembicPlugin. This adapter keeps
 * the SearchCrossEncoder contract and ranks with token overlap only.
 */
import { tokenize } from '@alembic/core/search';
import { jaccardSimilarity } from '@alembic/core/search';
export class CrossEncoderReranker {
    constructor(_opts = {}) { }
    async rerank(query, candidates) {
        const rerankCandidates = candidates;
        if (!candidates || candidates.length === 0) {
            return [];
        }
        if (!query) {
            return candidates;
        }
        return this.#jaccardFallback(query, rerankCandidates);
    }
    #extractDocText(candidate) {
        const parts = [
            candidate.title,
            candidate.trigger,
            candidate.description || candidate.summary,
            candidate.code,
            candidate.content,
        ].filter(Boolean);
        return parts.join(' | ');
    }
    #jaccardFallback(query, candidates) {
        const queryTokens = new Set(tokenize(query));
        if (queryTokens.size === 0) {
            return candidates;
        }
        return candidates
            .map((candidate) => {
            const text = this.#extractDocText(candidate);
            const docTokens = new Set(tokenize(text));
            const score = jaccardSimilarity(queryTokens, docTokens);
            return { ...candidate, semanticScore: score };
        })
            .sort((a, b) => b.semanticScore - a.semanticScore);
    }
}
