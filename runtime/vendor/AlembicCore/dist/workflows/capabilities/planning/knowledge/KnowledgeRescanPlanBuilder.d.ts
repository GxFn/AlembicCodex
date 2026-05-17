import type { DimensionDef } from '../../../../types/project-snapshot.js';
import type { RecipeSnapshotEntry } from '../../RecipeSnapshotTypes.js';
import type { RelevanceAuditResult, RelevanceAuditSummary } from './KnowledgeRescanPlanner.js';
export declare const TARGET_RECIPES_PER_DIMENSION = 5;
export type AuditVerdict = RelevanceAuditResult['verdict'];
export type RescanExecutionReasonKind = 'manual-request' | 'coverage-gap' | 'recipe-decay' | 'file-change' | 'fully-covered';
export interface RescanExecutionReason {
    kind: RescanExecutionReasonKind;
    recipeIds?: string[];
    changedFiles?: string[];
    existing?: number;
    target?: number;
    gap?: number;
    detail?: string;
}
export type RescanExecutionMode = 'skip' | 'verify-only' | 'produce';
export interface KnowledgeRescanExecutionDecision {
    dimensionId: string;
    dimension: DimensionDef;
    mode: RescanExecutionMode;
    createBudget: number;
    existingCount: number;
    gap: number;
    existingRecipes: RecipeSnapshotEntry[];
    decayingRecipes: RecipeSnapshotEntry[];
    reasons: RescanExecutionReason[];
    shouldExecute: boolean;
}
export interface KnowledgeRescanDimensionPlan {
    dimension: DimensionDef;
    existingCount: number;
    gap: number;
    existingRecipes: RecipeSnapshotEntry[];
    decayingRecipes: RecipeSnapshotEntry[];
    executionReasons: RescanExecutionReason[];
    execution: KnowledgeRescanExecutionDecision;
    shouldExecute: boolean;
}
export interface KnowledgeRescanPlan {
    recipeEntries: RecipeSnapshotEntry[];
    auditSummary: RelevanceAuditSummary;
    auditVerdictMap: Map<string, AuditVerdict>;
    targetPerDimension: number;
    requestedDimensionIds?: string[];
    requestedDimensions: DimensionDef[];
    skippedByRequestDimensions: DimensionDef[];
    dimensionPlans: KnowledgeRescanDimensionPlan[];
    executionDecisions: KnowledgeRescanExecutionDecision[];
    executionDimensions: DimensionDef[];
    produceDimensions: DimensionDef[];
    gapDimensions: DimensionDef[];
    skippedDimensions: DimensionDef[];
    coverageByDimension: Record<string, number>;
    executionReasons: Record<string, RescanExecutionReason[]>;
    occupiedTriggers: string[];
    decayingRecipeIds: string[];
}
export interface BuildKnowledgeRescanPlanOptions {
    recipeEntries: RecipeSnapshotEntry[];
    auditSummary: RelevanceAuditSummary;
    dimensions: DimensionDef[];
    requestedDimensionIds?: string[];
    targetPerDimension?: number;
    fileDiff?: {
        affectedDimensionIds?: string[];
        changedFiles?: string[];
    } | null;
}
export declare function buildKnowledgeRescanPlan({ recipeEntries, auditSummary, dimensions, requestedDimensionIds, targetPerDimension, fileDiff, }: BuildKnowledgeRescanPlanOptions): KnowledgeRescanPlan;
