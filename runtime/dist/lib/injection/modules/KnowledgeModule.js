/**
 * KnowledgeModule — 知识 + 搜索 + 向量服务注册
 *
 * 负责注册:
 *   - knowledgeService, knowledgeGraphService, codeEntityGraph, confidenceRouter
 *   - searchEngine, vectorStore, indexingPipeline
 *   - discovererRegistry, enhancementRegistry, languageService, dimensionCopy
 *   - constitution, aiProvider, projectGraph
 */
import { getEnhancementRegistry } from '@alembic/core/core/enhancement';
import { DimensionCopy } from '@alembic/core/dimensions';
import { KnowledgeService, RecipeProductionGateway } from '@alembic/core/knowledge';
import { getDiscovererRegistry, LanguageService } from '@alembic/core/project-intelligence';
import { HybridRetriever, SearchEngine } from '@alembic/core/search';
import { findSimilarRecipes } from '@alembic/core/service/candidate';
import { ConsolidationAdvisor } from '@alembic/core/service/evolution/ConsolidationAdvisor';
import { ContentPatcher } from '@alembic/core/service/evolution/ContentPatcher';
import { DecayDetector } from '@alembic/core/service/evolution/DecayDetector';
import { EnhancementSuggester } from '@alembic/core/service/evolution/EnhancementSuggester';
import { EvolutionGateway } from '@alembic/core/service/evolution/EvolutionGateway';
import { LifecycleStateMachine } from '@alembic/core/service/evolution/LifecycleStateMachine';
import { ProposalExecutor } from '@alembic/core/service/evolution/ProposalExecutor';
import { RedundancyAnalyzer } from '@alembic/core/service/evolution/RedundancyAnalyzer';
import { StagingManager } from '@alembic/core/service/evolution/StagingManager';
import { CodeEntityGraph } from '@alembic/core/service/knowledge/CodeEntityGraph';
import { ConfidenceRouter } from '@alembic/core/service/knowledge/ConfidenceRouter';
import { KnowledgeGraphService } from '@alembic/core/service/knowledge/KnowledgeGraphService';
import { SourceRefReconciler } from '@alembic/core/service/knowledge/SourceRefReconciler';
import { HnswVectorAdapter, IndexingPipeline, JsonVectorAdapter } from '@alembic/core/vector';
import { resolveDataRoot, resolveKnowledgeScanDirs, resolveProjectRoot, } from '@alembic/core/workspace';
import { FileChangeHandler } from '../../service/evolution/FileChangeHandler.js';
import { FileChangeDispatcher } from '../../service/FileChangeDispatcher.js';
export function register(c) {
    // ═══ Knowledge ═══
    c.singleton('confidenceRouter', (ct) => new ConfidenceRouter({}, ct.get('qualityScorer')));
    c.singleton('knowledgeService', (ct) => new KnowledgeService(ct.get('knowledgeRepository'), ct.get('auditLogger'), ct.get('gateway'), ct.get('knowledgeGraphService'), {
        fileWriter: ct.get('knowledgeFileWriter'),
        skillHooks: ct.get('skillHooks'),
        confidenceRouter: ct.get('confidenceRouter'),
        qualityScorer: ct.get('qualityScorer'),
        eventBus: ct.services.eventBus ? ct.get('eventBus') : null,
        edgeRepo: ct.get('knowledgeEdgeRepository'),
        proposalRepo: ct.get('proposalRepository'),
    }));
    c.singleton('knowledgeGraphService', (ct) => new KnowledgeGraphService(ct.get('knowledgeEdgeRepository')));
    c.singleton('codeEntityGraph', (ct) => {
        const projectRoot = resolveProjectRoot(ct);
        return new CodeEntityGraph(ct.get('codeEntityRepository'), ct.get('knowledgeEdgeRepository'), { projectRoot });
    });
    // ═══ Search + Vector ═══
    c.singleton('searchEngine', (ct) => {
        const aiProvider = ct.singletons.aiProvider || null;
        const embedProvider = ct.singletons._embedProvider || aiProvider;
        const vectorService = ct.services.vectorService ? ct.get('vectorService') : null;
        return new SearchEngine(ct.get('database'), {
            aiProvider: embedProvider,
            vectorStore: ct.get('vectorStore'),
            vectorService,
            hybridRetriever: ct.get('hybridRetriever'),
            crossEncoderReranker: null,
            signalBus: ct.singletons.signalBus || null,
            knowledgeRepo: ct.get('knowledgeRepository'),
            sourceRefRepo: ct.get('recipeSourceRefRepository'),
        });
    }, { aiDependent: true });
    c.singleton('vectorStore', (ct) => {
        const dataRoot = resolveDataRoot(ct);
        const wz = ct.singletons.writeZone;
        const config = ct.singletons._config?.vector || {};
        const adapter = config.adapter || 'auto';
        // 根据配置选择适配器
        if (adapter === 'json') {
            const store = new JsonVectorAdapter(dataRoot, { writeZone: wz });
            store.initSync();
            return store;
        }
        if (adapter === 'hnsw' || adapter === 'auto') {
            try {
                const hnsw = config.hnsw || {};
                const persistence = config.persistence || {};
                const store = new HnswVectorAdapter(dataRoot, {
                    M: hnsw.M,
                    efConstruct: hnsw.efConstruct,
                    efSearch: hnsw.efSearch,
                    quantize: config.quantize,
                    quantizeThreshold: config.quantizeThreshold,
                    flushIntervalMs: persistence.flushIntervalMs,
                    flushBatchSize: persistence.flushBatchSize,
                    writeZone: wz,
                });
                store.initSync();
                return store;
            }
            catch (err) {
                // HNSW 初始化失败, 降级到 JSON — 记录警告便于排查
                const logger = ct.singletons.logger || console;
                logger.warn?.('[vectorStore] HNSW init failed, falling back to JsonVectorAdapter', {
                    error: err.message,
                    adapter,
                });
                const store = new JsonVectorAdapter(dataRoot, { writeZone: wz });
                store.initSync();
                return store;
            }
        }
        // 未知适配器, 默认 JSON
        const store = new JsonVectorAdapter(dataRoot, { writeZone: wz });
        store.initSync();
        return store;
    });
    c.singleton('indexingPipeline', (ct) => {
        const aiProvider = ct.singletons.aiProvider || null;
        const embedProvider = ct.singletons._embedProvider || aiProvider;
        const dataRoot = resolveDataRoot(ct);
        return new IndexingPipeline({
            projectRoot: dataRoot,
            scanDirs: resolveKnowledgeScanDirs(ct),
            vectorStore: ct.get('vectorStore'),
            aiProvider: embedProvider,
        });
    }, { aiDependent: true });
    c.singleton('hybridRetriever', (ct) => {
        const config = ct.singletons._config?.vector;
        const hybrid = config?.hybrid || {};
        return new HybridRetriever({
            vectorStore: ct.get('vectorStore'),
            rrfK: hybrid.rrfK || 60,
            alpha: hybrid.alpha || 0.5,
        });
    });
    // ═══ Discovery + Shared ═══
    c.register('discovererRegistry', () => getDiscovererRegistry());
    c.register('enhancementRegistry', () => getEnhancementRegistry());
    c.register('languageService', () => LanguageService);
    c.register('dimensionCopy', () => DimensionCopy);
    c.register('constitution', () => c.singletons.constitution || null);
    c.register('aiProvider', () => c.singletons.aiProvider || null);
    c.register('projectGraph', () => c.singletons.projectGraph || null);
    // ═══ Governance / Evolution ═══
    c.singleton('sourceRefReconciler', (ct) => {
        const projectRoot = resolveProjectRoot();
        const sourceRefRepo = ct.get('recipeSourceRefRepository');
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new SourceRefReconciler(projectRoot, sourceRefRepo, knowledgeRepo, {
            signalBus: ct.singletons.signalBus ||
                undefined,
        });
    });
    c.singleton('stagingManager', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new StagingManager(knowledgeRepo, {
            signalBus: ct.singletons.signalBus ||
                undefined,
        });
    });
    c.singleton('decayDetector', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new DecayDetector(knowledgeRepo, {
            signalBus: ct.singletons.signalBus ||
                undefined,
            knowledgeEdgeRepo: ct.services.knowledgeEdgeRepository
                ? ct.get('knowledgeEdgeRepository')
                : undefined,
            sourceRefRepo: ct.services.recipeSourceRefRepository
                ? ct.get('recipeSourceRefRepository')
                : undefined,
        });
    });
    c.singleton('redundancyAnalyzer', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new RedundancyAnalyzer(knowledgeRepo, {
            signalBus: ct.singletons.signalBus ||
                undefined,
        });
    });
    c.singleton('enhancementSuggester', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new EnhancementSuggester(knowledgeRepo, {
            signalBus: ct.singletons.signalBus ||
                undefined,
        });
    });
    c.singleton('contentPatcher', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        const sourceRefRepo = ct.get('recipeSourceRefRepository');
        return new ContentPatcher(knowledgeRepo, sourceRefRepo);
    });
    c.singleton('lifecycleStateMachine', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        const lifecycleEventRepo = ct.get('lifecycleEventRepository');
        const signalBus = ct.get('signalBus');
        const proposalRepo = ct.get('proposalRepository');
        return new LifecycleStateMachine(knowledgeRepo, lifecycleEventRepo, signalBus, proposalRepo);
    });
    c.singleton('proposalExecutor', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        const proposalRepo = ct.get('proposalRepository');
        const lifecycle = ct.get('lifecycleStateMachine');
        const contentPatcher = ct.get('contentPatcher');
        const edgeRepo = ct.get('knowledgeEdgeRepository');
        return new ProposalExecutor(knowledgeRepo, proposalRepo, lifecycle, contentPatcher, edgeRepo);
    });
    c.singleton('consolidationAdvisor', (ct) => {
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new ConsolidationAdvisor(knowledgeRepo);
    });
    c.singleton('evolutionGateway', (ct) => {
        const proposalRepo = ct.get('proposalRepository');
        const lifecycle = ct.get('lifecycleStateMachine');
        const knowledgeRepo = ct.get('knowledgeRepository');
        return new EvolutionGateway(proposalRepo, lifecycle, knowledgeRepo);
    });
    c.singleton('recipeProductionGateway', (ct) => {
        const knowledgeService = ct.get('knowledgeService');
        const dataRoot = resolveDataRoot(ct);
        let consolidationAdvisor = null;
        let proposalRepository = null;
        let evolutionGateway = null;
        try {
            consolidationAdvisor = ct.get('consolidationAdvisor');
        }
        catch {
            /* optional */
        }
        try {
            proposalRepository = ct.get('proposalRepository');
        }
        catch {
            /* optional */
        }
        try {
            evolutionGateway = ct.get('evolutionGateway');
        }
        catch {
            /* optional */
        }
        return new RecipeProductionGateway({
            knowledgeService: knowledgeService,
            projectRoot: dataRoot,
            consolidationAdvisor: consolidationAdvisor,
            proposalRepository: proposalRepository,
            evolutionGateway: evolutionGateway,
            findSimilarRecipes,
        });
    });
    c.singleton('fileChangeHandler', (ct) => {
        const sourceRefRepo = ct.get('recipeSourceRefRepository');
        const knowledgeRepo = ct.get('knowledgeRepository');
        const contentPatcher = ct.get('contentPatcher');
        const gateway = ct.get('evolutionGateway');
        const dataRoot = resolveDataRoot(ct);
        const projectRoot = resolveProjectRoot(ct);
        return new FileChangeHandler(sourceRefRepo, knowledgeRepo, contentPatcher, {
            signalBus: ct.singletons.signalBus ||
                undefined,
            evolutionGateway: gateway,
            dataRoot,
            projectRoot,
        });
    });
    c.singleton('fileChangeDispatcher', (ct) => {
        const dispatcher = new FileChangeDispatcher();
        const handler = ct.get('fileChangeHandler');
        dispatcher.register(handler);
        return dispatcher;
    });
}
/**
 * 初始化知识服务（在容器初始化后调用）
 * 绑定 EventBus → SearchEngine.refreshIndex() + recipe_source_refs 填充
 */
