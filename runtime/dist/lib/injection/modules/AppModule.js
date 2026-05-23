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
import { AlembicResidentServiceClient } from '../../service/resident/AlembicResidentServiceClient.js';
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
    c.singleton('residentServiceClient', (ct) => {
        const projectRoot = resolveProjectRoot(ct);
        return new AlembicResidentServiceClient({ projectRoot });
    });
    c.singleton('primeSearchPipeline', (ct) => new PrimeSearchPipeline(ct.get('searchEngine'), { residentServiceClient: ct.get('residentServiceClient') }));
}
/** 初始化 RecipeExtractor 实例 (在 initialize 期间调用) */
export function initRecipeExtractor(c) {
    c.singletons._recipeExtractor = new RecipeExtractor();
}
