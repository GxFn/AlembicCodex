/**
 * @module AstAnalyzer
 * @description 基于 Tree-sitter 的多语言 AST 分析器（插件注册制）
 *
 * 提供结构化代码分析能力：
 * - 类/协议/扩展 声明与继承关系
 * - 属性声明与修饰符
 * - 方法签名（类方法/实例方法）
 * - 设计模式检测（Singleton、Delegate、Factory、Observer）
 * - 代码结构指标（圈复杂度、嵌套深度、方法行数）
 *
 * 支持语言：通过插件注册 — ObjC、Swift、TypeScript、JavaScript、Python、Java、Kotlin、Go、Dart、Rust
 * 插件注册入口: lib/core/ast/index.js
 */
import { type CallSiteInfo } from './analysis/CallSiteExtractor.js';
/** Minimal tree-sitter tree interface */
interface TreeSitterTree {
    rootNode: TreeSitterNode;
}
/** Language AST plugin interface */
interface LangPlugin {
    getGrammar: () => unknown;
    walk: (rootNode: TreeSitterNode, ctx: AstWalkerContext) => void;
    detectPatterns?: (root: TreeSitterNode, lang: string, methods: AstMethodRecord[], properties: AstPropertyRecord[], classes: AstClassRecord[]) => AstPatternRecord[];
    extractCallSites?: (root: TreeSitterNode, ctx: AstWalkerContext, lang: string) => void;
    extensions?: string[];
}
/** Context object passed to AST walkers */
interface AstWalkerContext {
    classes: AstClassRecord[];
    protocols: AstProtocolRecord[];
    categories: AstCategoryRecord[];
    methods: AstMethodRecord[];
    properties: AstPropertyRecord[];
    patterns: AstPatternRecord[];
    imports: string[];
    exports: string[];
    callSites: CallSiteInfo[];
    references: AstReferenceRecord[];
    [key: string]: unknown;
}
interface AstClassRecord {
    name: string;
    superclass?: string;
    protocols?: string[];
    methodCount?: number;
    line?: number;
    file?: string;
    [key: string]: unknown;
}
interface AstProtocolRecord {
    name: string;
    inherits?: string[];
    file?: string;
    [key: string]: unknown;
}
interface AstCategoryRecord {
    className?: string;
    categoryName?: string;
    name?: string;
    targetClass?: string;
    methods?: AstMethodRecord[];
    protocols?: string[];
    file?: string;
    [key: string]: unknown;
}
interface AstMethodRecord {
    name: string;
    className?: string;
    isClassMethod?: boolean;
    kind?: string;
    line?: number;
    bodyLines?: number;
    complexity?: number;
    nestingDepth?: number;
    file?: string;
    [key: string]: unknown;
}
interface AstPropertyRecord {
    name: string;
    className?: string;
    attributes?: string[];
    line?: number;
    file?: string;
    [key: string]: unknown;
}
interface AstPatternRecord {
    type: string;
    className?: string;
    methodName?: string;
    propertyName?: string;
    isWeakRef?: boolean;
    line?: number;
    confidence?: number;
    file?: string;
    [key: string]: unknown;
}
interface AstReferenceRecord {
    [key: string]: unknown;
}
interface InheritanceEdge {
    from: string;
    to: string;
    type: string;
}
interface PatternStatEntry {
    count: number;
    files: string[];
    instances: AstPatternRecord[];
}
interface AstMetrics {
    methodCount: number;
    avgBodyLines: number;
    maxComplexity: number;
    maxNestingDepth: number;
    longMethods: AstMethodRecord[];
    complexMethods: AstMethodRecord[];
}
interface AggregatedMetrics {
    totalMethods: number;
    totalClasses: number;
    avgMethodsPerClass: number;
    maxNestingDepth: number;
    longMethods: {
        name: string;
        className?: string;
        lines?: number;
        file?: string;
        line?: number;
    }[];
    complexMethods: {
        name: string;
        className?: string;
        complexity?: number;
        file?: string;
        line?: number;
    }[];
}
interface AstFileSummary {
    lang: string;
    classes: AstClassRecord[];
    protocols: AstProtocolRecord[];
    categories: AstCategoryRecord[];
    methods: AstMethodRecord[];
    properties: AstPropertyRecord[];
    patterns: AstPatternRecord[];
    imports: string[];
    exports: string[];
    callSites: CallSiteInfo[];
    references: AstReferenceRecord[];
    inheritanceGraph: InheritanceEdge[];
    metrics: AstMetrics;
}
interface FileSummaryEntry extends AstFileSummary {
    file: string;
}
interface AnalyzeFileOptions {
    extractCallSites?: boolean;
}
interface AnalyzeProjectOptions {
    preprocessFile?: (content: string, ext: string) => {
        content: string;
        lang?: string;
    } | null;
}
interface FileInput {
    name: string;
    relativePath: string;
    content: string;
}
interface ContextFilter {
    forbiddenContext?: string;
    requiredContext?: string;
}
interface ProjectAnalysisResult {
    lang: string;
    fileCount: number;
    classes: AstClassRecord[];
    protocols: AstProtocolRecord[];
    categories: AstCategoryRecord[];
    inheritanceGraph: InheritanceEdge[];
    patternStats: Record<string, PatternStatEntry>;
    projectMetrics: AggregatedMetrics;
    fileSummaries: FileSummaryEntry[];
}
/**
 * 注册语言 AST 插件
 * @param langId 语言标识 (e.g. 'objectivec', 'swift', 'typescript')
 */
