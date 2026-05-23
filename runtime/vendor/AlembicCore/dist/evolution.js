// EvolutionPolicy 是 evolution 稳定 facade 的领域决策入口；外层不应继续 deep import domain/evolution。
export { EvolutionPolicy } from './domain/evolution/EvolutionPolicy.js';
export { assessDiffImpact, assessFileImpact, assessImpactUnified, ConsolidationAdvisor, ContentPatcher, DecayDetector, EnhancementSuggester, EvolutionGateway, extractApiTokens, extractRecipeTokens, LifecycleStateMachine, ProposalExecutor, RecipeImpactPlanner, RedundancyAnalyzer, StagingManager, submitRescanImpactDecisions, toEvolutionAuditRecipe, tokenizeIdentifiers, toRescanImpactDecision, } from './service/evolution/index.js';
