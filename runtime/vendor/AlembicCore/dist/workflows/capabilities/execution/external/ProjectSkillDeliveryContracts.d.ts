export declare const PROJECT_SKILL_DELIVERY_CONTRACT_VERSION = 1;
export declare const PROJECT_SKILL_DELIVERY_ROUTES: readonly ["alembic", "plugin"];
export declare const PROJECT_SKILL_ASSET_KINDS: readonly ["project-skill", "skill-directory", "skill-file", "skill-index", "delivery-receipt"];
export declare const PROJECT_SKILL_RUNTIME_EXPORT_STRATEGIES: readonly ["symlink-first", "copy", "none"];
export declare const PROJECT_SKILL_RUNTIME_EXPORT_STATUSES: readonly ["not-requested", "pending", "exported", "skipped", "blocked", "failed"];
export declare const PROJECT_SKILL_LINK_MODES: readonly ["symlink", "copy", "none"];
export declare const PROJECT_SKILL_AUTHORIZATION_STATUSES: readonly ["unknown", "pending", "granted", "denied", "not-required"];
export declare const PROJECT_SKILL_CONFLICT_STATUSES: readonly ["none", "compatible-existing", "different-existing", "target-missing", "blocked"];
export type ProjectSkillDeliveryRoute = (typeof PROJECT_SKILL_DELIVERY_ROUTES)[number];
export type ProjectSkillAssetKind = (typeof PROJECT_SKILL_ASSET_KINDS)[number];
export type ProjectSkillRuntimeExportStrategy = (typeof PROJECT_SKILL_RUNTIME_EXPORT_STRATEGIES)[number];
export type ProjectSkillRuntimeExportStatus = (typeof PROJECT_SKILL_RUNTIME_EXPORT_STATUSES)[number];
export type ProjectSkillLinkMode = (typeof PROJECT_SKILL_LINK_MODES)[number];
export type ProjectSkillAuthorizationStatus = (typeof PROJECT_SKILL_AUTHORIZATION_STATUSES)[number];
export type ProjectSkillConflictStatus = (typeof PROJECT_SKILL_CONFLICT_STATUSES)[number];
export type ProjectSkillDeliveryValidationIssue = 'invalid-receipt-shape' | 'authorization-scope-missing' | 'runtime-export-scope-missing' | 'managed-marker-identity-missing';
export interface ProjectSkillDeliveryEvidenceRef {
    dimensionId: string | null;
    kind: string;
    label: string | null;
    ref: string;
    targetName: string | null;
}
export interface ProjectSkillDeliveryAsset {
    artifactRefs: ProjectSkillDeliveryEvidenceRef[];
    contentHash: string | null;
    description: string | null;
    dimensionId: string | null;
    kind: ProjectSkillAssetKind;
    path: string;
    skillName: string;
    targetName: string | null;
}
export interface ProjectSkillDeliveryAuthorization {
    codexSkillRoot: string | null;
    grantedBy: string | null;
    message: string | null;
    projectScopeId: string | null;
    required: boolean;
    status: ProjectSkillAuthorizationStatus;
}
export interface ProjectSkillRuntimeExportReceipt {
    authorizationStatus: ProjectSkillAuthorizationStatus;
    codexSkillRoot: string | null;
    conflictStatus: ProjectSkillConflictStatus;
    linkMode: ProjectSkillLinkMode;
    message: string | null;
    projectScopeId: string | null;
    refreshRequired: boolean;
    status: ProjectSkillRuntimeExportStatus;
    strategy: ProjectSkillRuntimeExportStrategy;
    targetPath: string | null;
    targetRoot: string | null;
}
export interface ProjectSkillManagedMarker {
    contractVersion: typeof PROJECT_SKILL_DELIVERY_CONTRACT_VERSION;
    generatedSkillId: string | null;
    generationHash: string | null;
    managedBy: 'alembic';
    markerPath: string | null;
    projectId: string | null;
    projectRoot: string;
    projectScopeId: string | null;
    route: ProjectSkillDeliveryRoute;
    skillName: string;
    sourcePath: string;
}
export interface ProjectSkillDeliveryShoutSummary {
    delivered: boolean;
    message: string;
    runtimeVisible: boolean;
    skillName: string;
    title: string;
    trigger: string | null;
}
export interface ProjectSkillDeliveryReceipt {
    asset: ProjectSkillDeliveryAsset;
    authorization: ProjectSkillDeliveryAuthorization;
    conflictStatus: ProjectSkillConflictStatus;
    contractVersion: typeof PROJECT_SKILL_DELIVERY_CONTRACT_VERSION;
    createdAt: string;
    dimensionId: string | null;
    evidenceRefs: ProjectSkillDeliveryEvidenceRef[];
    id: string;
    managedMarker: ProjectSkillManagedMarker | null;
    projectId: string | null;
    projectRoot: string;
    projectScopeId: string | null;
    route: ProjectSkillDeliveryRoute;
    runtimeExport: ProjectSkillRuntimeExportReceipt;
    shoutSummary: ProjectSkillDeliveryShoutSummary;
    skillName: string;
    targetName: string | null;
}
export interface ProjectSkillDeliveryValidationResult {
    issues: ProjectSkillDeliveryValidationIssue[];
    ok: boolean;
    receipt: ProjectSkillDeliveryReceipt | null;
}
export interface CreateProjectSkillDeliveryReceiptInput {
    asset: {
        artifactRefs?: readonly unknown[];
        contentHash?: string | null;
        description?: string | null;
        dimensionId?: string | null;
        kind?: ProjectSkillAssetKind;
        path: string;
        skillName?: string | null;
        targetName?: string | null;
    };
    authorization?: Partial<ProjectSkillDeliveryAuthorization> | null;
    conflictStatus?: ProjectSkillConflictStatus | null;
    codexSkillRoot?: string | null;
    createdAt: string;
    dimensionId?: string | null;
    evidenceRefs?: readonly unknown[];
    id: string;
    managedMarker?: Partial<ProjectSkillManagedMarker> | null;
    projectId?: string | null;
    projectRoot: string;
    projectScopeId?: string | null;
    route: ProjectSkillDeliveryRoute;
    runtimeExport?: Partial<ProjectSkillRuntimeExportReceipt> | null;
    shoutSummary?: Partial<ProjectSkillDeliveryShoutSummary> | null;
    skillName: string;
    targetName?: string | null;
}
export type CreateRouteProjectSkillDeliveryReceiptInput = Omit<CreateProjectSkillDeliveryReceiptInput, 'route'>;
export declare function createProjectSkillDeliveryReceipt(input: CreateProjectSkillDeliveryReceiptInput): ProjectSkillDeliveryReceipt;
export declare function createAlembicProjectSkillDeliveryReceipt(input: CreateRouteProjectSkillDeliveryReceiptInput): ProjectSkillDeliveryReceipt;
export declare function createPluginProjectSkillDeliveryReceipt(input: CreateRouteProjectSkillDeliveryReceiptInput): ProjectSkillDeliveryReceipt;
export declare function normalizeProjectSkillDeliveryReceipt(value: unknown): ProjectSkillDeliveryReceipt | null;
export declare function isProjectSkillDeliveryReceipt(value: unknown): value is ProjectSkillDeliveryReceipt;
export declare function validateProjectSkillDeliveryReceipt(value: unknown): ProjectSkillDeliveryValidationResult;
export declare function createProjectSkillDeliveryEvidenceRef(value: unknown): ProjectSkillDeliveryEvidenceRef | null;
export declare function summarizeProjectSkillDeliveryReceipt(receipt: ProjectSkillDeliveryReceipt): string;
export declare function normalizeProjectSkillDeliveryRoute(value: unknown): ProjectSkillDeliveryRoute | null;
export declare function normalizeProjectSkillAssetKind(value: unknown): ProjectSkillAssetKind | null;
export declare function normalizeProjectSkillRuntimeExportStrategy(value: unknown): ProjectSkillRuntimeExportStrategy | null;
export declare function normalizeProjectSkillRuntimeExportStatus(value: unknown): ProjectSkillRuntimeExportStatus | null;
export declare function normalizeProjectSkillLinkMode(value: unknown): ProjectSkillLinkMode | null;
export declare function normalizeProjectSkillAuthorizationStatus(value: unknown): ProjectSkillAuthorizationStatus | null;
export declare function normalizeProjectSkillConflictStatus(value: unknown): ProjectSkillConflictStatus | null;
