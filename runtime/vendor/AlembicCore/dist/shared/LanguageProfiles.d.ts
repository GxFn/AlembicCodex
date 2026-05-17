/**
 * LanguageProfiles — 全景分析多语言统一注册中心
 *
 * 设计原则:
 *   1. **语言族 (LanguageFamily)** 是核心抽象 — 同族语言共享 import 语法、框架类体系、生态库
 *   2. **单一数据源** — 新增语言只需添加一条 FamilyProfile，所有消费者自动生效
 *   3. **与 LanguageService 互补** — LanguageService 管理基础映射 (ext→lang)，
 *      LanguageProfiles 管理分析知识 (import 解析、角色推断、技术栈分类)
 *   4. **按关注点暴露 API** — 消费者调用自己需要的访问器，无需了解内部数据结构
 *
 * 消费者:
 *   - CouplingAnalyzer  → importPatterns, sourceExts
 *   - RoleRefiner        → familyOf, superclassRoles, protocolRoles, importRolePatterns
 *   - TechStackProfiler  → knownLibraries, keywordCategories
 *   - ModuleDiscoverer   → skipDirs, artifactSuffixes, vendorDirs, sourceExts
 *
 * @module LanguageProfiles
 */
/** 模块在软件架构中扮演的角色 */
export type ModuleRole = 'core' | 'service' | 'ui' | 'networking' | 'storage' | 'test' | 'app' | 'routing' | 'utility' | 'model' | 'auth' | 'config' | 'feature';
export type LanguageFamily = 'apple' | 'jvm' | 'dart' | 'python' | 'web' | 'go' | 'rust' | 'dotnet';
/** import 语句解析模式 — 用于依赖边提取 */
export interface ImportPattern {
    /** 匹配 import 语句的正则 (对 trimmed 行执行) */
    regex: RegExp;
    /** 从匹配结果提取模块名候选列表 */
    extract: (m: RegExpExecArray) => string[];
}
/** import 关键词 → 角色推断模式 */
export interface RolePattern {
    regex: RegExp;
    role: ModuleRole;
}
export declare class LanguageProfiles {
    /** 将规范化语言 ID 映射到语言族 */
    static familyOf(langId: string): LanguageFamily | undefined;
    /** 返回所有已注册的语言族 ID */
    static allFamilies(): LanguageFamily[];
    /** 根据主语言解析项目涉及的语言族 */
    static resolveFamilies(primaryLang: string | null): LanguageFamily[];
    /**
     * 获取所有 import 解析模式 (合并全部语言族 + C/C++)
     *
     * CouplingAnalyzer 对每行代码尝试所有模式，
     * 按「特异性递减」排列：最特殊的模式在前。
     */
    static get importPatterns(): readonly ImportPattern[];
    /**
     * 源代码文件扩展名集合 — 委托 LanguageService
     *
     * 消除 CouplingAnalyzer / ModuleDiscoverer 自建 SOURCE_EXTS 的重复。
     */
    static get sourceExts(): ReadonlySet<string>;
    /**
     * 合并指定语言族的超类→角色映射
     * @param families 项目检测到的语言族
     */
    static superclassRoles(families: LanguageFamily[]): Record<string, ModuleRole>;
    /**
     * 合并指定语言族的协议/接口→角色映射
     * @param families 项目检测到的语言族
     */
    static protocolRoles(families: LanguageFamily[]): Record<string, ModuleRole>;
    /**
     * 合并指定语言族的 import→角色模式 + 通用模式
     * @param families 项目检测到的语言族
     */
    static importRolePatterns(families: LanguageFamily[]): RolePattern[];
    /**
     * 获取全量已知库→分类映射 (合并所有族 + 跨平台库)
     *
     * TechStackProfiler 不按族过滤 — 外部依赖可能跨生态
     */
    static get knownLibraries(): Readonly<Record<string, string>>;
    /** 关键词启发式分类 — KNOWN_LIBRARIES 未命中时的 fallback */
    static get keywordCategories(): ReadonlyArray<[RegExp, string]>;
    /**
     * 应跳过的目录名集合 (合并 LanguageService.scanSkipDirs + 各族额外目录)
     */
    static get skipDirs(): ReadonlySet<string>;
    /** 构建产物后缀 (合并全部族) */
    static get artifactSuffixes(): readonly string[];
    /** Vendor / 第三方目录名集合 (合并通用 + 各族) */
    static get vendorDirs(): ReadonlySet<string>;
    /**
     * 三方库路径正则 — 匹配路径中的 vendor 目录名或已知库名
     *
     * 组成:
     *   1. vendorDirs + 常见 skip 目录 (Pods, Carthage, DerivedData, …)
     *   2. knownLibraries 中所有库名 (首字母大写形式)
     *
     * 用于 Agent 工具层对搜索结果做三方库过滤。
     */
    static get thirdPartyPathRegex(): RegExp;
    /**
     * 多语言基类/根类型排除集 — 合并所有族的 superclassRoles + protocolRoles + 额外基础类型。
     *
     * 用于 getHotNodes() 等入度统计，排除高入度但无信息量的语言根类型。
     * 新增语言族时自动生效，无需手动维护排除列表。
     */
    static get baseClassExclusions(): ReadonlySet<string>;
    /**
     * 合法代码语言集合 — 合并 LanguageService.knownLangs + 常见别名。
     *
     * QualityScorer 格式评分使用，判断 recipe 的 language 字段是否合法。
     * 新增语言时只需在 LanguageService 添加，此处自动生效。
     */
    static get validCodeLanguages(): ReadonlySet<string>;
}
