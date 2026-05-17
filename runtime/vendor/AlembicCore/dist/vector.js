import { HnswVectorAdapter } from './infrastructure/vector/HnswVectorAdapter.js';
import { JsonVectorAdapter } from './infrastructure/vector/JsonVectorAdapter.js';
import { VectorService } from './service/vector/VectorService.js';
export { chunkByAST, ensureParser, isASTChunkerAvailable, LANG_ID_MAP, TOP_LEVEL_TYPES, } from './infrastructure/vector/ASTChunker.js';
export { AsyncPersistence, crc32, WAL_OP } from './infrastructure/vector/AsyncPersistence.js';
export { BatchEmbedder } from './infrastructure/vector/BatchEmbedder.js';
export { BinaryPersistence, FLAG_HAS_HNSW_GRAPH, FLAG_HAS_QUANTIZER, FLAG_SQ8_VECTORS, HEADER_SIZE, MAGIC, VERSION, } from './infrastructure/vector/BinaryPersistence.js';
export { chunk, DEFAULT_MAX_CHUNK_TOKENS, DEFAULT_OVERLAP_TOKENS, estimateTokens, } from './infrastructure/vector/Chunker.js';
export { cosineDistance, HnswIndex, MaxHeap, MinHeap } from './infrastructure/vector/HnswIndex.js';
export { HnswVectorAdapter } from './infrastructure/vector/HnswVectorAdapter.js';
export { IndexingPipeline } from './infrastructure/vector/IndexingPipeline.js';
export { JsonVectorAdapter } from './infrastructure/vector/JsonVectorAdapter.js';
export { ScalarQuantizer } from './infrastructure/vector/ScalarQuantizer.js';
export { VectorMigration } from './infrastructure/vector/VectorMigration.js';
export { VectorStore } from './infrastructure/vector/VectorStore.js';
export { SyncCoordinator } from './service/vector/SyncCoordinator.js';
export { VectorService };
/**
 * 创建 Core 本地向量存储。
 *
 * 这里稳定的是本地索引和分块能力；embedding provider 只是注入契约，
 * 具体模型、API key、限流和重试策略继续留在宿主仓库。
 */
export async function createLocalVectorStore(projectRoot, options = {}) {
    const store = createLocalVectorStoreSync(projectRoot, options);
    if (options.initialize !== false) {
        await store.init();
    }
    return store;
}
export function createLocalVectorStoreSync(projectRoot, options = {}) {
    if (options.kind === 'hnsw') {
        return new HnswVectorAdapter(projectRoot, options.hnsw);
    }
    return new JsonVectorAdapter(projectRoot, options.json);
}
export function createVectorService(config) {
    return new VectorService(config);
}
