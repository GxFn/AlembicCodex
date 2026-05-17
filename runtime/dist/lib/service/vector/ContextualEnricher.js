/**
 * ContextualEnricher — deterministic pass-through adapter.
 *
 * AlembicPlugin no longer executes local AI enrichment. The class remains as a
 * VectorChunkEnricher-compatible boundary so existing DI and Core vector
 * contracts can opt into a host/Core-provided enricher later.
 */
export class ContextualEnricher {
    constructor(_config = {}) { }
    async enrichChunks(_document, chunks) {
        return chunks;
    }
    clearCache() { }
    get cacheSize() {
        return 0;
    }
}
