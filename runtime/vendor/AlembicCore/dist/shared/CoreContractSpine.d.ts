import type { CoreFieldClass, CoreFieldPolicy, CoreFieldPolicySummary, CoreFieldPolicyValidationResult } from './FieldTaxonomy.js';
export declare const CORE_CONTRACT_SPINE_VERSION = 1;
export declare const CORE_CONTRACT_SPINE_ROW_IDS: readonly ["I01", "I03", "I04", "I05", "I06", "I07", "I08", "I21", "I23"];
export declare const CORE_CONTRACT_SPINE_FORBIDDEN_RESPONSIBILITIES: readonly ["codex-mcp", "dashboard-ui-state", "ai-provider-runtime", "cli-daemon-runtime", "agent-tool-execution", "tool-execution"];
export declare const CORE_LEGACY_CONVERGENCE_CANDIDATE_IDS: readonly ["D9-C01", "D9-C02", "D9-C03", "D9-C04"];
export type CoreContractSpineRowId = (typeof CORE_CONTRACT_SPINE_ROW_IDS)[number];
export type CoreContractSpineForbiddenResponsibility = (typeof CORE_CONTRACT_SPINE_FORBIDDEN_RESPONSIBILITIES)[number];
export type CoreLegacyContractConvergenceCandidateId = (typeof CORE_LEGACY_CONVERGENCE_CANDIDATE_IDS)[number];
export type CoreLegacyContractConvergenceStatus = 'deleted' | 'preserved-with-owner' | 'rewritten' | 'already-solved' | 'blocked';
export type CoreContractFunctionClass = 'package-export' | 'rest-query' | 'rest-command' | 'event-stream' | 'job-artifact' | 'diagnostic-observability';
export type CoreContractRole = 'package-producer' | 'shared-schema-source' | 'shared-source-contract';
export interface CoreContractSpineRow {
    artifactPolicy: string;
    capabilityCoverage: readonly string[];
    capabilityDiscovery: readonly string[];
    consumers: readonly string[];
    coreRole: CoreContractRole;
    currentCompatibilityOwner: readonly string[];
    driftGate: string;
    errorKinds: readonly string[];
    exposureClasses: readonly CoreFieldClass[];
    fixturePolicy: string;
    functionClass: CoreContractFunctionClass;
    id: CoreContractSpineRowId;
    observabilityKeys: readonly string[];
    removalBlocker: string;
    requiredExportPaths: readonly string[];
    sourceFiles: readonly string[];
    title: string;
    validationCommands: readonly string[];
}
export interface CoreContractSpineValidationIssue {
    code: 'missing-row' | 'unexpected-row' | 'missing-export' | 'missing-source-file' | 'missing-contract-field';
    message: string;
    path: string;
    rowId?: CoreContractSpineRowId | string;
}
export interface CoreContractSpineValidationResult {
    issues: CoreContractSpineValidationIssue[];
    rowCount: number;
    valid: boolean;
    version: typeof CORE_CONTRACT_SPINE_VERSION;
}
export interface ValidateCoreContractSpineOptions {
    expectedRowIds?: readonly CoreContractSpineRowId[];
    packageExports?: readonly string[];
    sourceFiles?: readonly string[];
}
export interface CoreContractSpineSummary {
    coreRoles: Record<CoreContractRole, number>;
    functionClasses: Record<CoreContractFunctionClass, number>;
    rowIds: CoreContractSpineRowId[];
    version: typeof CORE_CONTRACT_SPINE_VERSION;
}
export interface CoreContractSpineFieldPolicy extends CoreFieldPolicy {
    rowId: CoreContractSpineRowId;
}
export interface CoreContractSpineFieldPolicyValidationResult extends CoreFieldPolicyValidationResult {
    version: typeof CORE_CONTRACT_SPINE_VERSION;
}
export interface CoreContractSpineFieldPolicySummary extends CoreFieldPolicySummary {
    rowIds: CoreContractSpineRowId[];
    version: typeof CORE_CONTRACT_SPINE_VERSION;
}
export interface CoreLegacyContractConvergenceCandidate {
    cleanupBlocker: string;
    currentCompatibilityOwner: readonly string[];
    currentConsumers: readonly string[];
    decisionRationale: string;
    id: CoreLegacyContractConvergenceCandidateId;
    legacySurface: string;
    publicExposurePolicy: string;
    registryRows: readonly CoreContractSpineRowId[];
    removalTrigger: string;
    replacementContract: string;
    requiredExportPaths: readonly string[];
    sourceFiles: readonly string[];
    status: CoreLegacyContractConvergenceStatus;
    validationCommands: readonly string[];
}
export interface CoreLegacyContractConvergenceValidationIssue {
    candidateId?: CoreLegacyContractConvergenceCandidateId | string;
    code: 'missing-candidate' | 'unexpected-candidate' | 'missing-export' | 'missing-source-file' | 'missing-convergence-field' | 'deleted-candidate-has-active-consumer';
    message: string;
    path: string;
}
export interface CoreLegacyContractConvergenceValidationResult {
    candidateCount: number;
    issues: CoreLegacyContractConvergenceValidationIssue[];
    valid: boolean;
    version: typeof CORE_CONTRACT_SPINE_VERSION;
}
export interface ValidateCoreLegacyContractConvergenceOptions {
    activeLegacyConsumerRefs?: readonly CoreLegacyContractConvergenceCandidateId[];
    expectedCandidateIds?: readonly CoreLegacyContractConvergenceCandidateId[];
    packageExports?: readonly string[];
    sourceFiles?: readonly string[];
}
export interface CoreLegacyContractConvergenceSummary {
    candidateIds: CoreLegacyContractConvergenceCandidateId[];
    deletedCandidateIds: CoreLegacyContractConvergenceCandidateId[];
    preservedCandidateIds: CoreLegacyContractConvergenceCandidateId[];
    statuses: Record<CoreLegacyContractConvergenceStatus, number>;
    version: typeof CORE_CONTRACT_SPINE_VERSION;
}
export declare const CORE_CONTRACT_SPINE_ROWS: readonly [{
    readonly artifactPolicy: "Inline export summary; generated declarations and large diffs by artifactRef.";
    readonly capabilityCoverage: readonly ["public subpath import success", "missing subpath/type failure"];
    readonly capabilityDiscovery: readonly ["package export map", "consumer import scan"];
    readonly consumers: readonly ["Alembic", "AlembicPlugin", "AlembicAgent"];
    readonly coreRole: "package-producer";
    readonly currentCompatibilityOwner: readonly ["Alembic", "AlembicPlugin", "AlembicAgent"];
    readonly driftGate: "Export map/API inventory diff plus consumer import-boundary lint.";
    readonly errorKinds: readonly ["capability-mismatch", "not-found", "internal-build-error"];
    readonly exposureClasses: readonly ["public", "consumer-needed", "diagnostic"];
    readonly fixturePolicy: "Core public import smoke fixtures and consumer builds.";
    readonly functionClass: "package-export";
    readonly id: "I01";
    readonly observabilityKeys: readonly ["packageName", "subpath", "consumerRepo", "importFile", "checkCommand"];
    readonly removalBlocker: "No subpath removal before import scans prove no consumer or replacement path is connected.";
    readonly requiredExportPaths: readonly [".", "./daemon", "./guard", "./shared"];
    readonly sourceFiles: readonly ["package.json", "src/index.ts", "src/daemon/index.ts", "src/shared/index.ts"];
    readonly title: "Core public package boundary";
    readonly validationCommands: readonly ["npm run build:check", "npm run smoke:public-api", "npm run lint:public-api-boundary"];
}, {
    readonly artifactPolicy: "Inline compact health summary; logs and state snapshots by detailRef.";
    readonly capabilityCoverage: readonly ["ready", "unavailable", "partial", "stale runtime"];
    readonly capabilityDiscovery: readonly ["health response capabilities object"];
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Plugin resident service", "Dashboard runtime header"];
    readonly driftGate: "Core runtime fixture compared with provider route and consumer normalizers.";
    readonly errorKinds: readonly ["unavailable", "capability-mismatch", "not-found", "internal-error"];
    readonly exposureClasses: readonly ["public", "consumer-needed", "diagnostic", "internal"];
    readonly fixturePolicy: "Alembic route fixtures derive from Core runtime contracts.";
    readonly functionClass: "rest-query";
    readonly id: "I03";
    readonly observabilityKeys: readonly ["mode", "route", "projectId", "projectScopeId", "dataRootSource"];
    readonly removalBlocker: "Consumers discover runtime support through the health route.";
    readonly requiredExportPaths: readonly ["./daemon"];
    readonly sourceFiles: readonly ["src/daemon/RuntimeContracts.ts"];
    readonly title: "Runtime health and capability discovery";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Inline state summary; diagnostics and logs by detailRef.";
    readonly capabilityCoverage: readonly ["list", "status", "current", "select", "start", "stop", "switch"];
    readonly capabilityDiscovery: readonly ["runtime health", "projects route summary"];
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Dashboard project runtime selector", "Plugin dashboard handoff"];
    readonly driftGate: "Route fixture plus Dashboard source-of-truth normalization test.";
    readonly errorKinds: readonly ["unavailable", "conflict", "permission-denied", "timeout", "cancelled"];
    readonly exposureClasses: readonly ["consumer-needed", "diagnostic", "internal"];
    readonly fixturePolicy: "Provider route fixtures and Dashboard project runtime samples.";
    readonly functionClass: "rest-command";
    readonly id: "I04";
    readonly observabilityKeys: readonly ["projectId", "projectRoot", "reasonCode", "blockingCondition"];
    readonly removalBlocker: "Runtime switch/open-dashboard workflows depend on this contract.";
    readonly requiredExportPaths: readonly ["./daemon"];
    readonly sourceFiles: readonly ["src/daemon/ProjectRuntimeContracts.ts"];
    readonly title: "Project runtime control";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Inline summary; registry snapshots by artifactRef.";
    readonly capabilityCoverage: readonly ["empty scope", "folder list", "add folder", "resolve folder"];
    readonly capabilityDiscovery: readonly ["runtime health projectScope capability", "project-scope route capability"];
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Dashboard ProjectScopePanel", "Plugin project-scoped tools"];
    readonly driftGate: "Core ProjectScope fixture against Dashboard normalizer and Plugin client.";
    readonly errorKinds: readonly ["invalid-input", "unavailable", "permission-denied", "conflict", "not-found"];
    readonly exposureClasses: readonly ["consumer-needed", "diagnostic"];
    readonly fixturePolicy: "Provider route fixtures and Dashboard panel samples.";
    readonly functionClass: "rest-command";
    readonly id: "I05";
    readonly observabilityKeys: readonly ["projectScopeId", "folderId", "controlRoot", "dataRootSource"];
    readonly removalBlocker: "Project-scoped routing and UI need this capability.";
    readonly requiredExportPaths: readonly ["./daemon", "./shared"];
    readonly sourceFiles: readonly ["src/shared/ProjectScope.ts", "src/daemon/RuntimeContracts.ts"];
    readonly title: "ProjectScope contract";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Compact job summary inline; reports/logs/snapshots via artifactRef/detailRef.";
    readonly capabilityCoverage: readonly ["queued", "running", "completed", "failed", "cancelled"];
    readonly capabilityDiscovery: readonly ["daemon health jobs capability"];
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Plugin codex-local tools", "Dashboard JobsView"];
    readonly driftGate: "Job route fixture plus Plugin and Dashboard consumer tests.";
    readonly errorKinds: readonly ["invalid-input", "unavailable", "timeout", "cancelled", "conflict", "not-found"];
    readonly exposureClasses: readonly ["public", "consumer-needed", "diagnostic"];
    readonly fixturePolicy: "Alembic owns job route fixtures and real bootstrap/rescan reports.";
    readonly functionClass: "rest-command";
    readonly id: "I06";
    readonly observabilityKeys: readonly ["jobId", "kind", "status", "phase", "reasonCode", "correlationId"];
    readonly removalBlocker: "Job orchestration is a primary runtime workflow.";
    readonly requiredExportPaths: readonly ["./daemon"];
    readonly sourceFiles: readonly ["src/daemon/RuntimeContracts.ts", "src/daemon/JobStore.ts"];
    readonly title: "Jobs command surface";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Developer-facing events inline; raw-provider, secret, and hidden reasoning hidden by default.";
    readonly capabilityCoverage: readonly ["workflow", "llm.input", "llm.reflection", "tool", "artifact", "error"];
    readonly capabilityDiscovery: readonly ["daemon health jobs.processEvents capability"];
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Dashboard job event timeline"];
    readonly driftGate: "Event schema fixture plus socket/recovery integration.";
    readonly errorKinds: readonly ["partial", "unavailable", "not-found", "internal-error"];
    readonly exposureClasses: readonly ["consumer-needed", "diagnostic", "raw-provider", "hidden-reasoning", "sensitive"];
    readonly fixturePolicy: "Process-event endpoint fixtures and Dashboard hook event samples.";
    readonly functionClass: "event-stream";
    readonly id: "I07";
    readonly observabilityKeys: readonly ["jobId", "eventId", "sequence", "correlationId", "sourceClass"];
    readonly removalBlocker: "Durable event/recovery behavior depends on this schema.";
    readonly requiredExportPaths: readonly ["./daemon"];
    readonly sourceFiles: readonly ["src/daemon/JobProcessEventContracts.ts"];
    readonly title: "Job process events";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Snapshot manifest inline; large reports, logs, and LLM IO by artifactRef.";
    readonly capabilityCoverage: readonly ["summary", "timeline", "events", "artifacts", "llm-io", "warnings"];
    readonly capabilityDiscovery: readonly ["jobs capability", "snapshot manifest"];
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Dashboard JobsView"];
    readonly driftGate: "Snapshot schema validation plus Dashboard rendering fixture.";
    readonly errorKinds: readonly ["not-found", "artifact-missing", "artifact-unreadable", "checksum-mismatch"];
    readonly exposureClasses: readonly ["public", "consumer-needed", "diagnostic", "artifactRef-only", "sensitive"];
    readonly fixturePolicy: "Generated snapshot fixtures and real bootstrap/rescan artifacts.";
    readonly functionClass: "job-artifact";
    readonly id: "I08";
    readonly observabilityKeys: readonly ["jobId", "snapshotId", "snapshotVersion", "checksum", "artifactRef"];
    readonly removalBlocker: "Runtime verification and user-facing job evidence rely on these endpoints.";
    readonly requiredExportPaths: readonly ["./daemon"];
    readonly sourceFiles: readonly ["src/daemon/JobDisplaySnapshotContracts.ts"];
    readonly title: "Job display snapshots and artifacts";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Compact findings inline; full reports by artifactRef.";
    readonly capabilityCoverage: readonly ["pass", "fail", "warning", "blocked/unavailable", "rule lookup"];
    readonly capabilityDiscovery: readonly ["route capability", "Plugin visible tools"];
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard", "Codex host"];
    readonly coreRole: "shared-schema-source";
    readonly currentCompatibilityOwner: readonly ["Codex plugin guard workflow", "Dashboard guard UI"];
    readonly driftGate: "Route output vs MCP clean output and Dashboard severity fixture.";
    readonly errorKinds: readonly ["invalid-input", "unavailable", "capability-mismatch", "internal-error"];
    readonly exposureClasses: readonly ["public", "consumer-needed", "diagnostic", "internal"];
    readonly fixturePolicy: "Alembic guard route fixtures and Plugin/Dashboard replay.";
    readonly functionClass: "rest-command";
    readonly id: "I21";
    readonly observabilityKeys: readonly ["ruleId", "filePath", "severity", "operation", "sourceRef"];
    readonly removalBlocker: "Code-review workflow depends on guard semantics.";
    readonly requiredExportPaths: readonly ["./guard"];
    readonly sourceFiles: readonly ["src/guard.ts", "src/service/guard/index.ts"];
    readonly title: "Guard, rules, violations, and code review surfaces";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}, {
    readonly artifactPolicy: "Summaries inline; logs and reports as detailRef.";
    readonly capabilityCoverage: readonly ["file-change dispatch", "signal display", "audit trail", "monitoring"];
    readonly capabilityDiscovery: readonly ["runtime health fileMonitor capability", "route availability"];
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly coreRole: "shared-source-contract";
    readonly currentCompatibilityOwner: readonly ["Dashboard diagnostics", "Plugin diagnostics"];
    readonly driftGate: "Source-contract aliases plus Dashboard/Plugin diagnostic fixture.";
    readonly errorKinds: readonly ["invalid-input", "unavailable", "permission-denied", "not-found"];
    readonly exposureClasses: readonly ["diagnostic", "internal", "consumer-needed", "sensitive"];
    readonly fixturePolicy: "Diagnostic route and socket fixtures.";
    readonly functionClass: "diagnostic-observability";
    readonly id: "I23";
    readonly observabilityKeys: readonly ["source", "eventId", "operation", "reasonCode", "failureCode", "logRef"];
    readonly removalBlocker: "Diagnostics are required for runtime verification and troubleshooting.";
    readonly requiredExportPaths: readonly ["./daemon", "./shared"];
    readonly sourceFiles: readonly ["src/shared/source-contracts.ts", "src/daemon/RuntimeContracts.ts"];
    readonly title: "File changes, signals, audit, monitoring, logs";
    readonly validationCommands: readonly ["npm run build:check", "npm run test"];
}];
export declare const CORE_CONTRACT_SPINE_FIELD_POLICIES: readonly [{
    readonly consumers: readonly ["Alembic", "AlembicPlugin", "AlembicAgent"];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "strict";
    readonly failureKinds: readonly ["capability-mismatch", "not-found"];
    readonly fieldClass: "public";
    readonly fieldPath: "rows.I01.packageExports";
    readonly interfaceRole: "producer-contract";
    readonly ordinaryOutputAllowed: true;
    readonly owner: "AlembicCore";
    readonly rowId: "I01";
    readonly validationCommands: readonly ["npm run smoke:public-api", "npm run lint:public-api-boundary"];
}, {
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard"];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "strict";
    readonly failureKinds: readonly ["unavailable", "capability-mismatch", "degraded"];
    readonly fieldClass: "consumer-needed";
    readonly fieldPath: "rows.I03.runtimeHealth.capabilities";
    readonly interfaceRole: "consumer-projection";
    readonly ordinaryOutputAllowed: true;
    readonly owner: "AlembicCore";
    readonly rowId: "I03";
    readonly validationCommands: readonly ["npm run test -- RuntimeContracts", "npm run build:check"];
}, {
    readonly consumers: readonly [];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "private-adapter";
    readonly failureKinds: readonly ["internal-error", "schema-drift"];
    readonly fieldClass: "internal";
    readonly fieldPath: "rows.I03.runtimeHealth.internalRuntimeState";
    readonly interfaceRole: "internal-runtime";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I03";
    readonly validationCommands: readonly ["npm run test -- RuntimeContracts"];
}, {
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "strict";
    readonly failureKinds: readonly ["unavailable", "conflict", "permission-denied", "timeout", "cancelled"];
    readonly fieldClass: "consumer-needed";
    readonly fieldPath: "rows.I04.projectRuntime.failureEnvelope";
    readonly interfaceRole: "consumer-projection";
    readonly ordinaryOutputAllowed: true;
    readonly owner: "AlembicCore";
    readonly rowId: "I04";
    readonly validationCommands: readonly ["npm run test -- ProjectRuntimeContracts", "npm run build:check"];
}, {
    readonly cleanupTrigger: "Remove after D24/D29 import scans and fixture replay prove no product consumer reads legacyPath/byLegacyPath.";
    readonly consumers: readonly ["Alembic", "AlembicAgent", "AlembicPlugin", "AlembicDashboard"];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "compatibility-gated";
    readonly failureKinds: readonly ["invalid-input", "conflict", "not-found"];
    readonly fieldClass: "compatibility-private";
    readonly fieldPath: "rows.I05.projectScope.legacyPath";
    readonly interfaceRole: "compatibility-bridge";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I05";
    readonly validationCommands: readonly ["npm run test -- ProjectScopeContracts", "npm run check"];
}, {
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard"];
    readonly diagnosticPolicy: "detailRef";
    readonly extensionPolicy: "detailRef-only";
    readonly failureKinds: readonly ["not-found", "partial", "internal-error"];
    readonly fieldClass: "detailRef-only";
    readonly fieldPath: "rows.I06.jobs.detailRef";
    readonly interfaceRole: "diagnostic-extension";
    readonly ordinaryOutputAllowed: true;
    readonly owner: "AlembicCore";
    readonly rowId: "I06";
    readonly validationCommands: readonly ["npm run test -- JobStore RuntimeContracts", "npm run build:check"];
}, {
    readonly consumers: readonly [];
    readonly diagnosticPolicy: "redacted-summary";
    readonly extensionPolicy: "private-adapter";
    readonly failureKinds: readonly ["schema-drift", "sensitive-leak"];
    readonly fieldClass: "raw-provider";
    readonly fieldPath: "rows.I07.jobProcessEvents.rawProviderPayload";
    readonly interfaceRole: "internal-runtime";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I07";
    readonly validationCommands: readonly ["npm run test -- JobProcessEventContracts"];
}, {
    readonly consumers: readonly [];
    readonly diagnosticPolicy: "redacted-summary";
    readonly extensionPolicy: "private-adapter";
    readonly failureKinds: readonly ["schema-drift", "sensitive-leak"];
    readonly fieldClass: "hidden-reasoning";
    readonly fieldPath: "rows.I07.jobProcessEvents.hiddenReasoning";
    readonly interfaceRole: "internal-runtime";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I07";
    readonly validationCommands: readonly ["npm run test -- JobProcessEventContracts"];
}, {
    readonly consumers: readonly [];
    readonly diagnosticPolicy: "redacted-summary";
    readonly extensionPolicy: "private-adapter";
    readonly failureKinds: readonly ["sensitive-leak", "internal-error"];
    readonly fieldClass: "sensitive";
    readonly fieldPath: "rows.I07.jobProcessEvents.providerSecrets";
    readonly interfaceRole: "internal-runtime";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I07";
    readonly validationCommands: readonly ["npm run test -- JobProcessEventContracts"];
}, {
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard"];
    readonly diagnosticPolicy: "artifactRef";
    readonly extensionPolicy: "artifactRef-only";
    readonly failureKinds: readonly ["not-found", "partial", "schema-drift"];
    readonly fieldClass: "artifactRef-only";
    readonly fieldPath: "rows.I08.jobDisplaySnapshots.artifactRef";
    readonly interfaceRole: "diagnostic-extension";
    readonly ordinaryOutputAllowed: true;
    readonly owner: "AlembicCore";
    readonly rowId: "I08";
    readonly validationCommands: readonly ["npm run test -- JobDisplaySnapshotContracts", "npm run build:check"];
}, {
    readonly consumers: readonly ["AlembicPlugin", "AlembicDashboard", "Codex host"];
    readonly diagnosticPolicy: "diagnostic-context";
    readonly extensionPolicy: "diagnostic-ref";
    readonly failureKinds: readonly ["invalid-input", "unavailable", "capability-mismatch", "internal-error"];
    readonly fieldClass: "diagnostic";
    readonly fieldPath: "rows.I21.guard.diagnosticContext";
    readonly interfaceRole: "diagnostic-extension";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I21";
    readonly validationCommands: readonly ["npm run test -- guard", "npm run build:check"];
}, {
    readonly cleanupTrigger: "Remove after provider and Dashboard fixture replay prove canonical acceptedEventSources replace compatibilityAliases.";
    readonly consumers: readonly ["Alembic", "AlembicDashboard"];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "compatibility-gated";
    readonly failureKinds: readonly ["invalid-input", "not-found", "schema-drift"];
    readonly fieldClass: "compatibility-private";
    readonly fieldPath: "rows.I23.fileChanges.compatibilityAliases";
    readonly interfaceRole: "compatibility-bridge";
    readonly ordinaryOutputAllowed: false;
    readonly owner: "AlembicCore";
    readonly rowId: "I23";
    readonly validationCommands: readonly ["npm run test -- RuntimeContracts SourceContracts", "npm run check"];
}, {
    readonly consumers: readonly ["AlembicDashboard", "AlembicPlugin"];
    readonly diagnosticPolicy: "none";
    readonly extensionPolicy: "typed-extension";
    readonly failureKinds: readonly ["schema-drift", "partial", "unavailable"];
    readonly fieldClass: "typed-extension";
    readonly fieldPath: "rows.I23.fileChanges.auditExtension";
    readonly interfaceRole: "diagnostic-extension";
    readonly ordinaryOutputAllowed: true;
    readonly owner: "AlembicCore";
    readonly rowId: "I23";
    readonly validationCommands: readonly ["npm run test -- RuntimeContracts SourceContracts"];
}];
export declare const CORE_LEGACY_CONTRACT_CONVERGENCE_CANDIDATES: readonly [{
    readonly cleanupBlocker: "Alembic and AlembicPlugin still import daemon, shared, guard, search, and core/* public subpaths; direct narrowing waits for consumer migration.";
    readonly currentCompatibilityOwner: readonly ["Alembic", "AlembicPlugin", "AlembicAgent"];
    readonly currentConsumers: readonly ["Alembic", "AlembicPlugin", "AlembicAgent"];
    readonly decisionRationale: "Current product source scans still consume broad public families, so D9 records them as owned Core public contracts instead of narrowing exports early.";
    readonly id: "D9-C01";
    readonly legacySurface: "Wildcard package exports for daemon, shared, guard, search, core/ast, core/capability, core/discovery, and core/enhancement families.";
    readonly publicExposurePolicy: "Preserved only as Core-owned deterministic public package boundaries; runtime, UI, MCP, CLI, AI-provider, and tool execution stay outside Core.";
    readonly registryRows: readonly ["I01", "I03", "I04", "I05", "I06", "I07", "I08", "I21", "I23"];
    readonly removalTrigger: "Every active product import is migrated to an explicit replacement export and consumer build or fixture replay passes.";
    readonly replacementContract: "D2 Core contract spine rows plus explicit package export and public API smoke coverage.";
    readonly requiredExportPaths: readonly ["./daemon", "./daemon/*", "./guard", "./search", "./shared", "./core", "./core/*", "./core/analysis", "./core/analysis/*", "./core/ast", "./core/ast/*", "./core/capability", "./core/capability/*", "./core/discovery", "./core/discovery/*", "./core/enhancement", "./core/enhancement/*"];
    readonly sourceFiles: readonly ["package.json", "src/search.ts", "src/daemon/index.ts", "src/shared/index.ts"];
    readonly status: "preserved-with-owner";
    readonly validationCommands: readonly ["rg -n \"@alembic/core/(search|daemon|shared|guard|core/)\" Alembic AlembicPlugin AlembicAgent AlembicDashboard -g \"!**/vendor/**\" -g \"!**/dist/**\"", "npm run smoke:public-api", "npm run check"];
}, {
    readonly cleanupBlocker: "Dashboard and provider health fixtures still surface fileMonitor.compatibilityAliases for legacy ide-edit classification.";
    readonly currentCompatibilityOwner: readonly ["Alembic provider health route", "AlembicDashboard capability UI"];
    readonly currentConsumers: readonly ["Alembic", "AlembicDashboard"];
    readonly decisionRationale: "The alias map is consumer-needed diagnostic contract data until provider and Dashboard fixtures prove canonical sources alone are sufficient.";
    readonly id: "D9-C02";
    readonly legacySurface: "fileMonitor.compatibilityAliases mapping ide-edit to host-edit.";
    readonly publicExposurePolicy: "Diagnostic/consumer-needed capability metadata only; canonical acceptedEventSources remain the source of truth.";
    readonly registryRows: readonly ["I03", "I23"];
    readonly removalTrigger: "Dashboard and provider fixture replay no longer read or display compatibilityAliases and canonical event sources cover all current states.";
    readonly replacementContract: "Explicit file monitor capability discovery with canonical acceptedEventSources and source-contract normalizers.";
    readonly requiredExportPaths: readonly ["./daemon", "./shared"];
    readonly sourceFiles: readonly ["src/daemon/RuntimeContracts.ts", "src/shared/source-contracts.ts"];
    readonly status: "preserved-with-owner";
    readonly validationCommands: readonly ["npm run test -- RuntimeContracts SourceContracts", "rg -n \"compatibilityAliases|ide-edit\" Alembic AlembicDashboard -g \"!**/vendor/**\" -g \"!**/dist/**\""];
}, {
    readonly cleanupBlocker: "Alembic provider project-scope analysis, AlembicAgent evidence, Plugin IDE-agent surfaces, and Dashboard project-scope UI still consume legacyPath compatibility data.";
    readonly currentCompatibilityOwner: readonly ["Alembic provider ProjectScopeAnalysis", "AlembicAgent source evidence", "AlembicPlugin IDEAgentAnalysisSurface", "AlembicDashboard ProjectScopePanel"];
    readonly currentConsumers: readonly ["Alembic", "AlembicAgent", "AlembicPlugin", "AlembicDashboard"];
    readonly decisionRationale: "Qualified refs are mandatory for new Core-normalized paths, while legacyPath stays as compatibility input/output with explicit ambiguity behavior.";
    readonly id: "D9-C03";
    readonly legacySurface: "legacyPath, byLegacyPath, unique-legacy-path, and ambiguous-legacy-path source-ref compatibility.";
    readonly publicExposurePolicy: "qualifiedPath/projectScopeId are first-class; legacyPath is compatibility-only and ambiguous legacy refs must be rejected.";
    readonly registryRows: readonly ["I05"];
    readonly removalTrigger: "No current product source or fixture consumes legacyPath/byLegacyPath and qualifiedPath fixture replay passes across provider, Agent, Plugin, and Dashboard.";
    readonly replacementContract: "ProjectScope source refs keyed by projectScopeId and repo-qualified qualifiedPath.";
    readonly requiredExportPaths: readonly ["./shared"];
    readonly sourceFiles: readonly ["src/shared/ProjectScope.ts"];
    readonly status: "preserved-with-owner";
    readonly validationCommands: readonly ["npm run test -- ProjectScopeContracts", "rg -n \"legacyPath|byLegacyPath|ambiguous-legacy-path|unique-legacy-path\" Alembic AlembicAgent AlembicPlugin AlembicDashboard -g \"!**/vendor/**\" -g \"!**/dist/**\""];
}, {
    readonly cleanupBlocker: "No active product consumer remains after D9 alias import scan; keep BM25Scorer class but do not reintroduce BM25* type aliases.";
    readonly currentCompatibilityOwner: readonly [];
    readonly currentConsumers: readonly [];
    readonly decisionRationale: "Active product source scan has zero BM25Document/BM25SearchResult/BM25DocMeta imports, and Core internals now use ScorerDocument/ScorerResult/DocMeta.";
    readonly id: "D9-C04";
    readonly legacySurface: "Deprecated BM25Document, BM25SearchResult, and BM25DocMeta type aliases.";
    readonly publicExposurePolicy: "Deleted type aliases; current public scorer type names remain ScorerDocument, ScorerResult, and DocMeta.";
    readonly registryRows: readonly ["I01"];
    readonly removalTrigger: "Already satisfied by clean active product import scan and Core typecheck.";
    readonly replacementContract: "Current scorer names exported from @alembic/core/search.";
    readonly requiredExportPaths: readonly ["./search", "./service/search", "./service/search/*"];
    readonly sourceFiles: readonly ["src/search.ts", "src/service/search/SearchTypes.ts", "src/service/search/BM25Scorer.ts", "src/service/search/FieldWeightedScorer.ts"];
    readonly status: "deleted";
    readonly validationCommands: readonly ["rg -n \"BM25Document|BM25SearchResult|BM25DocMeta\" Alembic AlembicPlugin AlembicAgent AlembicDashboard -g \"!**/vendor/**\" -g \"!**/dist/**\"", "npm run build:check", "npm run test"];
}];
export declare function validateCoreContractSpine(options?: ValidateCoreContractSpineOptions): CoreContractSpineValidationResult;
export declare function validateCoreContractFieldPolicies(policies?: readonly CoreContractSpineFieldPolicy[]): CoreContractSpineFieldPolicyValidationResult;
export declare function validateCoreLegacyContractConvergence(options?: ValidateCoreLegacyContractConvergenceOptions): CoreLegacyContractConvergenceValidationResult;
export declare function summarizeCoreContractSpine(rows?: readonly CoreContractSpineRow[]): CoreContractSpineSummary;
export declare function summarizeCoreContractFieldPolicies(policies?: readonly CoreContractSpineFieldPolicy[]): CoreContractSpineFieldPolicySummary;
export declare function summarizeCoreLegacyContractConvergence(candidates?: readonly CoreLegacyContractConvergenceCandidate[]): CoreLegacyContractConvergenceSummary;
