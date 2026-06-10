export declare const CORE_FIELD_CLASSES: readonly ["public", "consumer-needed", "diagnostic", "internal", "sensitive", "raw-provider", "hidden-reasoning", "detailRef-only", "artifactRef-only", "compatibility-private", "typed-extension"];
export declare const CORE_PRIVATE_FIELD_CLASSES: readonly ["internal", "sensitive", "raw-provider", "hidden-reasoning", "compatibility-private"];
export declare const CORE_SCHEMA_CLOSURE_POLICIES: readonly ["strict", "typed-extension", "diagnostic-ref", "detailRef-only", "artifactRef-only", "compatibility-gated", "private-adapter"];
export declare const CORE_INTERFACE_ROLES: readonly ["producer-contract", "consumer-projection", "diagnostic-extension", "compatibility-bridge", "internal-runtime"];
export declare const CORE_DIAGNOSTIC_POLICIES: readonly ["none", "diagnostic-context", "redacted-summary", "detailRef", "artifactRef"];
export declare const CORE_FIELD_FAILURE_KINDS: readonly ["invalid-input", "unavailable", "capability-mismatch", "not-found", "conflict", "permission-denied", "timeout", "cancelled", "partial", "degraded", "internal-error", "schema-drift", "sensitive-leak"];
export type CoreFieldClass = (typeof CORE_FIELD_CLASSES)[number];
export type CorePrivateFieldClass = (typeof CORE_PRIVATE_FIELD_CLASSES)[number];
export type CoreSchemaClosurePolicy = (typeof CORE_SCHEMA_CLOSURE_POLICIES)[number];
export type CoreInterfaceRole = (typeof CORE_INTERFACE_ROLES)[number];
export type CoreDiagnosticPolicy = (typeof CORE_DIAGNOSTIC_POLICIES)[number];
export type CoreFieldFailureKind = (typeof CORE_FIELD_FAILURE_KINDS)[number];
export interface CoreFieldTaxonomyEntry {
    className: CoreFieldClass;
    description: string;
    ordinaryOutputDefault: boolean;
    requiredClosurePolicy: CoreSchemaClosurePolicy;
    requiresConsumer: boolean;
    requiresDiagnosticContext: boolean;
    requiresRedaction: boolean;
}
export interface CoreFieldPolicy {
    cleanupTrigger?: string;
    consumers: readonly string[];
    diagnosticPolicy: CoreDiagnosticPolicy;
    extensionPolicy: CoreSchemaClosurePolicy;
    failureKinds: readonly CoreFieldFailureKind[];
    fieldClass: CoreFieldClass;
    fieldPath: string;
    interfaceRole: CoreInterfaceRole;
    ordinaryOutputAllowed: boolean;
    owner: string;
    validationCommands: readonly string[];
}
export interface CoreFieldPolicyValidationIssue {
    code: 'missing-field-policy' | 'missing-owner' | 'missing-consumer' | 'missing-validation-command' | 'missing-failure-kind' | 'missing-cleanup-trigger' | 'closure-policy-mismatch' | 'invalid-field-class' | 'invalid-extension-policy' | 'invalid-interface-role' | 'invalid-diagnostic-policy' | 'invalid-failure-kind' | 'private-field-public-exposure' | 'forbidden-owner' | 'typed-extension-policy-mismatch' | 'detail-ref-policy-mismatch' | 'artifact-ref-policy-mismatch';
    fieldPath?: string;
    message: string;
    path: string;
}
export interface CoreFieldPolicyValidationResult {
    issues: CoreFieldPolicyValidationIssue[];
    policyCount: number;
    valid: boolean;
}
export interface ValidateCoreFieldPoliciesOptions {
    expectedFieldPaths?: readonly string[];
    forbiddenOwners?: readonly string[];
}
export interface CoreFieldPolicySummary {
    byClass: Record<CoreFieldClass, number>;
    byExtensionPolicy: Record<CoreSchemaClosurePolicy, number>;
    policyCount: number;
}
export declare const CORE_FIELD_TAXONOMY: readonly [{
    readonly className: "public";
    readonly description: "Stable ordinary output or public package/API field.";
    readonly ordinaryOutputDefault: true;
    readonly requiredClosurePolicy: "strict";
    readonly requiresConsumer: false;
    readonly requiresDiagnosticContext: false;
    readonly requiresRedaction: false;
}, {
    readonly className: "consumer-needed";
    readonly description: "Field required by a named current consumer on a specific surface.";
    readonly ordinaryOutputDefault: true;
    readonly requiredClosurePolicy: "strict";
    readonly requiresConsumer: true;
    readonly requiresDiagnosticContext: false;
    readonly requiresRedaction: false;
}, {
    readonly className: "diagnostic";
    readonly description: "Troubleshooting field available only in diagnostic context.";
    readonly ordinaryOutputDefault: false;
    readonly requiredClosurePolicy: "diagnostic-ref";
    readonly requiresConsumer: true;
    readonly requiresDiagnosticContext: true;
    readonly requiresRedaction: false;
}, {
    readonly className: "internal";
    readonly description: "Implementation state that must not be ordinary public output.";
    readonly ordinaryOutputDefault: false;
    readonly requiredClosurePolicy: "private-adapter";
    readonly requiresConsumer: false;
    readonly requiresDiagnosticContext: false;
    readonly requiresRedaction: false;
}, {
    readonly className: "sensitive";
    readonly description: "Secrets, credentials, private paths, and other sensitive fields.";
    readonly ordinaryOutputDefault: false;
    readonly requiredClosurePolicy: "private-adapter";
    readonly requiresConsumer: false;
    readonly requiresDiagnosticContext: true;
    readonly requiresRedaction: true;
}, {
    readonly className: "raw-provider";
    readonly description: "Provider-private raw payload or transport-specific response data.";
    readonly ordinaryOutputDefault: false;
    readonly requiredClosurePolicy: "private-adapter";
    readonly requiresConsumer: false;
    readonly requiresDiagnosticContext: true;
    readonly requiresRedaction: true;
}, {
    readonly className: "hidden-reasoning";
    readonly description: "Hidden model reasoning or provider-equivalent private reasoning content.";
    readonly ordinaryOutputDefault: false;
    readonly requiredClosurePolicy: "private-adapter";
    readonly requiresConsumer: false;
    readonly requiresDiagnosticContext: true;
    readonly requiresRedaction: true;
}, {
    readonly className: "detailRef-only";
    readonly description: "Long diagnostic/log/report/replay payload exposed through detailRef only.";
    readonly ordinaryOutputDefault: true;
    readonly requiredClosurePolicy: "detailRef-only";
    readonly requiresConsumer: true;
    readonly requiresDiagnosticContext: true;
    readonly requiresRedaction: false;
}, {
    readonly className: "artifactRef-only";
    readonly description: "Large generated report/snapshot/export exposed through artifactRef only.";
    readonly ordinaryOutputDefault: true;
    readonly requiredClosurePolicy: "artifactRef-only";
    readonly requiresConsumer: true;
    readonly requiresDiagnosticContext: true;
    readonly requiresRedaction: false;
}, {
    readonly className: "compatibility-private";
    readonly description: "Compatibility field with current owner, consumer, and deletion proof gate.";
    readonly ordinaryOutputDefault: false;
    readonly requiredClosurePolicy: "compatibility-gated";
    readonly requiresConsumer: true;
    readonly requiresDiagnosticContext: false;
    readonly requiresRedaction: false;
}, {
    readonly className: "typed-extension";
    readonly description: "Explicit dynamic extension point with typed owner and validation.";
    readonly ordinaryOutputDefault: true;
    readonly requiredClosurePolicy: "typed-extension";
    readonly requiresConsumer: true;
    readonly requiresDiagnosticContext: false;
    readonly requiresRedaction: false;
}];
export declare function validateCoreFieldPolicies(policies: readonly CoreFieldPolicy[], options?: ValidateCoreFieldPoliciesOptions): CoreFieldPolicyValidationResult;
export declare function summarizeCoreFieldPolicies(policies: readonly CoreFieldPolicy[]): CoreFieldPolicySummary;
export declare function isCoreFieldClass(value: unknown): value is CoreFieldClass;
export declare function isCoreSchemaClosurePolicy(value: unknown): value is CoreSchemaClosurePolicy;
export declare function isCoreInterfaceRole(value: unknown): value is CoreInterfaceRole;
export declare function isCoreDiagnosticPolicy(value: unknown): value is CoreDiagnosticPolicy;
export declare function isCoreFieldFailureKind(value: unknown): value is CoreFieldFailureKind;
export declare function isCorePrivateFieldClass(value: CoreFieldClass): value is CorePrivateFieldClass;
