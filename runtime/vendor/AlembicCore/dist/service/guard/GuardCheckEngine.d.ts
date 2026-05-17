/**
 * GuardCheckEngine - Guard 规则检查引擎
 *
 * 从 V1 guard/ios 迁移，适配 V2 架构
 * 支持: 正则模式匹配 + AST 语义规则 + code-level 检查 + 多维度审计
 */
import * as AstAnalyzerModule from '../../core/AstAnalyzer.js';
import Logger from '../../infrastructure/logging/Logger.js';
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type { KnowledgeRepositoryImpl } from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { UncertainResult } from './UncertaintyCollector.js';
import { UncertaintyCollector } from './UncertaintyCollector.js';
/** Minimal DB interface for Guard engine */
interface DatabaseLike {
    prepare(sql: string): {
        run(...params: unknown[]): unknown;
        get(...params: unknown[]): Record<string, unknown>;
        all(...params: unknown[]): Record<string, unknown>[];
    };
    exec?(sql: string): void;
}
interface BuiltInRule {
    message: string;
    severity: string;
    pattern: string;
    languages: string[];
    dimension?: string;
    category?: string;
    fixSuggestion?: string;
    excludePaths?: RegExp;
    excludeLinePatterns?: string[];
    excludePrevLinePatterns?: string[];
    skipComments?: boolean;
    skipTestBlocks?: boolean;
    skipTestFiles?: boolean;
}
interface GuardRule {
    id: string;
    name: string;
    message: string;
    pattern?: string | RegExp;
    languages: string[];
    severity: string;
    dimension?: string;
    category?: string;
    source?: string;
    type?: string;
    fixSuggestion?: string | null;
    excludePaths?: RegExp | string;
    excludeLinePatterns?: string[];
    excludePrevLinePatterns?: string[];
    skipComments?: boolean;
    skipTestBlocks?: boolean;
    /** When true, this rule is skipped for test files (detected by LanguageService.isTestFile) */
    skipTestFiles?: boolean;
    astQuery?: {
        queryType: string;
        params?: Record<string, string>;
    };
}
interface GuardViolation {
    ruleId: string;
    message: string;
    severity: string;
    line: number;
    snippet: string;
    dimension?: string;
    fixSuggestion?: string;
    suggestedFix?: string | null;
    reasoning?: {
        whatViolated: string;
        whyItMatters: string;
        suggestedFix: string | null;
    };
}
/** 每条规则的覆盖配置（支持数字阈值或富对象） */
interface RuleOverride {
    severity?: string;
    exclude?: string[];
}
interface GuardConfig {
    disabledRules?: string[];
    codeLevelThresholds?: Record<string, number | RuleOverride>;
}
interface GuardCheckEngineOptions {
    cacheTTL?: number;
    guardConfig?: GuardConfig;
    signalBus?: SignalBus;
    knowledgeRepo?: KnowledgeRepositoryImpl;
}
interface ExternalRuleInput {
    ruleId: string;
    pattern?: RegExp | string;
    severity?: string;
    message?: string;
    category?: string;
    dimension?: string;
    languages?: string[];
    fixSuggestion?: string;
}
interface AuditFileResult {
    filePath: string;
    language: string;
    violations: GuardViolation[];
    uncertainResults: UncertainResult[];
    summary: {
        total: number;
        errors: number;
        warnings: number;
        uncertain: number;
    };
}
interface AuditFilesInput {
    path: string;
    content: string;
    /** Pre-computed test file flag from LanguageService.isTestFile */
    isTest?: boolean;
}
export { detectLanguage } from './GuardPatternUtils.js';
/** GuardCheckEngine - 核心检查引擎 */
export declare class GuardCheckEngine {
    #private;
    _astRulesCache: GuardRule[] | null;
    _builtInRules: Record<string, BuiltInRule>;
    _cacheTTL: number;
    _cacheTime: number;
    _customRulesCache: GuardRule[] | null;
    _epInjected: boolean;
    _externalRules: Map<string, GuardRule>;
    _guardConfig: GuardConfig;
    _signalBus: SignalBus | null;
    /** 上次 guard 信号指纹，用于去重（相同结果不重复发射） */
    _lastGuardSignalKey: string;
    _lastBlindSpotSignalKey: string;
    _uncertaintyCollector: UncertaintyCollector;
    db: DatabaseLike;
    logger: ReturnType<typeof Logger.getInstance>;
    constructor(db: DatabaseLike | {
        getDb(): DatabaseLike;
    } | null, options?: GuardCheckEngineOptions);
    /**
     * 注入 Enhancement Pack 外部规则（支持 RegExp 和 string pattern）
     * 与 BUILT_IN_RULES 合并检查，自动跳过 ruleId 重复的规则
     * @param rules
     */
    injectExternalRules(rules: ExternalRuleInput[]): void;
    /** EP 注入幂等标记 — 调用者可用此判断是否已完成注入，避免重复加载 EnhancementRegistry */
    isEpInjected(): boolean;
    markEpInjected(): void;
    /** 获取所有启用的规则 (数据库 + 内置) */
    getRules(language?: string | null): GuardRule[];
    /**
     * 对代码运行静态检查
     * @param code 源代码
     * @param language 'objc'|'swift'|'javascript' 等
     * @param options {scope, filePath, isTest}
     * @returns >}
     */
    checkCode(code: string, language: string, options?: {
        scope?: string | null;
        filePath?: string;
        isTest?: boolean;
    }): {
        reasoning: {
            whatViolated: string;
            whyItMatters: string;
            suggestedFix: string | null;
        };
        ruleId: string;
        message: string;
        severity: string;
        line: number;
        snippet: string;
        dimension?: string;
        fixSuggestion?: string;
        suggestedFix?: string | null;
    }[];
    /**
     * AST 语义规则检查
     * 支持 3 种查询类型: mustCallThrough, mustNotUseInContext, mustConformToProtocol
     * 仅在 Tree-sitter 可用且语言为 ObjC/Swift 时执行
     * @param code 源代码
     * @param language 语言标识
     * @returns violations
     */
    _runAstRuleChecks(code: string, language: string): GuardViolation[];
    /**
     * AST Layer 2: analyzeFile() 深层检查
     *
     * 利用 AstAnalyzer.analyzeFile() 的完整输出产出 violations:
     *
     * --- 方法度量 ---
     *   - ast_class_bloat: 类方法数过多 (>30)
     *   - ast_method_complexity: 高圈复杂度 (>20)
     *   - ast_method_too_long: 方法行数过长 (>120)
     *   - ast_deep_nesting: 方法嵌套过深 (>6)
     *
     * --- 继承图检查 ---
     *   - ast_deep_inheritance: 继承链过深 (>4)
     *   - ast_wide_protocol_conformance: 单类遵守协议过多 (>5)
     *   - ast_missing_super: 子类未调用 super 的关键方法
     *
     * --- 属性规范 ---
     *   - ast_assign_object_property: ObjC assign 修饰对象类型属性
     *   - ast_missing_nonatomic: ObjC 属性缺少 nonatomic
     *   - ast_mutable_public_collection: 公开可变集合属性
     *
     * --- 设计模式/反模式检测 ---
     *   - ast_god_class: 方法+属性过多的上帝类 (>40 methods + >20 properties)
     *   - ast_singleton_abuse: 过多单例模式
     *   - ast_missing_weakify: block 内 self 捕获但未使用 weakify
     */
    _runAstLayer2Checks(code: string, language: string, filePath: string): GuardViolation[];
    /** 获取 AstAnalyzer 模块（静态 import，带可用性检测） */
    _getAstAnalyzer(): typeof AstAnalyzerModule;
    /**
     * 合并内置 + 配置级行排除模式，编译为 RegExp 数组
     * 配置来自 guardConfig.codeLevelThresholds[ruleId].exclude
     */
    _getExcludeLineRegexes(ruleId: string, builtIn?: string[]): RegExp[];
    /**
     * 将 Guard 命中计数回写到对应 Recipe 的 guard_hit_count
     * @param violations
     */
    trackGuardHits(violations: GuardViolation[]): void;
    /**
     * 文件审计 - 读取文件并检查
     * @param filePath 绝对路径
     * @param code 文件内容
     * @param options {scope}
     */
    auditFile(filePath: string, code: string, options?: {
        scope?: string;
        isTest?: boolean;
    }): AuditFileResult;
    /**
     * 批量文件审计
     * @param files
     * @param options {scope: 'file'|'target'|'project'}
     * @returns }
     */
    auditFiles(files: AuditFilesInput[], options?: {
        scope?: string;
    }): {
        files: AuditFileResult[];
        crossFileViolations: import("./GuardCrossFileChecks.js").CrossFileViolation[];
        summary: {
            filesChecked: number;
            testFiles: number;
            productionFiles: number;
            totalViolations: number;
            totalErrors: number;
            totalUncertain: number;
            filesWithViolations: number;
        };
        capabilityReport: import("./UncertaintyCollector.js").GuardCapabilityReport;
    };
    /** 获取 uncertainty collector（供外部读取单文件 uncertain 状态） */
    getUncertaintyCollector(): UncertaintyCollector;
    /** 清除规则缓存 */
    clearCache(): void;
    /** 获取内置规则列表 */
    getBuiltInRules(): {
        [x: string]: BuiltInRule;
    };
    /** 获取已注入的外部规则数量 */
    getExternalRuleCount(): number;
}
export default GuardCheckEngine;
