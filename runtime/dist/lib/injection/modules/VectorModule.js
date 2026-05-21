/**
 * VectorModule — 向量服务 DI 注册
 *
 * 注册:
 *   - vectorService: 统一向量服务层
 *   - contextualEnricher: 插件模式下禁用的上下文增强边界
 *
 * 依赖 KnowledgeModule 先注册: vectorStore, indexingPipeline, hybridRetriever
 * 依赖 InfraModule 先注册: eventBus, database
 */
import { VectorService } from '@alembic/core/vector';
export function register(c) {
    // ═══ ContextualEnricher (host-managed; local AI enrichment disabled) ═══
    c.singleton('contextualEnricher', (_ct) => null);
    // ═══ VectorService ═══
    c.singleton('vectorService', (ct) => {
        const config = ct.singletons._config?.vector || {};
        return new VectorService({
            vectorStore: ct.get('vectorStore'),
            indexingPipeline: ct.get('indexingPipeline'),
            hybridRetriever: ct.services.hybridRetriever
                ? ct.get('hybridRetriever')
                : null,
            eventBus: ct.services.eventBus ? ct.get('eventBus') : null,
            // Plugin 不维护可执行 embedding provider。Resident vector search 由 Alembic daemon
            // HTTP API 增强；embedded runtime 只保留可降级的 baseline/vector store 管线。
            embedProvider: null,
            contextualEnricher: ct.services.contextualEnricher
                ? ct.get('contextualEnricher')
                : null,
            autoSyncOnCrud: config.autoSyncOnCrud !== false,
            syncDebounceMs: config.syncDebounceMs || 2000,
            drizzle: ct.services.database
                ? ct.get('database').getDrizzle?.()
                : undefined,
        });
    });
}
/**
 * 初始化 VectorService（在容器初始化后调用）
 * 用于绑定 EventBus 监听等异步初始化操作，同时将 ContextualEnricher 注入 IndexingPipeline
 */
export async function initializeVectorService(c) {
    // 将 ContextualEnricher 注入 IndexingPipeline（如果可用）
    if (c.services.contextualEnricher && c.services.indexingPipeline) {
        const config = c.singletons._config?.vector || {};
        if (config.contextualEnrich) {
            const enricher = c.get('contextualEnricher');
            if (enricher) {
                const pipeline = c.get('indexingPipeline');
                pipeline.setContextualEnricher?.(enricher);
            }
        }
    }
    if (c.services.vectorService) {
        try {
            const vectorService = c.get('vectorService');
            await vectorService.initialize();
        }
        catch (err) {
            const logger = c.singletons.logger || console;
            logger.warn?.('[VectorModule] VectorService initialization failed (non-blocking)', { error: err.message });
        }
    }
}