export declare function registerLanguage(langId: string, plugin: LangPlugin): void;
/**
 * 分析单个源文件，返回结构化 AST 摘要
 * @param source 源代码文本
 * @param lang 语言标识 'objectivec' | 'swift' | 'typescript' | 'javascript' | 'python' | 'java' | 'kotlin' | 'go' | 'dart' | 'rust' | 'tsx'
 * @param [options.extractCallSites=true] 是否提取调用点 (Phase 5)
 */
declare function analyzeFile(source: string, lang: string, options?: AnalyzeFileOptions): AstFileSummary | null;
/**
 * 批量分析多文件，返回项目级汇总
 * @param files
 * @param | null }} [options]
 */
declare function analyzeProject(files: FileInput[], lang: string, options: AnalyzeProjectOptions): ProjectAnalysisResult;
/** 为 Agent 生成结构化上下文摘要（Markdown） */
declare function generateContextForAgent(projectSummary: ProjectAnalysisResult): string;
/** 检查 Tree-sitter 是否可用（至少有一个语言插件注册） */
declare function isAvailable(): boolean;
/** 获取支持的语言列表 */
declare function supportedLanguages(): string[];
/**
 * 解析源代码为 AST 树 (供 ASTChunker 等外部模块使用)
 * @param source 源代码
 * @param lang 语言 ID (如 'javascript', 'typescript', 'python' 等)
 * @returns | null} tree-sitter 的 rootNode, 或 null (不支持/解析失败)
 */
declare function parseToTree(source: string, lang: string): {
    rootNode: TreeSitterNode;
    tree: TreeSitterTree;
} | null;
/**
 * 在 AST 中搜索特定调用表达式
 * @param source 源代码
 * @param lang 'objectivec' | 'swift'
 * @param targetCallee 目标调用，如 'URLSession.shared', 'dispatch_sync'
 * @returns >}
 */
declare function findCallExpressions(source: string, lang: string, targetCallee: string): {
    line: number;
    snippet: string;
    enclosingClass: string | null;
}[];
/**
 * 搜索特定模式在特定上下文中的出现
 * @param source 源代码
 * @param lang 'objectivec' | 'swift'
 * @param pattern 要查找的文本模式（普通字符串匹配）
 * @param contextFilter
 *   forbiddenContext: 如果在此上下文中出现则报告 (如 'dealloc')
 *   requiredContext: 如果不在此上下文中出现则报告
 * @returns >}
 */
declare function findPatternInContext(source: string, lang: string, pattern: string, contextFilter?: ContextFilter): {
    line: number;
    snippet: string;
    context: string | null;
}[];
/**
 * 检查类是否遵循指定协议
 * @param source 源代码
 * @param lang 'objectivec' | 'swift'
 * @param className 类名
 * @param protocolName 协议名
 * @returns }
 */
declare function checkProtocolConformance(source: string, lang: string, className: string, protocolName: string): {
    conforms: boolean;
    classFound: boolean;
    classDeclLine: null;
} | {
    conforms: boolean;
    classFound: boolean;
    classDeclLine: number | undefined;
};
export { analyzeFile, analyzeProject, generateContextForAgent, isAvailable, supportedLanguages, findCallExpressions, findPatternInContext, checkProtocolConformance, parseToTree, };
export type { ProjectAnalysisResult };
