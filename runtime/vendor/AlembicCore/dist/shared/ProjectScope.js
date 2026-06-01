import { createHash } from 'node:crypto';
import path from 'node:path';
export const PROJECT_SCOPE_CONTRACT_VERSION = 1;
export const PROJECT_SCOPE_STORAGE_KINDS = ['ghost'];
export const PROJECT_SCOPE_FOLDER_ROLES = ['primary-source', 'source'];
export const PROJECT_SCOPE_FOLDER_STATES = ['active'];
export const PROJECT_SCOPE_RESOLUTION_REASONS = [
    'matched-folder',
    'folder-not-bound',
    'empty-scope',
];
export const PROJECT_SCOPE_OPERATIONS = [
    'project-scope.read',
    'project-folders.add',
    'project-folders.list',
    'project-folders.resolve',
];
export const ALEMBIC_PROJECT_SCOPE_ENDPOINTS = {
    addFolder: '/api/v1/project-scope/folders',
    listFolders: '/api/v1/project-scope/folders',
    readScope: '/api/v1/project-scope',
    resolveFolder: '/api/v1/project-scope/resolve-folder',
};
export function normalizeProjectScopePath(value, label = 'path') {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`[ProjectScope] ${label} must be a non-empty string`);
    }
    return path.resolve(value);
}
export function createProjectControlRoot(input) {
    const rootPath = typeof input === 'string' ? input : input.path;
    return {
        includedInFolders: false,
        kind: 'workspace-control-root',
        path: normalizeProjectScopePath(rootPath, 'controlRoot.path'),
    };
}
export function createProjectFolderDescriptor(input) {
    const folderPath = normalizeProjectScopePath(input.path, 'folder.path');
    const role = normalizeProjectScopeFolderRole(input.role);
    const id = normalizeNullableString(input.id) ?? stableProjectScopeId('folder', folderPath);
    return {
        addedAt: normalizeNullableString(input.addedAt),
        displayName: normalizeNullableString(input.displayName) ?? path.basename(folderPath),
        id,
        metadata: cloneRecord(input.metadata),
        path: folderPath,
        realpath: normalizeNullableString(input.realpath),
        repositoryId: normalizeNullableString(input.repositoryId),
        role,
        state: 'active',
    };
}
export function createProjectDescriptor(input) {
    const controlRoot = createProjectControlRoot(input.controlRoot);
    const storage = normalizeProjectScopeStorage(input);
    const projectScopeId = normalizeNullableString(input.projectScopeId) ??
        stableProjectScopeId('project-scope', `${controlRoot.path}:${storage.dataRoot}`);
    const projectId = normalizeNullableString(input.projectId) ?? stableProjectScopeId('project', projectScopeId);
    const folders = normalizeProjectScopeFolders(input.folders ?? [], controlRoot.path);
    const currentFolderId = normalizeNullableString(input.currentFolderId) ?? folders.find(Boolean)?.id ?? null;
    assertKnownFolderId(folders, currentFolderId, 'currentFolderId');
    return {
        contractVersion: PROJECT_SCOPE_CONTRACT_VERSION,
        controlRoot,
        createdAt: normalizeNullableString(input.createdAt),
        currentFolderId,
        dataRoot: storage.dataRoot,
        displayName: normalizeNullableString(input.displayName) ?? path.basename(controlRoot.path),
        folders,
        metadata: cloneRecord(input.metadata),
        projectId,
        projectScopeId,
        storage,
        updatedAt: normalizeNullableString(input.updatedAt),
    };
}
export function addProjectScopeFolder(scope, folderInput, options = {}) {
    const folder = createProjectFolderDescriptor(folderInput);
    assertFolderCanEnterScope(scope.controlRoot.path, folder);
    const existingByPath = scope.folders.find((candidate) => pathsEquivalent(candidate.path, folder.path));
    const existingById = scope.folders.find((candidate) => candidate.id === folder.id);
    if (existingById && !pathsEquivalent(existingById.path, folder.path)) {
        throw new Error(`[ProjectScope] duplicate folder id points to another path: ${folder.id}`);
    }
    const folders = existingByPath
        ? scope.folders.map((candidate) => (candidate.id === existingByPath.id ? folder : candidate))
        : [...scope.folders, folder];
    const currentFolderId = normalizeNullableString(options.currentFolderId) ?? scope.currentFolderId ?? folder.id;
    assertKnownFolderId(folders, currentFolderId, 'currentFolderId');
    return {
        ...scope,
        currentFolderId,
        folders,
        updatedAt: normalizeNullableString(options.updatedAt) ?? scope.updatedAt,
    };
}
export function listProjectScopeFolders(scope) {
    return scope.folders.map((folder) => ({ ...folder, metadata: cloneRecord(folder.metadata) }));
}
export function resolveProjectScopeForFolder(scope, folderPath, options = {}) {
    const normalizedFolderPath = normalizeProjectScopePath(folderPath, 'folderPath');
    const normalizedRealpath = normalizeNullableString(options.folderRealpath);
    const currentFolder = findBestProjectScopeFolder(scope.folders, normalizedFolderPath, normalizedRealpath);
    return {
        controlRoot: scope.controlRoot,
        currentFolder,
        currentFolderId: currentFolder?.id ?? null,
        dataRoot: scope.dataRoot,
        folderPath: normalizedFolderPath,
        folderRealpath: normalizedRealpath,
        matched: currentFolder !== null,
        projectScope: scope,
        projectScopeId: scope.projectScopeId,
        reason: currentFolder
            ? 'matched-folder'
            : scope.folders.length === 0
                ? 'empty-scope'
                : 'folder-not-bound',
    };
}
export function summarizeProjectScopeDescriptor(scope, currentFolderId = scope.currentFolderId) {
    const currentFolder = currentFolderId
        ? (scope.folders.find((folder) => folder.id === currentFolderId) ?? null)
        : null;
    return {
        contractVersion: PROJECT_SCOPE_CONTRACT_VERSION,
        controlRoot: scope.controlRoot.path,
        controlRootIncludedInFolders: false,
        currentFolderId: currentFolder?.id ?? null,
        currentFolderPath: currentFolder?.path ?? null,
        dataRoot: scope.dataRoot,
        dataRootSource: 'ghost-registry',
        displayName: scope.displayName,
        folderCount: scope.folders.length,
        folders: scope.folders.map(projectFolderToSummary),
        projectId: scope.projectId,
        projectRootWriteAllowed: false,
        projectScopeId: scope.projectScopeId,
        standardWriteAllowed: false,
        storageKind: 'ghost',
    };
}
export function normalizeProjectScopeSummary(value) {
    const scope = asRecord(value);
    const projectScopeId = normalizeNullableString(scope?.projectScopeId);
    const projectId = normalizeNullableString(scope?.projectId);
    const dataRoot = normalizeNullableString(scope?.dataRoot);
    const controlRoot = normalizeNullableString(scope?.controlRoot);
    if (!projectScopeId || !projectId || !dataRoot || !controlRoot) {
        return null;
    }
    const folders = Array.isArray(scope?.folders)
        ? scope.folders.map(normalizeProjectScopeFolderSummary).filter(isProjectScopeFolderSummary)
        : [];
    const currentFolderId = normalizeNullableString(scope?.currentFolderId);
    const currentFolder = folders.find((folder) => folder.folderId === currentFolderId) ??
        folders.find((folder) => folder.path === normalizeNullableString(scope?.currentFolderPath)) ??
        null;
    return {
        contractVersion: PROJECT_SCOPE_CONTRACT_VERSION,
        controlRoot,
        controlRootIncludedInFolders: false,
        currentFolderId: currentFolder?.folderId ?? currentFolderId,
        currentFolderPath: currentFolder?.path ?? normalizeNullableString(scope?.currentFolderPath),
        dataRoot,
        dataRootSource: 'ghost-registry',
        displayName: normalizeNullableString(scope?.displayName) ?? path.basename(controlRoot),
        folderCount: folders.length,
        folders,
        projectId,
        projectRootWriteAllowed: false,
        projectScopeId,
        standardWriteAllowed: false,
        storageKind: 'ghost',
    };
}
export function createProjectScopeEndpointCapability(options = {}) {
    return {
        available: options.available ?? false,
        endpoints: ALEMBIC_PROJECT_SCOPE_ENDPOINTS,
        projectRootWriteAllowed: false,
        storageKind: 'ghost',
        supportedOperations: [...(options.supportedOperations ?? PROJECT_SCOPE_OPERATIONS)],
        supportsFolderDisable: false,
        supportsFolderRemove: false,
        supportsStandardStorage: false,
    };
}
export function createProjectScopeEvidenceRef(input) {
    return {
        absolutePath: normalizeNullableString(input.absolutePath),
        folderId: normalizeNullableString(input.folderId),
        folderPath: normalizeNullableString(input.folderPath),
        projectScopeId: input.projectScopeId,
        relativePath: input.relativePath,
        sourceKind: input.sourceKind ?? 'unknown',
    };
}
export function createProjectScopeSourceRef(input) {
    return createProjectScopeEvidenceRef({
        folderId: input.folderId,
        folderPath: input.folderPath,
        projectScopeId: input.projectScopeId,
        relativePath: input.sourcePath,
        sourceKind: 'source-file',
    });
}
export function createCanonicalSourceIdentity(input) {
    const sourcePath = normalizeSlashPath(input.sourcePath, 'sourcePath');
    const relativePath = normalizeSlashPath(input.relativePath ?? sourcePath, 'relativePath');
    const folderDisplayName = normalizeNullableString(input.folderDisplayName);
    const folderPath = normalizeNullableString(input.folderPath);
    const projectRoot = normalizeNullableString(input.projectRoot);
    const folderRelativeRoot = folderPath && projectRoot
        ? normalizeComparableSourcePath(path.relative(projectRoot, folderPath))
        : null;
    const qualifiedPath = folderDisplayName
        ? normalizeComparableSourcePath(`${folderDisplayName}/${relativePath}`)
        : relativePath;
    return {
        absolutePath: folderPath ? path.resolve(folderPath, relativePath) : null,
        folderDisplayName,
        folderId: normalizeNullableString(input.folderId),
        folderPath,
        folderRelativeRoot,
        legacyPath: relativePath,
        projectScopeId: normalizeNullableString(input.projectScopeId),
        qualifiedPath,
        relativePath,
    };
}
export function buildProjectScopeSourceRefIndex(identities) {
    const byQualifiedPath = new Map();
    const legacyBuckets = new Map();
    const basenameBuckets = new Map();
    for (const identity of identities) {
        byQualifiedPath.set(normalizeComparableSourcePath(identity.qualifiedPath), identity);
        const legacy = normalizeComparableSourcePath(identity.legacyPath);
        legacyBuckets.set(legacy, [...(legacyBuckets.get(legacy) ?? []), identity]);
        const basename = sourceRefBasename(legacy);
        if (basename) {
            basenameBuckets.set(basename, [...(basenameBuckets.get(basename) ?? []), identity]);
        }
    }
    const byLegacyPath = new Map();
    const ambiguousLegacyPaths = new Set();
    for (const [legacyPath, entries] of legacyBuckets) {
        const distinctQualifiedPaths = new Set(entries.map((entry) => entry.qualifiedPath));
        if (distinctQualifiedPaths.size === 1 && entries[0]) {
            byLegacyPath.set(legacyPath, entries[0]);
        }
        else {
            ambiguousLegacyPaths.add(legacyPath);
        }
    }
    const byBasename = new Map();
    const ambiguousBasenames = new Set();
    for (const [basename, entries] of basenameBuckets) {
        const distinctQualifiedPaths = new Set(entries.map((entry) => entry.qualifiedPath));
        if (distinctQualifiedPaths.size === 1 && entries[0]) {
            byBasename.set(basename, entries[0]);
        }
        else {
            ambiguousBasenames.add(basename);
        }
    }
    return { ambiguousBasenames, ambiguousLegacyPaths, byBasename, byLegacyPath, byQualifiedPath };
}
export function resolveProjectScopeSourceRef(sourceRef, index) {
    const normalized = normalizeComparableSourcePath(sourceRef);
    const qualified = index.byQualifiedPath.get(normalized);
    if (qualified) {
        return { identity: qualified, input: sourceRef, reason: 'qualified-path', status: 'resolved' };
    }
    if (index.ambiguousLegacyPaths.has(normalized)) {
        return {
            identity: null,
            input: sourceRef,
            reason: 'ambiguous-legacy-path',
            status: 'ambiguous',
        };
    }
    const legacy = index.byLegacyPath.get(normalized);
    if (legacy) {
        return { identity: legacy, input: sourceRef, reason: 'unique-legacy-path', status: 'resolved' };
    }
    return { identity: null, input: sourceRef, reason: 'not-found', status: 'missing' };
}
export function normalizeProjectScopeSourceRef(sourceRef, index) {
    const resolution = resolveProjectScopeSourceRef(sourceRef, index);
    if (resolution.status === 'resolved' && resolution.identity) {
        return normalizeResolvedProjectScopeSourceRef(sourceRef, resolution.identity, resolution.reason === 'qualified-path' ? 'qualified-path' : 'unique-legacy-path');
    }
    if (resolution.status === 'ambiguous') {
        return normalizeRejectedProjectScopeSourceRef(sourceRef, {
            reason: 'ambiguous-legacy-path',
            status: 'ambiguous',
        });
    }
    const normalized = normalizeComparableSourcePath(sourceRef);
    // basename alias 只接受无目录输入，避免把 `foo/database.ts` 误归到另一个仓库的同名文件。
    if (!normalized.includes('/')) {
        if (index.ambiguousBasenames?.has(normalized)) {
            return normalizeRejectedProjectScopeSourceRef(sourceRef, {
                reason: 'ambiguous-basename',
                status: 'ambiguous',
            });
        }
        const basename = index.byBasename?.get(normalized);
        if (basename) {
            return normalizeResolvedProjectScopeSourceRef(sourceRef, basename, 'unique-basename');
        }
    }
    return normalizeRejectedProjectScopeSourceRef(sourceRef, {
        reason: 'not-found',
        status: 'missing',
    });
}
export function normalizeProjectScopeSourceRefs(sourceRefs, index) {
    const normalized = sourceRefs.map((sourceRef) => normalizeProjectScopeSourceRef(sourceRef, index));
    const activeSourceRefs = Array.from(new Set(normalized
        .filter((sourceRef) => sourceRef.status === 'active' && sourceRef.normalizedRef)
        .map((sourceRef) => sourceRef.normalizedRef)));
    return {
        activeSourceRefs,
        normalized,
        rejected: normalized.filter((sourceRef) => sourceRef.status !== 'active'),
    };
}
export function createProjectScopeRegistryDocument(scopes = []) {
    return scopes.reduce((document, scope) => upsertProjectScopeInRegistry(document, scope), {
        folderIndex: {},
        scopes: {},
        version: PROJECT_SCOPE_CONTRACT_VERSION,
    });
}
export function upsertProjectScopeInRegistry(document, scope) {
    const nextDocument = {
        folderIndex: { ...document.folderIndex },
        scopes: { ...document.scopes, [scope.projectScopeId]: scope },
        version: PROJECT_SCOPE_CONTRACT_VERSION,
    };
    for (const folder of scope.folders) {
        nextDocument.folderIndex[folder.path] = {
            folderId: folder.id,
            projectScopeId: scope.projectScopeId,
        };
    }
    return nextDocument;
}
export function addProjectScopeFolderToRegistry(document, projectScopeId, folderInput) {
    const scope = document.scopes[projectScopeId];
    if (!scope) {
        throw new Error(`[ProjectScope] registry scope not found: ${projectScopeId}`);
    }
    return upsertProjectScopeInRegistry(document, addProjectScopeFolder(scope, folderInput));
}
export function resolveProjectScopeRegistryFolder(document, folderPath) {
    const normalizedPath = normalizeProjectScopePath(folderPath, 'folderPath');
    const scope = Object.values(document.scopes)
        .map((candidate) => ({
        resolution: resolveProjectScopeForFolder(candidate, normalizedPath),
        scope: candidate,
    }))
        .filter(({ resolution }) => resolution.matched)
        .sort((left, right) => (right.resolution.currentFolder?.path.length ?? 0) -
        (left.resolution.currentFolder?.path.length ?? 0))[0]?.scope;
    return scope ? resolveProjectScopeForFolder(scope, normalizedPath) : null;
}
function normalizeProjectScopeStorage(input) {
    const kind = input.storage?.kind ?? 'ghost';
    if (kind !== 'ghost') {
        throw new Error('[ProjectScope] new ProjectScope entries are Ghost-only; standard/project-root storage is not supported');
    }
    const dataRoot = normalizeProjectScopePath(input.storage?.dataRoot ?? input.dataRoot ?? '', 'dataRoot');
    return {
        dataRoot,
        dataRootSource: 'ghost-registry',
        kind: 'ghost',
        projectRootWriteAllowed: false,
        standardWriteAllowed: false,
    };
}
function normalizeProjectScopeFolders(inputs, controlRoot) {
    const folders = [];
    for (const input of inputs) {
        const folder = createProjectFolderDescriptor(input);
        assertFolderCanEnterScope(controlRoot, folder);
        const duplicate = folders.find((candidate) => candidate.id === folder.id || pathsEquivalent(candidate.path, folder.path));
        if (!duplicate) {
            folders.push(folder);
        }
    }
    return folders;
}
function assertFolderCanEnterScope(controlRoot, folder) {
    // controlRoot 是总控边界，不是源码 folder，避免把整个 workspace 当成扫描源。
    if (pathsEquivalent(controlRoot, folder.path) || pathsEquivalent(controlRoot, folder.realpath)) {
        throw new Error('[ProjectScope] controlRoot cannot be included in folders');
    }
}
function assertKnownFolderId(folders, folderId, label) {
    if (folderId && !folders.some((folder) => folder.id === folderId)) {
        throw new Error(`[ProjectScope] ${label} must point to a known folder`);
    }
}
function findBestProjectScopeFolder(folders, folderPath, folderRealpath) {
    return (folders
        .filter((folder) => isSameOrInsidePath(folderPath, folder.path) ||
        (folderRealpath !== null && isSameOrInsidePath(folderRealpath, folder.path)) ||
        (folder.realpath !== null && isSameOrInsidePath(folderPath, folder.realpath)) ||
        (folderRealpath !== null &&
            folder.realpath !== null &&
            isSameOrInsidePath(folderRealpath, folder.realpath)))
        .sort((left, right) => right.path.length - left.path.length)[0] ?? null);
}
function projectFolderToSummary(folder) {
    return {
        displayName: folder.displayName,
        folderId: folder.id,
        path: folder.path,
        realpath: folder.realpath,
        repositoryId: folder.repositoryId,
        role: folder.role,
        state: folder.state,
    };
}
function normalizeProjectScopeFolderSummary(value) {
    const folder = asRecord(value);
    const folderId = normalizeNullableString(folder?.folderId ?? folder?.id);
    const folderPath = normalizeNullableString(folder?.path);
    if (!folderId || !folderPath) {
        return null;
    }
    return {
        displayName: normalizeNullableString(folder?.displayName) ?? path.basename(folderPath),
        folderId,
        path: folderPath,
        realpath: normalizeNullableString(folder?.realpath),
        repositoryId: normalizeNullableString(folder?.repositoryId),
        role: normalizeProjectScopeFolderRole(folder?.role),
        state: 'active',
    };
}
function isProjectScopeFolderSummary(value) {
    return value !== null;
}
function normalizeProjectScopeFolderRole(value) {
    return PROJECT_SCOPE_FOLDER_ROLES.includes(value)
        ? value
        : 'source';
}
function stableProjectScopeId(prefix, value) {
    const hash = createHash('sha256').update(value).digest('hex').slice(0, 12);
    return `${prefix}-${hash}`;
}
function isSameOrInsidePath(candidatePath, rootPath) {
    const relativePath = path.relative(rootPath, candidatePath);
    return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));
}
function pathsEquivalent(left, right) {
    if (!left || !right) {
        return false;
    }
    return path.resolve(left) === path.resolve(right);
}
function normalizeSlashPath(value, label) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`[ProjectScope] ${label} must be a non-empty string`);
    }
    return normalizeComparableSourcePath(value);
}
function normalizeComparableSourcePath(value) {
    return value.trim().replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+/g, '/');
}
function sourceRefBasename(value) {
    const normalized = normalizeComparableSourcePath(value);
    const basename = path.posix.basename(normalized);
    return basename && basename !== '.' ? basename : null;
}
function normalizeResolvedProjectScopeSourceRef(input, identity, reason) {
    return {
        absolutePath: identity.absolutePath,
        folderDisplayName: identity.folderDisplayName,
        folderId: identity.folderId,
        folderPath: identity.folderPath,
        input,
        legacyPath: identity.legacyPath,
        normalizedRef: identity.qualifiedPath,
        projectScopeId: identity.projectScopeId,
        qualifiedPath: identity.qualifiedPath,
        reason,
        relativePath: identity.relativePath,
        status: 'active',
    };
}
function normalizeRejectedProjectScopeSourceRef(input, output) {
    return {
        absolutePath: null,
        folderDisplayName: null,
        folderId: null,
        folderPath: null,
        input,
        legacyPath: null,
        normalizedRef: null,
        projectScopeId: null,
        qualifiedPath: null,
        reason: output.reason,
        relativePath: null,
        status: output.status,
    };
}
function cloneRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : null;
}
function normalizeNullableString(value) {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
