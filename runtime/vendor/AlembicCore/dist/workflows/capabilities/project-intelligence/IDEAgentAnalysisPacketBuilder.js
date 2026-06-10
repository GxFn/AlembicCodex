import { isAbsolute, relative } from 'node:path';
import { computeContentHash } from '../../../shared/content-hash.js';
import { buildProjectSnapshot } from '../../../types/project-snapshot-builder.js';
const DEFAULT_MAX_UNITS = 12;
const STABLE_KEY_FORMAT = 'qualifiedSourceRef/folder identity + fqn + entityType + optional line/symbol';
export function buildIDEAgentAnalysisPacket({ result, options = {}, }) {
    const normalized = normalizeProjectIntelligence(result, options.projectRoot);
    return buildIDEAgentAnalysisPacketFromSnapshot(normalized.snapshot, {
        ...options,
        source: normalized.source,
    });
}
export function buildIDEAgentAnalysisPacketFromSnapshot(snapshot, options = {}) {
    const profile = options.profile ?? 'cold-start';
    const generatedAt = options.generatedAt ?? new Date().toISOString();
    const maxUnits = Math.max(1, options.maxUnits ?? DEFAULT_MAX_UNITS);
    const globalDegraded = inferGlobalDegraded(snapshot);
    const globalWarnings = inferGlobalWarnings(snapshot, globalDegraded);
    const candidates = collectSourceRefCandidates(snapshot);
    const dimensions = snapshot.activeDimensions.length
        ? [...snapshot.activeDimensions]
        : [{ id: 'project-overview', label: 'Project Overview' }];
    const totalUnits = dimensions.length;
    const selectedDimensions = dimensions.slice(0, maxUnits);
    const units = selectedDimensions.map((dimension, index) => buildAnalysisUnit({
        snapshot,
        dimension,
        index,
        candidates,
        globalDegraded,
        globalWarnings,
    }));
    const sourceRefs = dedupeSourceRefs(units.flatMap((unit) => unit.sourceRefs));
    const requiredReadSet = sortUnique(units.flatMap((unit) => unit.requiredReadSet));
    const structuralEvidenceRefs = dedupeEvidenceRefs(units.flatMap((unit) => unit.structuralEvidenceRefs));
    const packetIdentity = {
        profile,
        projectRoot: snapshot.projectRoot,
        dimensions: units.map((unit) => unit.dimensionId),
        requiredReadSet,
        structuralEvidenceRefs: structuralEvidenceRefs.map((ref) => ref.ref),
    };
    const packetId = `ide_packet_${stableHash(packetIdentity)}`;
    const progressSeed = createIDEAgentAnalysisProgressSeed({ packetId, units });
    return {
        packetId,
        projectRootHash: stableHash(snapshot.projectRoot),
        generatedAt,
        profile,
        projectSummary: {
            primaryLanguage: snapshot.language.primaryLang,
            fileCount: snapshot.allFiles.length,
            targetCount: snapshot.targetsSummary.length || snapshot.allTargets.length,
            materialization: buildMaterializationSummary(snapshot),
            degraded: globalDegraded,
            warnings: globalWarnings,
        },
        units,
        sourceRefs,
        requiredReadSet,
        structuralEvidenceRefs,
        retrievalHints: {
            structureTools: ['alembic_structure', 'alembic_graph', 'alembic_call_context'],
            callContextAvailable: Boolean(snapshot.callGraph && snapshot.callGraph.edgesCreated !== 0),
            graphAvailable: Boolean(snapshot.codeEntityGraph ||
                snapshot.callGraph ||
                (snapshot.dependencyGraph?.edges?.length ?? 0) > 0),
            stableKeyFormat: STABLE_KEY_FORMAT,
            aliasPolicy: 'shortAlias is display/search only and must not be used as the primary key',
        },
        budget: {
            includedUnits: units.length,
            totalUnits,
            ...(totalUnits > units.length
                ? { omittedReason: `maxUnits=${maxUnits} limited packet projection` }
                : {}),
        },
        progressSeed,
        meta: {
            compressionIndependent: true,
            builder: 'IDEAgentAnalysisPacketBuilder',
            source: options.source ?? 'project-snapshot',
        },
    };
}
export function createIDEAgentAnalysisUnitKey(input) {
    const sourceRef = normalizeComparablePath(input.sourceRef);
    const qualifiedPath = input.qualifiedPath
        ? normalizeComparablePath(input.qualifiedPath)
        : undefined;
    const symbol = input.symbol?.trim() || undefined;
    const fqn = input.fqn?.trim() || undefined;
    const shortAlias = createShortAlias({ fqn, symbol, sourceRef });
    return {
        sourceRef,
        ...(input.projectScopeId ? { projectScopeId: input.projectScopeId } : {}),
        ...(input.folderId ? { folderId: input.folderId } : {}),
        ...(qualifiedPath ? { qualifiedPath } : {}),
        ...(fqn ? { fqn } : {}),
        entityType: input.entityType,
        ...(typeof input.line === 'number' ? { line: input.line } : {}),
        ...(symbol ? { symbol } : {}),
        key: `ide_unit_${stableHash({
            sourceRef: qualifiedPath ?? sourceRef,
            projectScopeId: input.projectScopeId,
            folderId: input.folderId,
            fqn,
            entityType: input.entityType,
            line: input.line,
            symbol,
        })}`,
        ...(shortAlias ? { shortAlias } : {}),
    };
}
export function createIDEAgentAnalysisUnitProgress(unit, overrides = {}) {
    return {
        unitId: unit.unitId,
        status: overrides.status ?? 'pending',
        ...(overrides.claimedAt ? { claimedAt: overrides.claimedAt } : {}),
        ...(overrides.completedAt ? { completedAt: overrides.completedAt } : {}),
        submittedRecipeIds: [...(overrides.submittedRecipeIds ?? [])],
        referencedFiles: sortUnique(overrides.referencedFiles ?? []),
        rejectedReasons: [...(overrides.rejectedReasons ?? [])],
        ...(overrides.deviationReason ? { deviationReason: overrides.deviationReason } : {}),
        checkpoint: overrides.checkpoint ?? {
            dimensionId: unit.dimensionId,
            checkpointKind: 'dimension-checkpoint',
        },
    };
}
export function createIDEAgentAnalysisProgressSeed({ packetId, units, }) {
    const unitProgress = units.map((unit) => createIDEAgentAnalysisUnitProgress(unit));
    return {
        packetId,
        checkpointKind: 'ide-agent-analysis-unit-progress',
        totalUnits: units.length,
        remainingUnitIds: units.map((unit) => unit.unitId),
        unitProgress,
    };
}
function normalizeProjectIntelligence(result, projectRoot) {
    if (isProjectSnapshot(result)) {
        return { source: 'project-snapshot', snapshot: result };
    }
    return {
        source: 'project-intelligence-result',
        snapshot: buildProjectSnapshot({
            projectRoot: projectRoot ?? '',
            allFiles: result.allFiles,
            allTargets: result.allTargets,
            discoverer: result.discoverer,
            langStats: result.langStats,
            primaryLang: result.primaryLang,
            truncated: result.truncated,
            astProjectSummary: result.astProjectSummary,
            astContext: result.astContext,
            codeEntityResult: result.codeEntityResult,
            callGraphResult: result.callGraphResult,
            panoramaResult: result.panoramaResult,
            depGraphData: result.depGraphData,
            depEdgesWritten: result.depEdgesWritten,
            guardAudit: result.guardAudit,
            activeDimensions: result.activeDimensions,
            enhancementPackInfo: result.enhancementPackInfo,
            enhancementPatterns: result.enhancementPatterns,
            enhancementGuardRules: result.enhancementGuardRules,
            detectedFrameworks: result.detectedFrameworks,
            langProfile: result.langProfile,
            targetsSummary: result.targetsSummary,
            localPackageModules: result.localPackageModules,
            report: result.report,
            warnings: result.warnings,
            incrementalPlan: result.incrementalPlan,
            isEmpty: result.isEmpty,
        }),
    };
}
function isProjectSnapshot(input) {
    return 'version' in input && 'language' in input && 'dependencyGraph' in input;
}
function buildAnalysisUnit({ snapshot, dimension, index, candidates, globalDegraded, globalWarnings, }) {
    const dimensionCandidates = selectCandidatesForDimension(dimension.id, candidates);
    const fallbackCandidates = candidates.slice(0, 8);
    const selected = (dimensionCandidates.length ? dimensionCandidates : fallbackCandidates).slice(0, 8);
    const sourceRefs = dedupeSourceRefs(selected.map((candidate) => candidate.sourceRef));
    const requiredReadSet = sortUnique(sourceRefs.map(readableSourcePath));
    const structuralEvidenceRefs = dedupeEvidenceRefs(selected.map((candidate) => candidate.evidence));
    const representative = sourceRefs[0] ?? createFallbackSourceRef(snapshot);
    const key = createIDEAgentAnalysisUnitKey({
        sourceRef: sourceRefKey(representative),
        projectScopeId: representative.projectScopeId,
        folderId: representative.folderId,
        qualifiedPath: representative.qualifiedPath,
        fqn: representative.fqn,
        entityType: representative.entityType ?? 'dimension',
        line: representative.line,
        symbol: representative.symbol,
    });
    const degraded = dedupeDegraded([
        ...globalDegraded,
        ...(requiredReadSet.length === 0 ? ['empty-read-set'] : []),
    ]);
    const warnings = [
        ...globalWarnings,
        ...(requiredReadSet.length === 0
            ? [`${dimension.id}: no deterministic read set could be projected`]
            : []),
    ];
    const targetName = findTargetName(sourceRefs, snapshot.allFiles);
    const moduleName = findModuleName(sourceRefs, snapshot.localPackageModules);
    const priority = Math.max(1, 100 - index * 5 - degraded.length * 3);
    const structuralHints = buildStructuralHints(snapshot, dimension.id, selected);
    // 这里的完成契约只描述 Host Agent 需要证明什么，不决定提交/持久化策略。
    const completionContract = {
        minDistinctFiles: Math.min(2, Math.max(1, requiredReadSet.length)),
        mustReferenceAssignedSources: true,
        expectedEvidence: expectedEvidenceForDimension(dimension.id, structuralEvidenceRefs),
        allowNoRecipeWithReason: true,
    };
    return {
        unitId: `ide_unit_${stableHash({
            dimensionId: dimension.id,
            key: key.key,
            requiredReadSet,
            evidenceRefs: structuralEvidenceRefs.map((ref) => ref.ref),
        })}`,
        key,
        dimensionId: dimension.id,
        ...(targetName ? { targetName } : {}),
        ...(moduleName ? { moduleName } : {}),
        priority,
        reason: buildUnitReason(dimension, selected, degraded),
        sourceRefs,
        requiredReadSet,
        structuralEvidenceRefs,
        structuralHints,
        completionContract,
        degraded,
        warnings,
    };
}
function collectSourceRefCandidates(snapshot) {
    const sourceIdentityIndex = buildSourceIdentityIndex(snapshot.allFiles);
    const candidates = [
        ...collectAstCandidates(snapshot.projectRoot, snapshot.ast, sourceIdentityIndex),
        ...collectDependencyCandidates(snapshot.projectRoot, snapshot.dependencyGraph, sourceIdentityIndex),
        ...collectGuardCandidates(snapshot.projectRoot, snapshot.guardAudit, sourceIdentityIndex),
        ...collectModuleCandidates(snapshot.projectRoot, snapshot.localPackageModules, sourceIdentityIndex),
        ...collectFileCandidates(snapshot.projectRoot, snapshot.allFiles),
    ];
    return candidates.sort((a, b) => b.score - a.score ||
        readableSourcePath(a.sourceRef).localeCompare(readableSourcePath(b.sourceRef)) ||
        (a.sourceRef.symbol ?? '').localeCompare(b.sourceRef.symbol ?? ''));
}
function collectAstCandidates(projectRoot, ast, sourceIdentityIndex) {
    if (!ast) {
        return [];
    }
    const result = [];
    for (const cls of ast.classes ?? []) {
        const ref = sourceRefFromAstClass(projectRoot, cls, sourceIdentityIndex);
        if (!ref) {
            continue;
        }
        result.push(makeCandidate(ref, 'ast', `class:${ref.fqn ?? ref.symbol ?? ref.path}`, 100));
        for (const method of collectClassMethods(cls).slice(0, 4)) {
            const methodRef = sourceRefFromAstMethod(projectRoot, method, cls, sourceIdentityIndex);
            if (methodRef) {
                result.push(makeCandidate(methodRef, 'ast', `method:${methodRef.fqn ?? methodRef.symbol ?? methodRef.path}`, 94));
            }
        }
    }
    for (const protocol of ast.protocols ?? []) {
        const ref = sourceRefFromProtocol(projectRoot, protocol, sourceIdentityIndex);
        if (ref) {
            result.push(makeCandidate(ref, 'ast', `protocol:${ref.fqn ?? ref.symbol ?? ref.path}`, 86));
        }
    }
    return result;
}
function collectDependencyCandidates(projectRoot, dependencyGraph, sourceIdentityIndex) {
    return (dependencyGraph?.edges ?? [])
        .map((edge) => sourceRefFromDependencyEdge(projectRoot, edge, sourceIdentityIndex))
        .filter((candidate) => Boolean(candidate));
}
function collectGuardCandidates(projectRoot, guardAudit, sourceIdentityIndex) {
    const result = [];
    for (const file of guardAudit?.files ?? []) {
        for (const violation of file.violations ?? []) {
            const ref = makeSourceRef({
                projectRoot,
                path: file.filePath,
                line: violation.line,
                symbol: violation.ruleId,
                entityType: 'guard-violation',
                role: 'guard',
                displayName: violation.message ?? violation.ruleId ?? file.filePath,
                sourceIdentityIndex,
            });
            if (ref) {
                result.push(makeCandidate(ref, 'guard', `guard:${ref.path}:${violation.ruleId ?? ''}`, 78));
            }
        }
    }
    for (const violation of guardAudit?.crossFileViolations ?? []) {
        for (const location of violation.locations ?? []) {
            const ref = makeSourceRef({
                projectRoot,
                path: location.filePath,
                line: location.line ?? violation.line,
                symbol: violation.ruleId,
                entityType: 'guard-violation',
                role: 'guard',
                displayName: violation.message ?? violation.ruleId ?? location.filePath,
                sourceIdentityIndex,
            });
            if (ref) {
                result.push(makeCandidate(ref, 'guard', `guard:${ref.path}:${violation.ruleId ?? ''}`, 76));
            }
        }
    }
    return result;
}
function collectModuleCandidates(projectRoot, modules, sourceIdentityIndex) {
    return modules.flatMap((module) => (module.keyFiles ?? []).slice(0, 6).flatMap((filePath) => {
        const ref = makeSourceRef({
            projectRoot,
            path: filePath,
            symbol: module.name,
            entityType: 'module',
            role: 'module',
            displayName: module.packageName || module.name,
            sourceIdentityIndex,
        });
        return ref ? [makeCandidate(ref, 'module', `module:${module.name}:${ref.path}`, 72)] : [];
    }));
}
function collectFileCandidates(projectRoot, files) {
    return files.slice(0, 20).flatMap((file) => {
        const ref = makeSourceRef({
            projectRoot,
            path: file.relativePath || file.path,
            entityType: 'file',
            role: 'entry',
            displayName: file.name || file.relativePath || file.path,
            sourceIdentity: file.sourceIdentity,
        });
        return ref
            ? [makeCandidate(ref, 'file', `file:${ref.path}`, file.priority === 'high' ? 70 : 50)]
            : [];
    });
}
function makeCandidate(sourceRef, kind, ref, score) {
    return {
        sourceRef,
        evidence: {
            kind,
            ref: `${kind}:${stableHash(ref)}`,
            summary: describeSourceRef(sourceRef),
            sourceRefs: [sourceRef],
        },
        score,
    };
}
function sourceRefFromAstClass(projectRoot, cls, sourceIdentityIndex) {
    return makeSourceRef({
        projectRoot,
        path: cls.relativePath ?? cls.file,
        symbol: cls.name,
        fqn: cls.file || cls.relativePath ? `${cls.file ?? cls.relativePath}::${cls.name}` : cls.name,
        entityType: cls.kind ?? 'class',
        role: 'symbol',
        displayName: cls.name,
        sourceIdentityIndex,
    });
}
function sourceRefFromAstMethod(projectRoot, method, cls, sourceIdentityIndex) {
    const methodName = method.name;
    const className = method.className ?? cls.name;
    const path = method.file ?? cls.relativePath ?? cls.file;
    return makeSourceRef({
        projectRoot,
        path,
        line: method.line,
        symbol: methodName,
        fqn: path ? `${path}::${className}.${methodName}` : `${className}.${methodName}`,
        entityType: 'method',
        role: 'symbol',
        displayName: `${className}.${methodName}`,
        sourceIdentityIndex,
    });
}
function sourceRefFromProtocol(projectRoot, protocol, sourceIdentityIndex) {
    return makeSourceRef({
        projectRoot,
        path: protocol.relativePath ?? protocol.file,
        symbol: protocol.name,
        fqn: protocol.file || protocol.relativePath
            ? `${protocol.file ?? protocol.relativePath}::${protocol.name}`
            : protocol.name,
        entityType: 'protocol',
        role: 'symbol',
        displayName: protocol.name,
        sourceIdentityIndex,
    });
}
function sourceRefFromDependencyEdge(projectRoot, edge, sourceIdentityIndex) {
    const ref = makeSourceRef({
        projectRoot,
        path: pathLike(edge.from) ?? pathLike(edge.to),
        symbol: `${edge.from}->${edge.to}`,
        entityType: 'dependency-edge',
        role: 'dependency',
        displayName: `${edge.from} -> ${edge.to}`,
        sourceIdentityIndex,
    });
    if (!ref) {
        return null;
    }
    return makeCandidate(ref, 'dependency', `dependency:${edge.from}:${edge.to}:${edge.type ?? ''}`, 80);
}
function makeSourceRef({ projectRoot, path, line, symbol, fqn, entityType, role, displayName, sourceIdentity, sourceIdentityIndex, }) {
    const normalizedPath = normalizeProjectPath(path, projectRoot);
    if (!normalizedPath) {
        return null;
    }
    const identity = sourceIdentity ?? sourceIdentityIndex?.byComparablePath.get(normalizedPath);
    const alias = createShortAlias({ fqn, symbol, sourceRef: normalizedPath });
    return {
        path: normalizedPath,
        ...(identity?.projectScopeId ? { projectScopeId: identity.projectScopeId } : {}),
        ...(identity?.folderId ? { folderId: identity.folderId } : {}),
        ...(identity?.folderDisplayName ? { folderDisplayName: identity.folderDisplayName } : {}),
        ...(identity?.folderRelativeRoot ? { folderRelativeRoot: identity.folderRelativeRoot } : {}),
        ...(identity?.relativePath ? { relativePath: identity.relativePath } : {}),
        ...(identity?.qualifiedPath ? { qualifiedPath: identity.qualifiedPath } : {}),
        ...(typeof line === 'number' ? { line } : {}),
        ...(symbol ? { symbol } : {}),
        ...(fqn ? { fqn: normalizeFqn(fqn, projectRoot) } : {}),
        ...(entityType ? { entityType } : {}),
        ...(role ? { role } : {}),
        ...(displayName ? { displayName } : {}),
        ...(alias ? { alias } : {}),
    };
}
function collectClassMethods(cls) {
    return (cls.methods ?? []).flatMap((method) => {
        if (typeof method === 'string') {
            return [{ name: method, className: cls.name, file: cls.relativePath ?? cls.file }];
        }
        if (method && typeof method === 'object' && 'name' in method) {
            return [
                {
                    ...method,
                    className: method.className ?? cls.name,
                    file: method.file ?? cls.relativePath ?? cls.file,
                },
            ];
        }
        return [];
    });
}
function selectCandidatesForDimension(dimensionId, candidates) {
    const id = dimensionId.toLowerCase();
    const preferredKinds = preferredEvidenceKinds(id);
    const preferred = candidates.filter((candidate) => preferredKinds.has(candidate.evidence.kind));
    return (preferred.length ? preferred : candidates).slice(0, 12);
}
function preferredEvidenceKinds(dimensionId) {
    if (dimensionId.includes('architecture') || dimensionId.includes('module')) {
        return new Set(['dependency', 'module', 'ast', 'panorama']);
    }
    if (dimensionId.includes('flow') ||
        dimensionId.includes('event') ||
        dimensionId.includes('data') ||
        dimensionId.includes('call')) {
        return new Set(['callgraph', 'dependency', 'ast']);
    }
    if (dimensionId.includes('quality') ||
        dimensionId.includes('guard') ||
        dimensionId.includes('standard')) {
        return new Set(['guard', 'ast', 'file']);
    }
    return new Set(['ast', 'dependency', 'guard', 'module', 'file']);
}
function buildStructuralHints(snapshot, dimensionId, candidates) {
    const astHints = candidates
        .filter((candidate) => candidate.evidence.kind === 'ast')
        .map((candidate) => describeSourceRef(candidate.sourceRef))
        .slice(0, 8);
    const dependencyHints = (snapshot.dependencyGraph?.edges ?? []).slice(0, 8).map((edge) => ({
        from: edge.from,
        to: edge.to,
        relation: edge.type ?? 'depends-on',
    }));
    const guardHints = collectGuardHintText(snapshot.guardAudit).slice(0, 8);
    const panorama = collectPanoramaHints(snapshot.panorama).slice(0, 8);
    const aliases = sortUnique(candidates.flatMap((candidate) => candidate.sourceRef.alias ?? candidate.sourceRef.symbol ?? [])).slice(0, 8);
    const callGraphHint = snapshot.callGraph && snapshot.callGraph.edgesCreated !== undefined
        ? [`materialized call edges: ${snapshot.callGraph.edgesCreated}`]
        : [];
    return {
        ...(astHints.length ? { ast: astHints } : {}),
        ...(dependencyHints.length ? { dependencies: dependencyHints } : {}),
        ...(callGraphHint.length ? { callers: callGraphHint, callees: callGraphHint } : {}),
        ...(dimensionId.toLowerCase().includes('flow') && callGraphHint.length
            ? { dataFlowHints: callGraphHint }
            : {}),
        ...(guardHints.length ? { guardFindings: guardHints } : {}),
        ...(panorama.length ? { panorama } : {}),
        ...(aliases.length ? { aliases } : {}),
    };
}
function collectGuardHintText(guardAudit) {
    const local = (guardAudit?.files ?? []).flatMap((file) => (file.violations ?? []).map((violation) => describeGuardViolation(file.filePath, violation)));
    const cross = (guardAudit?.crossFileViolations ?? []).map((violation) => describeGuardViolation(violation.locations?.[0]?.filePath ?? 'cross-file', violation));
    return [...local, ...cross].filter(Boolean);
}
function describeGuardViolation(filePath, violation) {
    const rule = violation.ruleId ? `[${violation.ruleId}] ` : '';
    const line = typeof violation.line === 'number' ? `:${violation.line}` : '';
    return `${filePath}${line} ${rule}${violation.message ?? 'guard violation'}`;
}
function collectPanoramaHints(panorama) {
    return [
        ...collectPanoramaLayerHints(panorama),
        ...collectPanoramaCouplingHints(panorama),
        ...collectPanoramaCycleHints(panorama),
    ];
}
// 兼容两类 Panorama 输入：ProjectSnapshot 归一化数组，以及 PanoramaService 原始 layers.levels / modules Map。
function collectPanoramaLayerHints(panorama) {
    const rawLayers = panorama?.layers;
    const layers = Array.isArray(rawLayers)
        ? rawLayers
        : isRecord(rawLayers) && Array.isArray(rawLayers.levels)
            ? rawLayers.levels
            : [];
    return layers.filter(isRecord).map((layer) => {
        const level = typeof layer.level === 'number' ? layer.level : 0;
        const name = typeof layer.name === 'string' ? layer.name : `Layer ${level}`;
        const modules = Array.isArray(layer.modules) ? layer.modules.map(String) : [];
        return `L${level} ${name}: ${modules.join(', ')}`;
    });
}
function collectPanoramaCouplingHints(panorama) {
    const normalizedHotspots = (panorama?.couplingHotspots ?? []).map((hotspot) => `${hotspot.module} fanIn=${hotspot.fanIn} fanOut=${hotspot.fanOut}`);
    const rawModules = panorama?.modules;
    const moduleValues = rawModules instanceof Map
        ? [...rawModules.values()]
        : isRecord(rawModules)
            ? Object.values(rawModules)
            : [];
    const rawHotspots = moduleValues
        .filter(isRecord)
        .filter((mod) => (readNumber(mod.fanIn) ?? 0) >= 10 || (readNumber(mod.fanOut) ?? 0) >= 10)
        .map((mod) => {
        const name = typeof mod.name === 'string' ? mod.name : '';
        return `${name} fanIn=${readNumber(mod.fanIn) ?? 0} fanOut=${readNumber(mod.fanOut) ?? 0}`;
    });
    return [...normalizedHotspots, ...rawHotspots];
}
function collectPanoramaCycleHints(panorama) {
    const normalizedCycles = (panorama?.cyclicDependencies ?? []).map((cycle) => `${cycle.severity}: ${cycle.cycle.join(' -> ')}`);
    const rawCycles = panorama?.cycles;
    const rawCycleHints = Array.isArray(rawCycles)
        ? rawCycles.filter(isRecord).map((cycle) => {
            const severity = typeof cycle.severity === 'string' ? cycle.severity : 'cycle';
            const modules = Array.isArray(cycle.modules)
                ? cycle.modules.map(String)
                : Array.isArray(cycle.cycle)
                    ? cycle.cycle.map(String)
                    : [];
            return `${severity}: ${modules.join(' -> ')}`;
        })
        : [];
    return [...normalizedCycles, ...rawCycleHints];
}
function isRecord(value) {
    return Boolean(value && typeof value === 'object');
}
function readNumber(value) {
    return typeof value === 'number' ? value : null;
}
function buildMaterializationSummary(snapshot) {
    return {
        ast: Boolean(snapshot.ast),
        codeEntityGraph: Boolean(snapshot.codeEntityGraph),
        callGraph: Boolean(snapshot.callGraph),
        callGraphEdges: snapshot.callGraph?.edgesCreated ?? 0,
        dependencyGraph: Boolean(snapshot.dependencyGraph),
        dependencyEdges: snapshot.dependencyGraph?.edges?.length ?? 0,
        depEdgesWritten: snapshot.depEdgesWritten,
        guardAudit: Boolean(snapshot.guardAudit),
        panorama: Boolean(snapshot.panorama),
        truncated: snapshot.truncated,
    };
}
function inferGlobalDegraded(snapshot) {
    const reasons = [];
    if (!snapshot.ast) {
        reasons.push('ast-unavailable');
    }
    if (matchesWarning(snapshot.warnings, ['ast', 'partial', 'failed', 'degraded'])) {
        reasons.push('ast-partial');
    }
    if (!snapshot.callGraph) {
        reasons.push('callgraph-unavailable');
    }
    if (matchesWarning(snapshot.warnings, ['call graph', 'callgraph', 'partial', 'failed'])) {
        reasons.push(snapshot.callGraph ? 'callgraph-partial' : 'callgraph-unavailable');
    }
    if (!snapshot.dependencyGraph) {
        reasons.push('depgraph-unavailable');
    }
    if (!snapshot.guardAudit) {
        reasons.push('guard-unavailable');
    }
    if (!snapshot.panorama) {
        reasons.push('panorama-unavailable');
    }
    return dedupeDegraded(reasons);
}
function inferGlobalWarnings(snapshot, degraded) {
    return sortUnique([
        ...snapshot.warnings,
        ...degraded.map((reason) => `IDE analysis packet degraded: ${reason}`),
    ]);
}
function matchesWarning(warnings, tokens) {
    return warnings.some((warning) => {
        const lower = warning.toLowerCase();
        return tokens.some((token) => lower.includes(token));
    });
}
function expectedEvidenceForDimension(dimensionId, evidenceRefs) {
    const kinds = sortUnique(evidenceRefs.map((ref) => ref.kind));
    const expected = ['reasoning.sources intersects unit.requiredReadSet'];
    if (kinds.length) {
        expected.push(`structural evidence: ${kinds.join(', ')}`);
    }
    if (dimensionId.includes('flow')) {
        expected.push('call/data-flow relationship or explicit deviation reason');
    }
    return expected;
}
function buildUnitReason(dimension, candidates, degraded) {
    const label = dimension.label ?? dimension.id;
    const evidenceKinds = sortUnique(candidates.map((candidate) => candidate.evidence.kind));
    const evidenceText = evidenceKinds.length ? evidenceKinds.join(', ') : 'file fallback';
    const degradedText = degraded.length ? `; degraded=${degraded.join(',')}` : '';
    return `${label}: read assigned ${evidenceText} evidence before producing or rejecting Recipe${degradedText}`;
}
function createFallbackSourceRef(snapshot) {
    const first = snapshot.allFiles[0];
    const identity = first?.sourceIdentity;
    return {
        path: first?.relativePath || first?.path || 'project',
        ...(identity?.projectScopeId ? { projectScopeId: identity.projectScopeId } : {}),
        ...(identity?.folderId ? { folderId: identity.folderId } : {}),
        ...(identity?.folderDisplayName ? { folderDisplayName: identity.folderDisplayName } : {}),
        ...(identity?.folderRelativeRoot ? { folderRelativeRoot: identity.folderRelativeRoot } : {}),
        ...(identity?.relativePath ? { relativePath: identity.relativePath } : {}),
        ...(identity?.qualifiedPath ? { qualifiedPath: identity.qualifiedPath } : {}),
        entityType: 'project',
        role: 'entry',
        displayName: snapshot.projectRoot ? 'Project overview' : 'Project',
        alias: 'Project',
    };
}
function findTargetName(sourceRefs, files) {
    const paths = new Set(sourceRefs.flatMap(sourceRefComparablePaths));
    return (files.find((file) => [file.relativePath, file.path, file.sourceIdentity?.qualifiedPath].some((candidate) => candidate && paths.has(normalizeComparablePath(candidate))))?.targetName || undefined);
}
function findModuleName(sourceRefs, modules) {
    const paths = new Set(sourceRefs.flatMap(sourceRefComparablePaths));
    return modules.find((module) => [
        ...(module.keyFiles ?? []),
        ...(module.keyFileIdentities ?? []).flatMap((identity) => [
            identity.relativePath,
            identity.qualifiedPath,
        ]),
    ].some((candidate) => paths.has(normalizeComparablePath(candidate))))?.name;
}
function buildSourceIdentityIndex(files) {
    const byComparablePath = new Map();
    for (const file of files) {
        const identity = file.sourceIdentity;
        if (!identity) {
            continue;
        }
        for (const candidate of [
            file.relativePath,
            file.path,
            identity.relativePath,
            identity.qualifiedPath,
        ]) {
            if (candidate) {
                byComparablePath.set(normalizeComparablePath(candidate), identity);
            }
        }
    }
    return { byComparablePath };
}
function readableSourcePath(sourceRef) {
    return sourceRef.qualifiedPath ?? sourceRef.path;
}
function sourceRefComparablePaths(sourceRef) {
    return [sourceRef.path, sourceRef.relativePath, sourceRef.qualifiedPath]
        .filter((candidate) => Boolean(candidate))
        .map(normalizeComparablePath);
}
function normalizeProjectPath(pathValue, projectRoot) {
    if (!pathValue || !pathValue.trim()) {
        return null;
    }
    const withoutLine = pathValue.trim().replace(/\\/g, '/');
    const normalized = isAbsolute(withoutLine)
        ? relative(projectRoot || '/', withoutLine).replace(/\\/g, '/')
        : withoutLine;
    return normalizeComparablePath(normalized);
}
function normalizeFqn(fqn, projectRoot) {
    const [filePart, symbolPart] = fqn.split('::');
    if (!symbolPart) {
        return fqn;
    }
    const normalizedPath = normalizeProjectPath(filePart, projectRoot) ?? filePart;
    return `${normalizedPath}::${symbolPart}`;
}
function normalizeComparablePath(pathValue) {
    return pathValue.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/');
}
function pathLike(value) {
    return value.includes('/') || /\.[a-z0-9]+$/i.test(value) ? value : undefined;
}
function sourceRefKey(sourceRef) {
    const pathValue = readableSourcePath(sourceRef);
    return `${pathValue}${typeof sourceRef.line === 'number' ? `:${sourceRef.line}` : ''}`;
}
function describeSourceRef(sourceRef) {
    const line = typeof sourceRef.line === 'number' ? `:${sourceRef.line}` : '';
    const symbol = sourceRef.symbol ? ` ${sourceRef.symbol}` : '';
    return `${readableSourcePath(sourceRef)}${line}${symbol}`.trim();
}
function createShortAlias({ fqn, symbol, sourceRef, }) {
    if (symbol) {
        return symbol.split('.').filter(Boolean).pop();
    }
    if (fqn) {
        return fqn.split('::').pop()?.split('.').filter(Boolean).pop();
    }
    return sourceRef.split('/').filter(Boolean).pop();
}
function dedupeSourceRefs(sourceRefs) {
    const map = new Map();
    for (const ref of sourceRefs) {
        const key = stableHash({
            path: ref.path,
            qualifiedPath: ref.qualifiedPath,
            projectScopeId: ref.projectScopeId,
            folderId: ref.folderId,
            line: ref.line,
            symbol: ref.symbol,
            fqn: ref.fqn,
            entityType: ref.entityType,
            role: ref.role,
        });
        if (!map.has(key)) {
            map.set(key, ref);
        }
    }
    return [...map.values()].sort((a, b) => readableSourcePath(a).localeCompare(readableSourcePath(b)) ||
        (a.line ?? 0) - (b.line ?? 0) ||
        (a.symbol ?? '').localeCompare(b.symbol ?? ''));
}
function dedupeEvidenceRefs(refs) {
    const map = new Map();
    for (const ref of refs) {
        if (!map.has(ref.ref)) {
            map.set(ref.ref, ref);
        }
    }
    return [...map.values()].sort((a, b) => a.ref.localeCompare(b.ref));
}
function dedupeDegraded(reasons) {
    return [...new Set(reasons)].sort();
}
function sortUnique(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}
function stableHash(value) {
    return computeContentHash(stableStringify(value));
}
function stableStringify(value) {
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    if (value && typeof value === 'object') {
        const entries = Object.entries(value)
            .filter(([, item]) => item !== undefined)
            .sort(([a], [b]) => a.localeCompare(b));
        return `{${entries
            .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
            .join(',')}}`;
    }
    return JSON.stringify(value);
}
