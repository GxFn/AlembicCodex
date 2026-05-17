/**
 * MissionBriefingSupport — Mission Briefing 配置、文本模板与辅助构建器
 *
 * 包含 Briefing 构建过程中的配置档案、维度文本常量、
 * 响应压缩策略、执行指令构建和 Rescan 证据投影。
 * 由 MissionBriefingBuilder 统一调用。
 */
import type { DimensionDef } from '../../../../types/project-snapshot.js';
import type { ExternalRescanEvidencePlan } from '../../planning/knowledge/KnowledgeRescanPlanner.js';
export type BriefingProfile = 'cold-start-external' | 'rescan-external';
export interface ResponseBudget {
    limitBytes: number;
}
export interface RescanBriefingPrescreen {
    needsVerification: unknown[];
    autoResolved: unknown[];
    dimensionGaps: unknown;
}
export interface RescanBriefingInput {
    evidencePlan: ExternalRescanEvidencePlan;
    prescreen: RescanBriefingPrescreen;
}
export interface BriefingProfileInput {
    profile?: BriefingProfile;
    rescan?: RescanBriefingInput;
    responseBudget?: Partial<ResponseBudget>;
}
export interface BriefingPlan {
    profile: BriefingProfile;
    rescan?: RescanBriefingInput;
    responseBudget: ResponseBudget;
}
export declare const DEFAULT_BRIEFING_PROFILE: BriefingProfile;
export declare const DEFAULT_RESPONSE_BUDGET: ResponseBudget;
export declare function createBriefingPlan(input?: BriefingProfileInput): BriefingPlan;
/** 知识提交的完整 Schema — 定义必填字段、内容结构、枚举值和质量门控 */
export declare const SUBMISSION_SCHEMA: {
    tool: string;
    batchTool: string;
    requiredFields: string[];
    contentStructure: {
        pattern: string;
        markdown: string;
        rationale: string;
    };
    dimensionId: string;
    categoryEnum: string[];
    kindEnum: string[];
    reasoning: {
        whyStandard: string;
        sources: string;
        confidence: string;
    };
    qualityGates: string[];
};
export declare const EXAMPLE_TEMPLATES: {
    objectivec: {
        title: string;
        language: string;
        content: {
            markdown: string;
            rationale: string;
        };
        kind: string;
        doClause: string;
        dontClause: string;
        whenClause: string;
        category: string;
        trigger: string;
        description: string;
        headers: never[];
        usageGuide: string;
        knowledgeType: string;
        coreCode: string;
        reasoning: {
            whyStandard: string;
            sources: string[];
            confidence: number;
        };
    };
    typescript: {
        title: string;
        language: string;
        content: {
            markdown: string;
            rationale: string;
        };
        kind: string;
        doClause: string;
        dontClause: string;
        whenClause: string;
        category: string;
        trigger: string;
        description: string;
        headers: string[];
        usageGuide: string;
        knowledgeType: string;
        coreCode: string;
        reasoning: {
            whyStandard: string;
            sources: string[];
            confidence: number;
        };
    };
    python: {
        title: string;
        language: string;
        content: {
            markdown: string;
            rationale: string;
        };
        kind: string;
        doClause: string;
        dontClause: string;
        whenClause: string;
        category: string;
        trigger: string;
        description: string;
        headers: string[];
        usageGuide: string;
        knowledgeType: string;
        coreCode: string;
        reasoning: {
            whyStandard: string;
            sources: string[];
            confidence: number;
        };
    };
    _default: {
        title: string;
        language: string;
        content: {
            markdown: string;
            rationale: string;
        };
        kind: string;
        doClause: string;
        dontClause: string;
        whenClause: string;
        category: string;
        trigger: string;
        description: string;
        headers: never[];
        usageGuide: string;
        knowledgeType: string;
        coreCode: string;
        reasoning: {
            whyStandard: string;
            sources: string[];
            confidence: number;
        };
    };
};
export declare const REQUIRED_FIELDS_DESCRIPTION: string[];
export declare function buildInternalNextSteps(dimensions: ReadonlyArray<{
    id: string;
    skillWorthy?: boolean;
}>): string[];
interface CompressibleAstClass {
    file?: string | null;
    protocols?: string[];
}
interface CompressibleAstProtocol {
    name?: string;
    methodCount?: number;
    file?: string | null;
    conformers?: string[];
}
interface CompressibleDimensionTask {
    evidenceStarters?: unknown;
    analysisGuide?: unknown;
    submissionSpec?: {
        preSubmitChecklist?: Record<string, unknown>;
        [key: string]: unknown;
    };
}
export interface CompressibleBriefing {
    ast: {
        compressionLevel?: string;
        classes: CompressibleAstClass[];
        protocols: CompressibleAstProtocol[];
        categories?: unknown[];
        metrics?: {
            complexMethods?: unknown;
            longMethods?: unknown;
            [key: string]: unknown;
        } | null;
    };
    dependencyGraph?: {
        edges: unknown[];
    } | null;
    dimensions: CompressibleDimensionTask[];
    technologyStack?: unknown;
    meta?: {
        responseSizeKB?: number;
        compressionLevel?: string;
        warnings?: string[];
        [key: string]: unknown;
    };
}
export declare function applyBriefingCompressionPolicy<T extends CompressibleBriefing>(briefing: T, responseBudget: ResponseBudget): T;
export interface ExecutionPlanTier {
    tier: number;
    label: string;
    dimensions: string[];
    note: string;
}
export interface ExecutionInstructions {
    tiers: ExecutionPlanTier[];
    totalDimensions: number;
    workflow: string;
}
export declare function buildExecutionInstructions({ activeDimensions, profile, rescan, }: {
    activeDimensions: DimensionDef[];
    profile: BriefingProfile;
    rescan?: RescanBriefingInput;
}): ExecutionInstructions;
export interface RescanEvidenceHints {
    allRecipes: ExternalRescanEvidencePlan['allRecipes'];
    rescanMode: true;
    dimensionGaps: ExternalRescanEvidencePlan['dimensionGaps'];
    executionReasons: ExternalRescanEvidencePlan['executionReasons'];
    evolutionPrescreen: {
        needsVerification: unknown[];
        autoResolved: unknown[];
        dimensionGapsByPrescreen: unknown;
    };
    evolutionGuide: {
        decayCount: number;
        totalCount: number;
        instructions: string;
    };
    constraints: {
        occupiedTriggers: string[];
        rules: string[];
    };
}
export declare function projectRescanEvidenceHints({ evidencePlan, prescreen, }: RescanBriefingInput): RescanEvidenceHints;
export {};
