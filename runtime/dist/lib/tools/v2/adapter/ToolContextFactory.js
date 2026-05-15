/**
 * ToolContextFactory — 为每次 V2 工具调用组装 ToolContext。
 *
 * 长生命周期资源 (DeltaCache/SearchCache/Compressor/SessionStore)
 * 在 Factory 构造时创建一次，跨调用复用。
 * 重量级 DI 服务 (projectGraph/searchEngine 等) 按需从容器获取。
 */
import { DeltaCache } from '../cache/DeltaCache.js';
import { SearchCache } from '../cache/SearchCache.js';
import { OutputCompressor } from '../compressor/OutputCompressor.js';
class SimpleSessionStore {
    #entries = [];
    save(key, content, meta) {
        this.#entries.push({ key, content, meta, timestamp: Date.now() });
    }
    recall(query, opts) {
        let results = [...this.#entries];
        if (query) {
            const q = query.toLowerCase();
            results = results.filter((e) => e.key.toLowerCase().includes(q) || e.content.toLowerCase().includes(q));
        }
        if (opts?.tags?.length) {
            results = results.filter((e) => opts.tags?.some((t) => e.meta?.tags?.includes(t)));
        }
        const limit = opts?.limit ?? 20;
        return results.slice(-limit).map(({ key, content, meta }) => ({ key, content, meta }));
    }
}
export class ToolContextFactory {
    #deps;
    #deltaCache;
    #searchCache;
    #compressor;
    #sessionStore;
    constructor(deps) {
        this.#deps = deps;
        this.#deltaCache = new DeltaCache(200);
        this.#searchCache = new SearchCache(100);
        this.#compressor = new OutputCompressor();
        this.#sessionStore = new SimpleSessionStore();
    }
    getContainer() {
        return this.#deps.container;
    }
    create(request) {
        const c = this.#deps.container;
        return {
            projectRoot: this.#deps.projectRoot,
            projectGraph: tryGet(c, 'projectGraph'),
            codeEntityGraph: tryGet(c, 'codeEntityGraph'),
            searchEngine: tryGet(c, 'searchEngine'),
            recipeGateway: tryGet(c, 'recipeProductionGateway'),
            knowledgeRepo: tryGet(c, 'knowledgeRepository'),
            evolutionGateway: tryGet(c, 'evolutionGateway'),
            astAnalyzer: tryGet(c, 'astAnalyzer'),
            safetyPolicy: request.runtime?.safetyPolicy ?? undefined,
            deltaCache: this.#deltaCache,
            searchCache: this.#searchCache,
            compressor: this.#compressor,
            sessionStore: this.#sessionStore,
            tokenBudget: this.#deps.defaultTokenBudget ?? 8000,
            abortSignal: request.abortSignal ?? undefined,
            memoryCoordinator: request.runtime?.memoryCoordinator ?? undefined,
            runtime: request.runtime ?? undefined,
        };
    }
}
function tryGet(container, name) {
    try {
        return container.get(name);
    }
    catch {
        return undefined;
    }
}
