/**
 * AppModule — 应用层杂项服务注册
 *
 * 负责注册:
 *   - recipeParser, recipeCandidateValidator
 *   - qualityScorer, feedbackCollector, tokenUsageStore, recipeExtractor
 *   - moduleService
 *   - primeSearchPipeline (for prime multi-query search — no DB dependency)
 */
import { TokenUsageStore } from '@alembic/core/repository/token/TokenUsageStore';
import { unwrapRawDb } from '@alembic/core/search';
import { RecipeExtractor } from '@alembic/core/service/knowledge/RecipeExtractor';
import { FeedbackCollector } from '@alembic/core/service/quality/FeedbackCollector';
import { QualityScorer } from '@alembic/core/service/quality/QualityScorer';
import { RecipeCandidateValidator } from '@alembic/core/service/recipe/RecipeCandidateValidator';
import { RecipeParser } from '@alembic/core/service/recipe/RecipeParser';
import { resolveDataRoot, resolveProjectRoot } from '@alembic/core/workspace';
import { ModuleService } from '../../service/module/ModuleService.js';
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
    c.singleton('primeSearchPipeline', (ct) => new PrimeSearchPipeline(ct.get('searchEngine')));
}
/** 初始化 RecipeExtractor 实例 (在 initialize 期间调用) */
export function initRecipeExtractor(c) {
    c.singletons._recipeExtractor = new RecipeExtractor();
}
