import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { analyzeFile, analyzeProject, checkProtocolConformance, findCallExpressions, findPatternInContext, generateContextForAgent, isAvailable, parseToTree, registerLanguage, supportedLanguages, } from './core/AstAnalyzer.js';
import { ensureGrammars, inferLanguagesFromStats, reloadPlugins, } from './core/ast/ensure-grammars.js';
import { loadPlugins } from './core/ast/index.js';
import ProjectGraph from './core/ast/ProjectGraph.js';
import { getDiscovererRegistry, resetDiscovererRegistry } from './core/discovery/index.js';
import LanguageService from './shared/LanguageService.js';
import { RESOURCES_DIR } from './shared/package-root.js';
export * from './core/analysis/index.js';
export { analyzeFile, analyzeProject, checkProtocolConformance, findCallExpressions, findPatternInContext, generateContextForAgent, isAvailable as isProjectAstAvailable, loadPlugins as loadProjectAstPlugins, parseToTree, registerLanguage, supportedLanguages, };
export { ensureGrammars, inferLanguagesFromStats, reloadPlugins as reloadProjectAstPlugins };
export { ProjectGraph };
export { ConfigWatcher, } from './core/discovery/ConfigWatcher.js';
export { CustomConfigDiscoverer, DartDiscoverer, DiscovererRegistry, detectConflict, GenericDiscoverer, GoDiscoverer, getDiscovererRegistry, JvmDiscoverer, loadPreference, NodeDiscoverer, ProjectDiscoverer, PythonDiscoverer, promptDiscovererChoice, RustDiscoverer, resetDiscovererRegistry, SpmDiscoverer, savePreference, } from './core/discovery/index.js';
export { parseCMakeProject } from './core/discovery/parsers/CMakeParser.js';
export { inferConventionRole, isKmpBuildFile, parseGradleProject, } from './core/discovery/parsers/GradleDslParser.js';
export { parseFlutterPluginsDeps, parseNxWorkspace, parseReactNativeProject, } from './core/discovery/parsers/JsonConfigParser.js';
export { parseBoxfile, parseModuleSpec, } from './core/discovery/parsers/RubyDslParser.js';
export { parseStarlarkBuildFile, RULE_TO_LANGUAGE, } from './core/discovery/parsers/StarlarkParser.js';
export { extractXcodeGenDependencyEdges, parseMelosProject, parseXcodeGenProject, parseXcodeGenTarget, } from './core/discovery/parsers/YamlConfigParser.js';
export { LanguageService };
export * from './service/panorama/index.js';
export { buildProjectSnapshot } from './types/project-snapshot-builder.js';
export * from './workflows/capabilities/project-intelligence/index.js';
export const CORE_GRAMMAR_RESOURCE_FILES = Object.freeze([
    'tree-sitter-dart.wasm',
    'tree-sitter-go.wasm',
    'tree-sitter-java.wasm',
    'tree-sitter-javascript.wasm',
    'tree-sitter-kotlin.wasm',
    'tree-sitter-objc.wasm',
    'tree-sitter-python.wasm',
    'tree-sitter-rust.wasm',
    'tree-sitter-swift.wasm',
    'tree-sitter-tsx.wasm',
    'tree-sitter-typescript.wasm',
]);
export function resolveCoreGrammarResourcesDir() {
    return join(RESOURCES_DIR, 'grammars');
}
export function listCoreGrammarResources() {
    const grammarDir = resolveCoreGrammarResourcesDir();
    return CORE_GRAMMAR_RESOURCE_FILES.map((file) => {
        const resourcePath = join(grammarDir, file);
        return {
            file,
            path: resourcePath,
            available: existsSync(resourcePath),
        };
    });
}
export async function ensureProjectGrammarResources(detectedLanguagesOrStats, options = {}) {
    const languages = Array.isArray(detectedLanguagesOrStats)
        ? [...detectedLanguagesOrStats]
        : inferLanguagesFromStats(detectedLanguagesOrStats);
    const result = await ensureGrammars(languages, { logger: options.logger });
    const shouldReload = options.reload !== false && result.failed.length === 0;
    if (shouldReload) {
        await reloadPlugins();
    }
    return {
        languages,
        installed: result.installed,
        skipped: result.skipped,
        failed: result.failed,
        alreadyAvailable: result.alreadyAvailable,
        reloaded: shouldReload,
    };
}
export function getProjectDiscovererRegistry() {
    return getDiscovererRegistry();
}
export function resetProjectDiscovererRegistry() {
    resetDiscovererRegistry();
}
export function analyzeSourceFile(content, language, options) {
    return analyzeFile(content, language, options);
}
export async function tryBuildProjectGraph(projectRoot, options = {}) {
    if (options.reloadAstPlugins) {
        await loadPlugins();
    }
    if (!isAvailable()) {
        return { available: false, graph: null, reason: 'ast-unavailable' };
    }
    try {
        const { reloadAstPlugins: _reloadAstPlugins, ...buildOptions } = options;
        const graph = await ProjectGraph.build(projectRoot, buildOptions);
        return { available: true, graph };
    }
    catch (error) {
        return {
            available: false,
            graph: null,
            reason: 'build-failed',
            error: error instanceof Error ? error : new Error(String(error)),
        };
    }
}
