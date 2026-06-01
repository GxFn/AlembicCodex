export const PROJECT_SKILL_DELIVERY_CONTRACT_VERSION = 1;
export const PROJECT_SKILL_DELIVERY_ROUTES = ['alembic', 'plugin'];
export const PROJECT_SKILL_ASSET_KINDS = [
    'project-skill',
    'skill-directory',
    'skill-file',
    'skill-index',
    'delivery-receipt',
];
export const PROJECT_SKILL_RUNTIME_EXPORT_STRATEGIES = ['symlink-first', 'copy', 'none'];
export const PROJECT_SKILL_RUNTIME_EXPORT_STATUSES = [
    'not-requested',
    'pending',
    'exported',
    'skipped',
    'blocked',
    'failed',
];
export const PROJECT_SKILL_LINK_MODES = ['symlink', 'copy', 'none'];
export const PROJECT_SKILL_AUTHORIZATION_STATUSES = [
    'unknown',
    'pending',
    'granted',
    'denied',
    'not-required',
];
export const PROJECT_SKILL_CONFLICT_STATUSES = [
    'none',
    'compatible-existing',
    'different-existing',
    'target-missing',
    'blocked',
];
export function createProjectSkillDeliveryReceipt(input) {
    const dimensionId = input.dimensionId ?? input.asset.dimensionId ?? null;
    const targetName = input.targetName ?? input.asset.targetName ?? null;
    const projectScopeId = input.projectScopeId ??
        input.authorization?.projectScopeId ??
        input.runtimeExport?.projectScopeId ??
        input.managedMarker?.projectScopeId ??
        null;
    const codexSkillRoot = input.codexSkillRoot ??
        input.authorization?.codexSkillRoot ??
        input.runtimeExport?.codexSkillRoot ??
        null;
    const conflictStatus = input.conflictStatus ?? input.runtimeExport?.conflictStatus ?? 'none';
    const authorization = createProjectSkillDeliveryAuthorization(input.authorization, {
        codexSkillRoot,
        projectScopeId,
    });
    const asset = createProjectSkillDeliveryAsset(input.asset, {
        dimensionId,
        skillName: input.skillName,
        targetName,
    });
    const runtimeExport = createProjectSkillRuntimeExportReceipt(input.runtimeExport, {
        authorizationStatus: authorization.status,
        codexSkillRoot,
        conflictStatus,
        projectScopeId,
    });
    const receipt = {
        asset,
        authorization,
        conflictStatus,
        contractVersion: PROJECT_SKILL_DELIVERY_CONTRACT_VERSION,
        createdAt: input.createdAt,
        dimensionId,
        evidenceRefs: normalizeProjectSkillDeliveryEvidenceRefs(input.evidenceRefs),
        id: input.id,
        managedMarker: input.managedMarker
            ? createProjectSkillManagedMarker(input.managedMarker, {
                projectId: input.projectId ?? null,
                projectRoot: input.projectRoot,
                projectScopeId,
                route: input.route,
                skillName: input.skillName,
                generationHash: asset.contentHash,
                sourcePath: asset.path,
            })
            : null,
        projectId: input.projectId ?? null,
        projectRoot: input.projectRoot,
        projectScopeId,
        route: input.route,
        runtimeExport,
        shoutSummary: createProjectSkillDeliveryShoutSummary(input.shoutSummary, {
            runtimeExport,
            skillName: input.skillName,
        }),
        skillName: input.skillName,
        targetName,
    };
    return receipt;
}
export function createAlembicProjectSkillDeliveryReceipt(input) {
    return createProjectSkillDeliveryReceipt({ ...input, route: 'alembic' });
}
export function createPluginProjectSkillDeliveryReceipt(input) {
    return createProjectSkillDeliveryReceipt({ ...input, route: 'plugin' });
}
export function normalizeProjectSkillDeliveryReceipt(value) {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    const asset = asRecord(record.asset);
    const createdAt = nonEmptyString(record.createdAt);
    const id = nonEmptyString(record.id);
    const projectRoot = nonEmptyString(record.projectRoot);
    const route = normalizeProjectSkillDeliveryRoute(record.route);
    const skillName = nonEmptyString(record.skillName);
    const assetPath = nonEmptyString(asset?.path);
    const contractVersion = record.contractVersion === undefined
        ? PROJECT_SKILL_DELIVERY_CONTRACT_VERSION
        : numberOrNull(record.contractVersion);
    if (contractVersion !== PROJECT_SKILL_DELIVERY_CONTRACT_VERSION ||
        !createdAt ||
        !id ||
        !projectRoot ||
        !route ||
        !skillName ||
        !assetPath) {
        return null;
    }
    return createProjectSkillDeliveryReceipt({
        asset: {
            artifactRefs: Array.isArray(asset?.artifactRefs) ? asset.artifactRefs : [],
            contentHash: nullableString(asset?.contentHash),
            description: nullableString(asset?.description),
            dimensionId: nullableString(asset?.dimensionId),
            kind: normalizeProjectSkillAssetKind(asset?.kind) ?? undefined,
            path: assetPath,
            skillName: nullableString(asset?.skillName),
            targetName: nullableString(asset?.targetName),
        },
        authorization: normalizeProjectSkillDeliveryAuthorization(record.authorization),
        conflictStatus: normalizeProjectSkillConflictStatus(record.conflictStatus),
        codexSkillRoot: firstString(asRecord(record.authorization)?.codexSkillRoot, asRecord(record.runtimeExport)?.codexSkillRoot),
        createdAt,
        dimensionId: nullableString(record.dimensionId),
        evidenceRefs: Array.isArray(record.evidenceRefs) ? record.evidenceRefs : [],
        id,
        managedMarker: normalizeProjectSkillManagedMarkerInput(record.managedMarker),
        projectId: nullableString(record.projectId),
        projectRoot,
        projectScopeId: firstString(record.projectScopeId, asRecord(record.authorization)?.projectScopeId, asRecord(record.runtimeExport)?.projectScopeId, asRecord(record.managedMarker)?.projectScopeId),
        route,
        runtimeExport: normalizeProjectSkillRuntimeExportReceipt(record.runtimeExport),
        shoutSummary: normalizeProjectSkillDeliveryShoutSummary(record.shoutSummary),
        skillName,
        targetName: nullableString(record.targetName),
    });
}
export function isProjectSkillDeliveryReceipt(value) {
    return normalizeProjectSkillDeliveryReceipt(value) !== null;
}
export function validateProjectSkillDeliveryReceipt(value) {
    const receipt = normalizeProjectSkillDeliveryReceipt(value);
    if (!receipt) {
        return {
            issues: ['invalid-receipt-shape'],
            ok: false,
            receipt: null,
        };
    }
    const issues = [];
    if (receipt.authorization.required &&
        receipt.authorization.status === 'granted' &&
        (!receipt.authorization.projectScopeId || !receipt.authorization.codexSkillRoot)) {
        issues.push('authorization-scope-missing');
    }
    if (receipt.runtimeExport.status === 'exported' &&
        (!receipt.runtimeExport.projectScopeId || !receipt.runtimeExport.codexSkillRoot)) {
        issues.push('runtime-export-scope-missing');
    }
    if (receipt.managedMarker &&
        (!receipt.managedMarker.generatedSkillId ||
            !receipt.managedMarker.generationHash ||
            !receipt.managedMarker.projectScopeId)) {
        issues.push('managed-marker-identity-missing');
    }
    return {
        issues,
        ok: issues.length === 0,
        receipt,
    };
}
export function createProjectSkillDeliveryEvidenceRef(value) {
    const directRef = nonEmptyString(value);
    if (directRef) {
        return {
            dimensionId: null,
            kind: 'artifact',
            label: null,
            ref: directRef,
            targetName: null,
        };
    }
    const record = asRecord(value);
    const ref = nonEmptyString(record?.ref) ?? nonEmptyString(record?.path) ?? nonEmptyString(record?.url);
    if (!ref) {
        return null;
    }
    return {
        dimensionId: nullableString(record?.dimensionId),
        kind: nonEmptyString(record?.kind) ?? 'artifact',
        label: nullableString(record?.label),
        ref,
        targetName: nullableString(record?.targetName),
    };
}
export function summarizeProjectSkillDeliveryReceipt(receipt) {
    return receipt.shoutSummary.message;
}
export function normalizeProjectSkillDeliveryRoute(value) {
    return isLiteral(value, PROJECT_SKILL_DELIVERY_ROUTES) ? value : null;
}
export function normalizeProjectSkillAssetKind(value) {
    return isLiteral(value, PROJECT_SKILL_ASSET_KINDS) ? value : null;
}
export function normalizeProjectSkillRuntimeExportStrategy(value) {
    return isLiteral(value, PROJECT_SKILL_RUNTIME_EXPORT_STRATEGIES) ? value : null;
}
export function normalizeProjectSkillRuntimeExportStatus(value) {
    return isLiteral(value, PROJECT_SKILL_RUNTIME_EXPORT_STATUSES) ? value : null;
}
export function normalizeProjectSkillLinkMode(value) {
    return isLiteral(value, PROJECT_SKILL_LINK_MODES) ? value : null;
}
export function normalizeProjectSkillAuthorizationStatus(value) {
    return isLiteral(value, PROJECT_SKILL_AUTHORIZATION_STATUSES) ? value : null;
}
export function normalizeProjectSkillConflictStatus(value) {
    return isLiteral(value, PROJECT_SKILL_CONFLICT_STATUSES) ? value : null;
}
function createProjectSkillDeliveryAsset(asset, defaults) {
    return {
        artifactRefs: normalizeProjectSkillDeliveryEvidenceRefs(asset.artifactRefs),
        contentHash: asset.contentHash ?? null,
        description: asset.description ?? null,
        dimensionId: asset.dimensionId ?? defaults.dimensionId,
        kind: asset.kind ?? 'project-skill',
        path: asset.path,
        skillName: asset.skillName ?? defaults.skillName,
        targetName: asset.targetName ?? defaults.targetName,
    };
}
function createProjectSkillDeliveryAuthorization(value, defaults) {
    return {
        codexSkillRoot: value?.codexSkillRoot ?? defaults.codexSkillRoot,
        grantedBy: value?.grantedBy ?? null,
        message: value?.message ?? null,
        projectScopeId: value?.projectScopeId ?? defaults.projectScopeId,
        required: value?.required ?? true,
        status: value?.status ?? 'unknown',
    };
}
function createProjectSkillRuntimeExportReceipt(value, defaults) {
    const status = value?.status ?? 'not-requested';
    return {
        authorizationStatus: value?.authorizationStatus ?? defaults.authorizationStatus,
        codexSkillRoot: value?.codexSkillRoot ?? defaults.codexSkillRoot,
        conflictStatus: value?.conflictStatus ?? defaults.conflictStatus,
        linkMode: value?.linkMode ?? 'none',
        message: value?.message ?? null,
        projectScopeId: value?.projectScopeId ?? defaults.projectScopeId,
        refreshRequired: value?.refreshRequired ?? status === 'exported',
        status,
        strategy: value?.strategy ?? 'symlink-first',
        targetPath: value?.targetPath ?? null,
        targetRoot: value?.targetRoot ?? null,
    };
}
function createProjectSkillManagedMarker(marker, defaults) {
    // marker 只描述“谁管理了导出的项目 Skill”，实际写入与覆盖判断由 Alembic/Plugin 完成。
    return {
        contractVersion: PROJECT_SKILL_DELIVERY_CONTRACT_VERSION,
        generatedSkillId: marker.generatedSkillId ?? defaults.skillName,
        generationHash: marker.generationHash ?? defaults.generationHash,
        managedBy: 'alembic',
        markerPath: marker.markerPath ?? null,
        projectId: marker.projectId ?? defaults.projectId,
        projectRoot: marker.projectRoot ?? defaults.projectRoot,
        projectScopeId: marker.projectScopeId ?? defaults.projectScopeId,
        route: marker.route ?? defaults.route,
        skillName: marker.skillName ?? defaults.skillName,
        sourcePath: marker.sourcePath ?? defaults.sourcePath,
    };
}
function createProjectSkillDeliveryShoutSummary(value, defaults) {
    const runtimeVisible = defaults.runtimeExport.status === 'exported';
    return {
        delivered: value?.delivered ?? runtimeVisible,
        message: value?.message ??
            (runtimeVisible
                ? `Project Skill ${defaults.skillName} exported to Codex runtime.`
                : `Project Skill ${defaults.skillName} is available in Alembic receipt.`),
        runtimeVisible: value?.runtimeVisible ?? runtimeVisible,
        skillName: value?.skillName ?? defaults.skillName,
        title: value?.title ?? 'Project Skill delivery',
        trigger: value?.trigger ?? null,
    };
}
function normalizeProjectSkillDeliveryAuthorization(value) {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    return {
        codexSkillRoot: nullableString(record.codexSkillRoot),
        grantedBy: nullableString(record.grantedBy),
        message: nullableString(record.message),
        projectScopeId: nullableString(record.projectScopeId),
        required: booleanOrUndefined(record.required),
        status: normalizeProjectSkillAuthorizationStatus(record.status) ?? undefined,
    };
}
function normalizeProjectSkillRuntimeExportReceipt(value) {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    return {
        authorizationStatus: normalizeProjectSkillAuthorizationStatus(record.authorizationStatus) ?? undefined,
        codexSkillRoot: nullableString(record.codexSkillRoot),
        conflictStatus: normalizeProjectSkillConflictStatus(record.conflictStatus) ?? undefined,
        linkMode: normalizeProjectSkillLinkMode(record.linkMode) ?? undefined,
        message: nullableString(record.message),
        projectScopeId: nullableString(record.projectScopeId),
        refreshRequired: booleanOrUndefined(record.refreshRequired),
        status: normalizeProjectSkillRuntimeExportStatus(record.status) ?? undefined,
        strategy: normalizeProjectSkillRuntimeExportStrategy(record.strategy) ?? undefined,
        targetPath: nullableString(record.targetPath),
        targetRoot: nullableString(record.targetRoot),
    };
}
function normalizeProjectSkillManagedMarkerInput(value) {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    const route = normalizeProjectSkillDeliveryRoute(record.route);
    return {
        generatedSkillId: nullableString(record.generatedSkillId),
        generationHash: nullableString(record.generationHash),
        markerPath: nullableString(record.markerPath),
        projectId: nullableString(record.projectId),
        projectRoot: nullableString(record.projectRoot) ?? undefined,
        projectScopeId: nullableString(record.projectScopeId),
        route: route ?? undefined,
        skillName: nullableString(record.skillName) ?? undefined,
        sourcePath: nullableString(record.sourcePath) ?? undefined,
    };
}
function normalizeProjectSkillDeliveryShoutSummary(value) {
    const record = asRecord(value);
    if (!record) {
        return null;
    }
    return {
        delivered: booleanOrUndefined(record.delivered),
        message: nullableString(record.message) ?? undefined,
        runtimeVisible: booleanOrUndefined(record.runtimeVisible),
        skillName: nullableString(record.skillName) ?? undefined,
        title: nullableString(record.title) ?? undefined,
        trigger: nullableString(record.trigger),
    };
}
function normalizeProjectSkillDeliveryEvidenceRefs(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) => createProjectSkillDeliveryEvidenceRef(item))
        .filter((item) => item !== null);
}
function isLiteral(value, allowed) {
    return typeof value === 'string' && allowed.includes(value);
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function nonEmptyString(value) {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
function nullableString(value) {
    return typeof value === 'string' ? value : null;
}
function firstString(...values) {
    for (const value of values) {
        const normalized = nullableString(value);
        if (normalized !== null) {
            return normalized;
        }
    }
    return null;
}
function booleanOrUndefined(value) {
    return typeof value === 'boolean' ? value : undefined;
}
function numberOrNull(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
