export declare const PROJECT_SCOPE_CONTRACT_VERSION = 1;
export declare const PROJECT_SCOPE_STORAGE_KINDS: readonly ["ghost"];
export declare const PROJECT_SCOPE_FOLDER_ROLES: readonly ["primary-source", "source"];
export declare const PROJECT_SCOPE_FOLDER_STATES: readonly ["active"];
export declare const PROJECT_SCOPE_RESOLUTION_REASONS: readonly ["matched-folder", "folder-not-bound", "empty-scope"];
export declare const PROJECT_SCOPE_OPERATIONS: readonly ["project-scope.read", "project-folders.add", "project-folders.list", "project-folders.resolve"];
export declare const ALEMBIC_PROJECT_SCOPE_ENDPOINTS: {
    readonly addFolder: "/api/v1/project-scope/folders";
    readonly listFolders: "/api/v1/project-scope/folders";
    readonly readScope: "/api/v1/project-scope";
    readonly resolveFolder: "/api/v1/project-scope/resolve-folder";
};
export type ProjectScopeStorageKind = (typeof PROJECT_SCOPE_STORAGE_KINDS)[number];
export type ProjectScopeFolderRole = (typeof PROJECT_SCOPE_FOLDER_ROLES)[number];
export type ProjectScopeFolderState = (typeof PROJECT_SCOPE_FOLDER_STATES)[number];
export type ProjectScopeResolutionReason = (typeof PROJECT_SCOPE_RESOLUTION_REASONS)[number];
export type ProjectScopeOperation = (typeof PROJECT_SCOPE_OPERATIONS)[number];
export interface ProjectControlRoot {
    includedInFolders: false;
    kind: 'workspace-control-root';
    path: string;
}
export interface ProjectScopeStorage {
    dataRoot: string;
    dataRootSource: 'ghost-registry';
    kind: 'ghost';
    projectRootWriteAllowed: false;
    standardWriteAllowed: false;
}
export interface ProjectFolderDescriptor {
    addedAt: string | null;
    displayName: string;
    id: string;
    metadata: Record<string, unknown>;
    path: string;
    realpath: string | null;
    repositoryId: string | null;
    role: ProjectScopeFolderRole;
    state: 'active';
}
export interface ProjectDescriptor {
    contractVersion: typeof PROJECT_SCOPE_CONTRACT_VERSION;
    controlRoot: ProjectControlRoot;
    createdAt: string | null;
    currentFolderId: string | null;
    dataRoot: string;
    displayName: string;
    folders: ProjectFolderDescriptor[];
    metadata: Record<string, unknown>;
    projectId: string;
    projectScopeId: string;
    storage: ProjectScopeStorage;
    updatedAt: string | null;
}
export interface ProjectScopeFolderSummary {
    displayName: string;
    folderId: string;
    path: string;
    realpath: string | null;
    repositoryId: string | null;
    role: ProjectScopeFolderRole;
    state: 'active';
}
export interface ProjectScopeSummary {
    contractVersion: typeof PROJECT_SCOPE_CONTRACT_VERSION;
    controlRoot: string;
    controlRootIncludedInFolders: false;
    currentFolderId: string | null;
    currentFolderPath: string | null;
    dataRoot: string;
    dataRootSource: 'ghost-registry';
    displayName: string;
    folderCount: number;
    folders: ProjectScopeFolderSummary[];
    projectId: string;
    projectRootWriteAllowed: false;
    projectScopeId: string;
    standardWriteAllowed: false;
    storageKind: 'ghost';
}
export interface ProjectScopeResolution {
    controlRoot: ProjectControlRoot;
    currentFolder: ProjectFolderDescriptor | null;
    currentFolderId: string | null;
    dataRoot: string;
    folderPath: string;
    folderRealpath: string | null;
    matched: boolean;
    projectScope: ProjectDescriptor;
    projectScopeId: string;
    reason: ProjectScopeResolutionReason;
}
export interface ProjectScopeEndpointCapability {
    available: boolean;
    endpoints: typeof ALEMBIC_PROJECT_SCOPE_ENDPOINTS;
    projectRootWriteAllowed: false;
    storageKind: 'ghost';
    supportedOperations: ProjectScopeOperation[];
    supportsFolderDisable: false;
    supportsFolderRemove: false;
    supportsStandardStorage: false;
}
export interface ProjectScopeEvidenceRef {
    absolutePath: string | null;
    folderId: string | null;
    folderPath: string | null;
    projectScopeId: string;
    relativePath: string;
    sourceKind: 'artifact' | 'report' | 'source-file' | 'unknown';
}
export interface CanonicalSourceIdentity {
    absolutePath: string | null;
    folderDisplayName: string | null;
    folderId: string | null;
    folderPath: string | null;
    folderRelativeRoot: string | null;
    legacyPath: string;
    projectScopeId: string | null;
    qualifiedPath: string;
    relativePath: string;
}
export interface CanonicalSourceIdentityInput {
    folderDisplayName?: string | null;
    folderId?: string | null;
    folderPath?: string | null;
    projectRoot?: string | null;
    projectScopeId?: string | null;
    relativePath?: string | null;
    sourcePath: string;
}
export type ProjectScopeSourceRefResolutionStatus = 'resolved' | 'missing' | 'ambiguous';
export interface ProjectScopeSourceRefResolution {
    identity: CanonicalSourceIdentity | null;
    input: string;
    reason: string;
    status: ProjectScopeSourceRefResolutionStatus;
}
export interface ProjectScopeSourceRefIndex {
    ambiguousBasenames?: ReadonlySet<string>;
    ambiguousLegacyPaths: ReadonlySet<string>;
    byBasename?: ReadonlyMap<string, CanonicalSourceIdentity>;
    byLegacyPath: ReadonlyMap<string, CanonicalSourceIdentity>;
    byQualifiedPath: ReadonlyMap<string, CanonicalSourceIdentity>;
}
export type ProjectScopeSourceRefNormalizationStatus = 'active' | 'missing' | 'ambiguous';
export type ProjectScopeSourceRefNormalizationReason = 'qualified-path' | 'unique-legacy-path' | 'unique-basename' | 'ambiguous-legacy-path' | 'ambiguous-basename' | 'not-found';
export interface NormalizedProjectScopeSourceRef {
    absolutePath: string | null;
    folderDisplayName: string | null;
    folderId: string | null;
    folderPath: string | null;
    input: string;
    legacyPath: string | null;
    normalizedRef: string | null;
    projectScopeId: string | null;
    qualifiedPath: string | null;
    reason: ProjectScopeSourceRefNormalizationReason;
    relativePath: string | null;
    status: ProjectScopeSourceRefNormalizationStatus;
}
export interface ProjectScopeSourceRefNormalizationResult {
    activeSourceRefs: string[];
    normalized: NormalizedProjectScopeSourceRef[];
    rejected: NormalizedProjectScopeSourceRef[];
}
export interface ProjectScopeRegistryFolderIndexEntry {
    folderId: string;
    projectScopeId: string;
}
export interface ProjectScopeRegistryDocument {
    folderIndex: Record<string, ProjectScopeRegistryFolderIndexEntry>;
    scopes: Record<string, ProjectDescriptor>;
    version: typeof PROJECT_SCOPE_CONTRACT_VERSION;
}
export interface CreateProjectFolderDescriptorInput {
    addedAt?: string | null;
    displayName?: string | null;
    id?: string | null;
    metadata?: Record<string, unknown> | null;
    path: string;
    realpath?: string | null;
    repositoryId?: string | null;
    role?: ProjectScopeFolderRole | null;
}
export interface CreateProjectDescriptorInput {
    controlRoot: ProjectControlRoot | string;
    createdAt?: string | null;
    currentFolderId?: string | null;
    dataRoot?: string;
    displayName?: string | null;
    folders?: readonly (CreateProjectFolderDescriptorInput | ProjectFolderDescriptor)[];
    metadata?: Record<string, unknown> | null;
    projectId?: string | null;
    projectScopeId?: string | null;
    storage?: Partial<ProjectScopeStorage> & {
        kind?: unknown;
    };
    updatedAt?: string | null;
}
export declare function normalizeProjectScopePath(value: string, label?: string): string;
export declare function createProjectControlRoot(input: ProjectControlRoot | string): ProjectControlRoot;
export declare function createProjectFolderDescriptor(input: CreateProjectFolderDescriptorInput | ProjectFolderDescriptor): ProjectFolderDescriptor;
export declare function createProjectDescriptor(input: CreateProjectDescriptorInput): ProjectDescriptor;
export declare function addProjectScopeFolder(scope: ProjectDescriptor, folderInput: CreateProjectFolderDescriptorInput | ProjectFolderDescriptor, options?: {
    currentFolderId?: string | null;
    updatedAt?: string | null;
}): ProjectDescriptor;
export declare function listProjectScopeFolders(scope: ProjectDescriptor): ProjectFolderDescriptor[];
export declare function resolveProjectScopeForFolder(scope: ProjectDescriptor, folderPath: string, options?: {
    folderRealpath?: string | null;
}): ProjectScopeResolution;
export declare function summarizeProjectScopeDescriptor(scope: ProjectDescriptor, currentFolderId?: string | null): ProjectScopeSummary;
export declare function normalizeProjectScopeSummary(value: unknown): ProjectScopeSummary | null;
export declare function createProjectScopeEndpointCapability(options?: Partial<ProjectScopeEndpointCapability>): ProjectScopeEndpointCapability;
export declare function createProjectScopeEvidenceRef(input: {
    absolutePath?: string | null;
    folderId?: string | null;
    folderPath?: string | null;
    projectScopeId: string;
    relativePath: string;
    sourceKind?: ProjectScopeEvidenceRef['sourceKind'];
}): ProjectScopeEvidenceRef;
export declare function createProjectScopeSourceRef(input: {
    folderId?: string | null;
    folderPath?: string | null;
    projectScopeId: string;
    sourcePath: string;
}): ProjectScopeEvidenceRef;
export declare function createCanonicalSourceIdentity(input: CanonicalSourceIdentityInput): CanonicalSourceIdentity;
export declare function buildProjectScopeSourceRefIndex(identities: readonly CanonicalSourceIdentity[]): ProjectScopeSourceRefIndex;
export declare function resolveProjectScopeSourceRef(sourceRef: string, index: ProjectScopeSourceRefIndex): ProjectScopeSourceRefResolution;
export declare function normalizeProjectScopeSourceRef(sourceRef: string, index: ProjectScopeSourceRefIndex): NormalizedProjectScopeSourceRef;
export declare function normalizeProjectScopeSourceRefs(sourceRefs: readonly string[], index: ProjectScopeSourceRefIndex): ProjectScopeSourceRefNormalizationResult;
export declare function createProjectScopeRegistryDocument(scopes?: readonly ProjectDescriptor[]): ProjectScopeRegistryDocument;
export declare function upsertProjectScopeInRegistry(document: ProjectScopeRegistryDocument, scope: ProjectDescriptor): ProjectScopeRegistryDocument;
export declare function addProjectScopeFolderToRegistry(document: ProjectScopeRegistryDocument, projectScopeId: string, folderInput: CreateProjectFolderDescriptorInput | ProjectFolderDescriptor): ProjectScopeRegistryDocument;
export declare function resolveProjectScopeRegistryFolder(document: ProjectScopeRegistryDocument, folderPath: string): ProjectScopeResolution | null;
