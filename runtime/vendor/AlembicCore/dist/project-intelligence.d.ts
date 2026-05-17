import type { ProjectAnalysisResult as AstProjectAnalysisResult } from './core/AstAnalyzer.js';
import { analyzeFile, analyzeProject, checkProtocolConformance, findCallExpressions, findPatternInContext, generateContextForAgent, isAvailable, parseToTree, registerLanguage, supportedLanguages } from './core/AstAnalyzer.js';
import { ensureGrammars, inferLanguagesFromStats, reloadPlugins } from './core/ast/ensure-grammars.js';
import { loadPlugins } from './core/ast/index.js';
import ProjectGraph from './core/ast/ProjectGraph.js';
import type { LanguageService as LanguageServiceType } from './shared/LanguageService.js';
import LanguageService from './shared/LanguageService.js';
export * from './core/analysis/index.js';
export { analyzeFile, analyzeProject, checkProtocolConformance, findCallExpressions, findPatternInContext, generateContextForAgent, isAvailable as isProjectAstAvailable, loadPlugins as loadProjectAstPlugins, parseToTree, registerLanguage, supportedLanguages, };
export type { AstProjectAnalysisResult };
export { ensureGrammars, inferLanguagesFromStats, reloadPlugins as reloadProjectAstPlugins };
export { ProjectGraph };
export { ConfigWatcher, type ConfigWatcherOptions, } from './core/discovery/ConfigWatcher.js';
export { type ConflictResult, CustomConfigDiscoverer, DartDiscoverer, type DetectMatch, type DiscovererPreferenceData, DiscovererRegistry, detectConflict, GenericDiscoverer, GoDiscoverer, getDiscovererRegistry, JvmDiscoverer, loadPreference, NodeDiscoverer, ProjectDiscoverer, PythonDiscoverer, promptDiscovererChoice, RustDiscoverer, resetDiscovererRegistry, SpmDiscoverer, savePreference, } from './core/discovery/index.js';
export type { DependencyEdge as DiscoveredDependencyEdge, DependencyGraph as DiscoveredDependencyGraph, DependencyGraphLayer as DiscoveredDependencyGraphLayer, DiscoveredFile, DiscoveredTarget, } from './core/discovery/ProjectDiscoverer.js';
export type { CMakeLinkDep, CMakeTarget, ParsedCMakeProject, } from './core/discovery/parsers/CMakeParser.js';
export { parseCMakeProject } from './core/discovery/parsers/CMakeParser.js';
export type { GradleDep, GradleModule, ParsedGradleProject, } from './core/discovery/parsers/GradleDslParser.js';
export { inferConventionRole, isKmpBuildFile, parseGradleProject, } from './core/discovery/parsers/GradleDslParser.js';
export type { FlutterPlugin, NxProject, ParsedFlutterPluginsDeps, ParsedNxWorkspace, ParsedReactNativeProject, } from './core/discovery/parsers/JsonConfigParser.js';
export { parseFlutterPluginsDeps, parseNxWorkspace, parseReactNativeProject, } from './core/discovery/parsers/JsonConfigParser.js';
export type { ParsedLayer, ParsedModule, ParsedModuleSpec, ParsedProjectConfig, } from './core/discovery/parsers/RubyDslParser.js';
export { parseBoxfile, parseModuleSpec, } from './core/discovery/parsers/RubyDslParser.js';
export type { LoadStatement, ParsedBuildFile, StarlarkTarget, } from './core/discovery/parsers/StarlarkParser.js';
export { parseStarlarkBuildFile, RULE_TO_LANGUAGE, } from './core/discovery/parsers/StarlarkParser.js';
export { extractXcodeGenDependencyEdges, parseMelosProject, parseXcodeGenProject, parseXcodeGenTarget, } from './core/discovery/parsers/YamlConfigParser.js';
export type { LanguageServiceType };
export { LanguageService };
export * from './service/panorama/index.js';
export type { AstCategoryInfo, AstClassInfo, AstContext, AstFileSummary, AstMethodInfo, AstProtocolInfo, AstSummary, BootstrapSessionShape, CallGraphResult as SnapshotCallGraphResult, CodeEntityGraphResult, DependencyEdge as SnapshotDependencyEdge, DependencyGraph as SnapshotDependencyGraph, DependencyNode as SnapshotDependencyNode, DimensionDef, DiscovererInfo, EnhancementPackInfo, ExistingRecipeInfo, GuardAudit, GuardAuditFileEntry, GuardAuditSummary, GuardViolation as SnapshotGuardViolation, IncrementalPlan, LanguageProfile, LocalPackageModule, MissionBriefingResult, PanoramaResult as SnapshotPanoramaResult, PhaseReport as SnapshotPhaseReport, ProjectMetrics, ProjectSnapshot, ProjectSnapshotInput, SnapshotFile, SnapshotTarget, } from './types/project-snapshot.js';
export { buildProjectSnapshot } from './types/project-snapshot-builder.js';
export * from './workflows/capabilities/project-intelligence/index.js';
export declare const CORE_GRAMMAR_RESOURCE_FILES: readonly ["tree-sitter-dart.wasm", "tree-sitter-go.wasm", "tree-sitter-java.wasm", "tree-sitter-javascript.wasm", "tree-sitter-kotlin.wasm", "tree-sitter-objc.wasm", "tree-sitter-python.wasm", "tree-sitter-rust.wasm", "tree-sitter-swift.wasm", "tree-sitter-tsx.wasm", "tree-sitter-typescript.wasm"];
export type CoreGrammarResourceFile = (typeof CORE_GRAMMAR_RESOURCE_FILES)[number];
export interface GrammarResourceEntry {
    file: CoreGrammarResourceFile;
    path: string;
    available: boolean;
}
export interface GrammarResourceLogger {
    info?(message: string): void;
    warn?(message: string): void;
}
export interface EnsureProjectGrammarResourcesOptions {
    logger?: GrammarResourceLogger;
    reload?: boolean;
}
export interface EnsureProjectGrammarResourcesResult {
    languages: string[];
    installed: string[];
    skipped: string[];
    failed: string[];
    alreadyAvailable: string[];
    reloaded: boolean;
}
export interface TryBuildProjectGraphOptions {
    extensions?: string[];
    onProgress?: (parsed: number, total: number) => void;
    timeoutMs?: number;
    maxFiles?: number;
    maxFileSizeBytes?: number;
    reloadAstPlugins?: boolean;
}
export type TryBuildProjectGraphResult = {
    available: true;
    graph: ProjectGraph;
} | {
    available: false;
    graph: null;
    reason: 'ast-unavailable' | 'build-failed';
    error?: Error;
};
export declare function resolveCoreGrammarResourcesDir(): string;
export declare function listCoreGrammarResources(): GrammarResourceEntry[];
export declare function ensureProjectGrammarResources(detectedLanguagesOrStats: readonly string[] | Record<string, number>, options?: EnsureProjectGrammarResourcesOptions): Promise<EnsureProjectGrammarResourcesResult>;
export declare function getProjectDiscovererRegistry(): import("./core/discovery/DiscovererRegistry.js").DiscovererRegistry;
export declare function resetProjectDiscovererRegistry(): void;
export declare function analyzeSourceFile(content: string, language: string, options?: Parameters<typeof analyzeFile>[2]): Record<string, unknown> | null;
export declare function tryBuildProjectGraph(projectRoot: string, options?: TryBuildProjectGraphOptions): Promise<TryBuildProjectGraphResult>;