export function initializeKnowledgeServices(c) {
    if (!c.services.eventBus || !c.services.searchEngine) {
        return;
    }
    try {
        const { EventBus } = await_import_EventBus();
        const eventBus = c.get('eventBus');
        const searchEngine = c.get('searchEngine');
        // Bug 修复: BM25 索引与 Vector 索引一致性 — 将 knowledge:changed 事件绑定到 refreshIndex
        eventBus.on('knowledge:changed', () => {
            try {
                searchEngine.refreshIndex();
            }
            catch {
                /* refreshIndex failure is non-fatal */
            }
        });
        // recipe_source_refs 填充：MCP 内提交新知识后同步更新桥接表
        eventBus.on('knowledge:changed', (data) => {
            try {
                const d = data;
                if (d.action === 'create' && d.entryId) {
                    void _populateSourceRefsForEntry(c, d.entryId);
                }
            }
            catch {
                /* sourceRef population failure is non-fatal */
            }
        });
    }
    catch {
        /* EventBus/SearchEngine not available — skip binding */
    }
}
/** EventBus 延迟引用（避免循环依赖） */
function await_import_EventBus() {
    // EventBus 类型已经通过 container 解析，此处只用于 TS 类型
    return {
        EventBus: Object,
    };
}
/**
 * 从 knowledge_entries.reasoning 中提取 sources 并填充 recipe_source_refs 桥接表
 * 使用 KnowledgeRepository + RecipeSourceRefRepository 类型安全 API
 */
async function _populateSourceRefsForEntry(c, entryId) {
    try {
        const knowledgeRepo = c.get('knowledgeRepository');
        const sourceRefRepo = c.get('recipeSourceRefRepository');
        const row = await knowledgeRepo.findSourceFileAndReasoning(entryId);
        if (!row?.reasoning) {
            return;
        }
        let sources = [];
        try {
            const reasoning = JSON.parse(row.reasoning);
            sources = Array.isArray(reasoning.sources)
                ? reasoning.sources.filter((s) => typeof s === 'string' && s.length > 0)
                : [];
        }
        catch {
            return;
        }
        if (sources.length === 0) {
            return;
        }
        const now = Date.now();
        for (const sourcePath of sources) {
            try {
                sourceRefRepo.upsert({
                    recipeId: entryId,
                    sourcePath,
                    status: 'active',
                    verifiedAt: now,
                });
            }
            catch {
                /* table may not exist yet */
            }
        }
    }
    catch {
        /* repos may not be registered yet */
    }
}
