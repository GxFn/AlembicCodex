import type { ProjectSnapshot } from '../../../types/project-snapshot.js';
import type { ProjectAnalysisResult } from './ProjectIntelligenceCapability.js';
export type IDEAgentAnalysisPacketProfile = 'cold-start' | 'rescan';
export type IDEAgentSourceRefRole = 'entry' | 'caller' | 'callee' | 'dependency' | 'guard' | 'example' | 'module' | 'symbol';
export type IDEAgentStructuralEvidenceKind = 'ast' | 'callgraph' | 'dependency' | 'guard' | 'panorama' | 'target' | 'module' | 'file';
export type IDEAgentAnalysisDegradedReason = 'ast-unavailable' | 'ast-partial' | 'callgraph-unavailable' | 'callgraph-partial' | 'depgraph-unavailable' | 'guard-unavailable' | 'panorama-unavailable' | 'source-path-compressed' | 'empty-read-set';
export type IDEAgentAnalysisUnitStatus = 'pending' | 'claimed' | 'completed' | 'blocked' | 'rejected' | 'skipped';
export interface IDEAgentSourceRef {
    path: string;
    folderDisplayName?: string;
    folderId?: string;
    folderRelativeRoot?: string;
    line?: number;
    projectScopeId?: string;
    qualifiedPath?: string;
    relativePath?: string;
    symbol?: string;
    fqn?: string;
    entityType?: string;
    role?: IDEAgentSourceRefRole;
    displayName?: string;
    alias?: string;
}
export interface IDEAgentStableUnitKeyInput {
    sourceRef: string;
    folderId?: string;
    projectScopeId?: string;
    qualifiedPath?: string;
    fqn?: string;
    entityType: string;
    line?: number;
    symbol?: string;
}
export interface IDEAgentStableUnitKey extends IDEAgentStableUnitKeyInput {
    key: string;
    shortAlias?: string;
}
export interface IDEAgentStructuralEvidenceRef {
    kind: IDEAgentStructuralEvidenceKind;
    ref: string;
    summary: string;
    sourceRefs?: IDEAgentSourceRef[];
}
export interface IDEAgentDependencyHint {
    from: string;
    to: string;
    relation: string;
}
export interface IDEAgentStructuralHints {
    ast?: string[];
    dependencies?: IDEAgentDependencyHint[];
    callers?: string[];
    callees?: string[];
    dataFlowHints?: string[];
    guardFindings?: string[];
    panorama?: string[];
    aliases?: string[];
}
export interface IDEAgentCompletionContract {
    minDistinctFiles: number;
    mustReferenceAssignedSources: boolean;
    expectedEvidence: string[];
    allowNoRecipeWithReason?: boolean;
}
export interface IDEAgentAnalysisUnit {
    unitId: string;
    key: IDEAgentStableUnitKey;
    dimensionId: string;
    targetName?: string;
    moduleName?: string;
    priority: number;
    reason: string;
    sourceRefs: IDEAgentSourceRef[];
    requiredReadSet: string[];
    structuralEvidenceRefs: IDEAgentStructuralEvidenceRef[];
    structuralHints: IDEAgentStructuralHints;
    completionContract: IDEAgentCompletionContract;
    degraded: IDEAgentAnalysisDegradedReason[];
    warnings: string[];
}
export interface IDEAgentAnalysisUnitCheckpointLink {
    sessionId?: string;
    dimensionId: string;
    checkpointKind: 'dimension-checkpoint' | 'job-result' | 'bootstrap-session';
    updatedAt?: string;
}
export interface IDEAgentAnalysisUnitProgress {
    unitId: string;
    status: IDEAgentAnalysisUnitStatus;
    claimedAt?: string;
    completedAt?: string;
    submittedRecipeIds: string[];
    referencedFiles: string[];
    rejectedReasons: string[];
    deviationReason?: string;
    checkpoint?: IDEAgentAnalysisUnitCheckpointLink;
}
export interface IDEAgentAnalysisProgressSeed {
    packetId: string;
    checkpointKind: 'ide-agent-analysis-unit-progress';
    totalUnits: number;
    remainingUnitIds: string[];
    unitProgress: IDEAgentAnalysisUnitProgress[];
}
export interface IDEAgentAnalysisPacket {
    packetId: string;
    projectRootHash: string;
    generatedAt: string;
    profile: IDEAgentAnalysisPacketProfile;
    projectSummary: {
        primaryLanguage: string;
        fileCount: number;
        targetCount: number;
        materialization: Record<string, boolean | number | string>;
        degraded: IDEAgentAnalysisDegradedReason[];
        warnings: string[];
    };
    units: IDEAgentAnalysisUnit[];
    sourceRefs: IDEAgentSourceRef[];
    requiredReadSet: string[];
    structuralEvidenceRefs: IDEAgentStructuralEvidenceRef[];
    retrievalHints: {
        structureTools: string[];
        callContextAvailable: boolean;
        graphAvailable: boolean;
        stableKeyFormat: string;
        aliasPolicy: string;
    };
    budget: {
        includedUnits: number;
        totalUnits: number;
        omittedReason?: string;
    };
    progressSeed: IDEAgentAnalysisProgressSeed;
    meta: {
        compressionIndependent: true;
        builder: 'IDEAgentAnalysisPacketBuilder';
        source: 'project-intelligence-result' | 'project-snapshot';
    };
}
export interface IDEAgentAnalysisPacketBuilderOptions {
    profile?: IDEAgentAnalysisPacketProfile;
    generatedAt?: string;
    maxUnits?: number;
    projectRoot?: string;
}
export interface IDEAgentAnalysisPacketBuilderInput {
    result: ProjectAnalysisResult | ProjectSnapshot;
    options?: IDEAgentAnalysisPacketBuilderOptions;
}
export declare function buildIDEAgentAnalysisPacket({ result, options, }: IDEAgentAnalysisPacketBuilderInput): IDEAgentAnalysisPacket;
export declare function buildIDEAgentAnalysisPacketFromSnapshot(snapshot: ProjectSnapshot, options?: IDEAgentAnalysisPacketBuilderOptions & {
    source?: IDEAgentAnalysisPacket['meta']['source'];
}): IDEAgentAnalysisPacket;
export declare function createIDEAgentAnalysisUnitKey(input: IDEAgentStableUnitKeyInput): IDEAgentStableUnitKey;
export declare function createIDEAgentAnalysisUnitProgress(unit: Pick<IDEAgentAnalysisUnit, 'unitId' | 'dimensionId'>, overrides?: Partial<Omit<IDEAgentAnalysisUnitProgress, 'unitId'>>): IDEAgentAnalysisUnitProgress;
export declare function createIDEAgentAnalysisProgressSeed({ packetId, units, }: {
    packetId: string;
    units: readonly IDEAgentAnalysisUnit[];
}): IDEAgentAnalysisProgressSeed;
