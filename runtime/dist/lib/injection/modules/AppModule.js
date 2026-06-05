/**
 * AppModule — 应用层杂项服务注册
 *
 * 负责注册:
 *   - recipeParser, recipeCandidateValidator
 *   - qualityScorer, feedbackCollector, tokenUsageStore, recipeExtractor
 *   - moduleService
 *   - primeSearchPipeline (for prime multi-query search — no DB dependency)
 */
import { RecipeExtractor } from '@alembic/core/knowledge';
import { TokenUsageStore } from '@alembic/core/repositories';
import { unwrapRawDb } from '@alembic/core/search';
import { FeedbackCollector, QualityScorer } from '@alembic/core/service/quality';
import { RecipeCandidateValidator, RecipeParser } from '@alembic/core/service/recipe';
import { resolveDataRoot, resolveProjectRoot } from '@alembic/core/workspace';
import { ModuleService } from '../../service/module/ModuleService.js';
import { createAlembicResidentCapabilityClients, } from '../../service/resident/AlembicResidentCapabilityClients.js';
import { PrimeSearchPipeline } from '../../service/task/PrimeSearchPipeline.js';
export function register(c) {
    // ═══ Quality + Recipe ═══
    c.singleton('qualityScorer', () => new QualityScorer());
    c.singleton('recipeParser', () => new RecipeParser());
    c.singleton('recipeCandidateValidator', () => new RecipeCandidateValidator());
    c.register('recipeExtractor', () => c.singletons._recipeExtractor || null);
    c.singleton('feedbackCollector', (ct) => {
        const dataRoot = resolveDataRoot(ct);
        const wz = ct.singletons.writeZone;
        return new FeedbackCollector(dataRoot, {
            wz,
        });
    });
    c.singleton('tokenUsageStore', (ct) => {
        const db = ct.get('database');
        return new TokenUsageStore(unwrapRawDb(db), db.getDrizzle());
    });
    // ═══ Module ═══
    c.singleton('moduleService', (ct) => {
        const projectRoot = resolveProjectRoot(ct);
        return new ModuleService(projectRoot, {
            container: ct,
            qualityScorer: ct.get('qualityScorer'),
            recipeExtractor: ct.singletons._recipeExtractor || null,
            guardCheckEngine: ct.get('guardCheckEngine'),
            violationsStore: ct.get('violationsStore'),
        });
    });
    // ═══ PrimeSearchPipeline (for prime multi-query search) ═══
    c.singleton('residentCapabilityClients', (ct) => {
        const projectRoot = resolveProjectRoot(ct);
        return createAlembicResidentCapabilityClients({ projectRoot });
    });
    c.singleton('residentSearchClient', (ct) => {
        return ct.get('residentCapabilityClients').search;
    });
    c.singleton('residentIntentEpisodeClient', (ct) => {
        return ct.get('residentCapabilityClients').intentEpisodes;
    });
    c.singleton('residentDecisionRegisterClient', (ct) => {
        return ct.get('residentCapabilityClients')
            .decisionRegister;
    });
    // Deprecated internal DI key retained only for HTTP compatibility callers until every
    // route switches to capability-specific clients; Codex MCP paths use the split clients.
    c.singleton('residentServiceClient', (ct) => {
        const clients = ct.get('residentCapabilityClients');
        return {
            dashboard: clients.dashboard.dashboard.bind(clients.dashboard),
            decisionRegister: clients.decisionRegister.decisionRegister.bind(clients.decisionRegister),
            decisionRegisterCapability: clients.decisionRegister.decisionRegisterCapability.bind(clients.decisionRegister),
            enqueueJob: clients.jobs.enqueueJob.bind(clients.jobs),
            latestIntentEpisode: clients.intentEpisodes.latestIntentEpisode.bind(clients.intentEpisodes),
            probe: clients.probe.probe.bind(clients.probe),
            readJob: clients.jobs.readJob.bind(clients.jobs),
            recentIntentEpisodes: clients.intentEpisodes.recentIntentEpisodes.bind(clients.intentEpisodes),
            resolveProjectScopeIdentity: clients.projectScope.resolveProjectScopeIdentity.bind(clients.projectScope),
            search: clients.search.search.bind(clients.search),
            searchWithResult: clients.search.searchWithResult.bind(clients.search),
            startIntentEpisode: clients.intentEpisodes.startIntentEpisode.bind(clients.intentEpisodes),
            updateIntentEpisodeOutcome: clients.intentEpisodes.updateIntentEpisodeOutcome.bind(clients.intentEpisodes),
        };
    });
    c.singleton('primeSearchPipeline', (ct) => new PrimeSearchPipeline(ct.get('searchEngine'), { residentServiceClient: ct.get('residentSearchClient') }));
}
/** 初始化 RecipeExtractor 实例 (在 initialize 期间调用) */
export function initRecipeExtractor(c) {
    c.singletons._recipeExtractor = new RecipeExtractor();
}
