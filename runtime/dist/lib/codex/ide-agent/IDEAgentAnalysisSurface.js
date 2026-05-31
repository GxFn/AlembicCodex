const DEFAULT_NEXT_UNITS = 5;
export function buildIDEAgentAnalysisSurface(packet, options = {}) {
    const progress = mergeProgress(packet.progressSeed.unitProgress, options.progressOverrides ?? []);
    const remainingUnitIds = progress
        .filter((unit) => unit.status === 'pending' || unit.status === 'claimed')
        .map((unit) => unit.unitId);
    const nextUnitSet = new Set(remainingUnitIds);
    const maxNextUnits = normalizePositiveInt(options.maxNextUnits, DEFAULT_NEXT_UNITS);
    return {
        packetSummary: {
            budget: packet.budget,
            generatedAt: packet.generatedAt,
            packetId: packet.packetId,
            profile: packet.profile,
            projectRootHash: packet.projectRootHash,
            projectSummary: packet.projectSummary,
            unitCountsByDimension: countUnitsByDimension(packet.units),
        },
        nextUnits: packet.units
            .filter((unit) => nextUnitSet.has(unit.unitId))
            .slice(0, maxNextUnits)
            .map(projectUnitSurface),
        retrieval: {
            requiredReadSet: packet.requiredReadSet,
            retrievalHints: packet.retrievalHints,
            sourceRefs: packet.sourceRefs,
            structuralEvidenceRefs: packet.structuralEvidenceRefs,
        },
        progress: {
            checkpointKind: packet.progressSeed.checkpointKind,
            packetId: packet.packetId,
            totalUnits: packet.progressSeed.totalUnits,
            remainingUnitIds,
            statusCounts: countProgressStatuses(progress),
            unitProgress: progress,
        },
    };
}
export function buildIDEAgentAnalysisProgressBackfill(input) {
    const completedUnitIds = uniqueStrings(input.analysisUnitIds);
    const skippedUnitIds = uniqueStrings(input.skippedAnalysisUnitIds);
    const rejectedUnitIds = uniqueStrings(input.rejectedAnalysisUnitIds);
    const remainingUnitIds = uniqueStrings(input.remainingAnalysisUnitIds);
    const now = new Date().toISOString();
    const baseCheckpoint = {
        checkpointKind: 'dimension-checkpoint',
        dimensionId: input.dimensionId,
        sessionId: input.sessionId,
        updatedAt: now,
    };
    // Plugin 只回填宿主执行状态，不重建 Core 的 AST/callgraph/sourceRefs 投影。
    const unitProgress = [
        ...completedUnitIds.map((unitId) => ({
            unitId,
            status: 'completed',
            completedAt: now,
            submittedRecipeIds: [],
            referencedFiles: [],
            rejectedReasons: [],
            checkpoint: baseCheckpoint,
        })),
        ...skippedUnitIds.map((unitId) => ({
            unitId,
            status: 'skipped',
            completedAt: now,
            submittedRecipeIds: [],
            referencedFiles: [],
            rejectedReasons: [],
            deviationReason: input.deviationReason,
            checkpoint: baseCheckpoint,
        })),
        ...rejectedUnitIds.map((unitId) => ({
            unitId,
            status: 'rejected',
            completedAt: now,
            submittedRecipeIds: [],
            referencedFiles: [],
            rejectedReasons: input.deviationReason ? [input.deviationReason] : [],
            deviationReason: input.deviationReason,
            checkpoint: baseCheckpoint,
        })),
        ...remainingUnitIds.map((unitId) => ({
            unitId,
            status: 'pending',
            submittedRecipeIds: [],
            referencedFiles: [],
            rejectedReasons: [],
            checkpoint: baseCheckpoint,
        })),
    ];
    return {
        checkpointKind: 'ide-agent-analysis-unit-progress',
        completedUnitIds,
        skippedUnitIds,
        rejectedUnitIds,
        remainingUnitIds,
        ...(input.deviationReason ? { deviationReason: input.deviationReason } : {}),
        unitProgress,
    };
}
function mergeProgress(seed, overrides) {
    const byUnit = new Map();
    for (const unit of seed) {
        byUnit.set(unit.unitId, { ...unit });
    }
    for (const unit of overrides) {
        byUnit.set(unit.unitId, { ...byUnit.get(unit.unitId), ...unit });
    }
    return [...byUnit.values()];
}
function projectUnitSurface(unit) {
    return {
        unitId: unit.unitId,
        dimensionId: unit.dimensionId,
        targetName: unit.targetName,
        moduleName: unit.moduleName,
        priority: unit.priority,
        reason: unit.reason,
        sourceRefs: unit.sourceRefs,
        requiredReadSet: unit.requiredReadSet,
        completionContract: unit.completionContract,
        degraded: unit.degraded,
        warnings: unit.warnings,
    };
}
function countUnitsByDimension(units) {
    const counts = {};
    for (const unit of units) {
        counts[unit.dimensionId] = (counts[unit.dimensionId] ?? 0) + 1;
    }
    return counts;
}
function countProgressStatuses(units) {
    const counts = {
        blocked: 0,
        claimed: 0,
        completed: 0,
        pending: 0,
        rejected: 0,
        skipped: 0,
    };
    for (const unit of units) {
        counts[unit.status] += 1;
    }
    return counts;
}
function normalizePositiveInt(value, fallback) {
    if (!Number.isFinite(value) || !value || value <= 0) {
        return fallback;
    }
    return Math.floor(value);
}
function uniqueStrings(values) {
    return [...new Set((values ?? []).filter((value) => value.trim().length > 0))];
}
