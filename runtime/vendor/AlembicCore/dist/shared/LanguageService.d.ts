/**
 * @module LanguageService
 * @description 统一语言服务 - 项目中唯一的语言映射与检测来源
 *
 * 所有文件扩展名→语言映射、扩展名→显示名、主语言推断都必须通过此服务。
 * 禁止在业务代码中自建 langMap / _inferLang。
 *
 * ---
 * 使用方式：
 *   import { LanguageService } from '../shared/LanguageService.js';
 *   const lang = LanguageService.inferLang('App.swift');      // 'swift'
 *   const display = LanguageService.displayName('swift');       // 'Swift'
 *   const primary = LanguageService.detectPrimary(langStats);   // 'typescript'
 *   const langs  = LanguageService.detectProjectLanguages('/path/to/project');
 */
export declare class LanguageService {
    /**
     * 从文件名（或路径）推断规范化语言 ID
     * @returns 语言 ID，如 'swift', 'typescript', 'python', 'unknown'
     */
    static inferLang(filename: string): string;
    /**
     * 从文件扩展名（带 dot）推断语言
     * @param ext 如 '.ts', '.py'
     */
    static langFromExt(ext: string): string;
    /**
     * 将语言 ID 别名/缩写归一化为规范 ID
     *
     * 示例:
     *   normalize('objc')     → 'objectivec'
     *   normalize('ts')       → 'typescript'
     *   normalize('golang')   → 'go'
     *   normalize('swift')    → 'swift' (已是规范 ID)
     *   normalize('unknown')  → 'unknown'
     *
     * @param langId 语言 ID（可能是别名）
     * @returns 规范化语言 ID
     */
    static normalize(langId: string): string;
    /**
     * 将规范语言 ID 转为 Guard 兼容 ID
     *
     * Guard 内置规则使用 'objc' 而非 'objectivec'。
     * 其他语言 ID 不变。
     */
    static toGuardLangId(langId: string): string;
    /** 语言 ID → 人类可读名称 */
    static displayName(langId: string): string;
    /**
     * 文件扩展名（带 dot）→ 人类可读语言名
     * @param ext 如 '.swift', '.ts'
     */
    static displayNameFromExt(ext: string): string;
    /**
     * 从文件扩展名统计推断主语言
     * @param langStats key = 裸扩展名 (如 'ts', 'm', 'py')，value = 文件数
     * @returns 主语言 ID
     */
    static detectPrimary(langStats: Record<string, number>): string;
    /**
     * 从文件扩展名统计返回所有检测到的编程语言（按文件数降序）
     * @returns >}
     */
    static detectAll(langStats: Record<string, number>): {
        lang: string;
        count: number;
    }[];
    /**
     * 多语言项目画像 — 返回主语言 + 次要语言 + 完整排序列表
     *
     * 与 detectPrimary 的区别:
     *   - detectPrimary 只给出一个语言，适用于需要单值场景
     *   - detectProfile 给出完整画像，适用于维度文案、AI prompt 等需要
     *     感知多语言的场景
     *
     * @param langStats key=裸扩展名, value=文件数
     * @param [opts.secondaryThreshold=0.1] 次要语言文件占比阈值（≥此比例才算次要语言）
     * @returns >, totalFiles: number, isMultiLang: boolean }}
     */
    static detectProfile(langStats: Record<string, number>, opts?: {
        secondaryThreshold?: number;
    }): {
        primary: string;
        secondary: string[];
        all: {
            ratio: number;
            lang: string;
            count: number;
        }[];
        totalFiles: number;
        isMultiLang: boolean;
    };
    /** 该语言 ID 是否是已知编程语言 */
    static isKnownLang(langId: string): boolean;
    /**
     * 该扩展名是否为源代码文件
     * @param ext 带 dot，如 '.ts'
     */
    static isSourceExt(ext: string): boolean;
    /** 获取所有源代码扩展名（不可变） */
    static get sourceExts(): Readonly<Set<string>>;
    /**
     * 匹配源代码文件扩展名的正则（缓存 / 从 sourceExts 自动派生）
     *
     * 示例: `/\.(m|mm|swift|h|ts|tsx|py|...)$/i`
     */
    static get sourceExtRegex(): RegExp;
    /** 获取所有已知编程语言 ID（不可变） */
    static get knownLangs(): Readonly<Set<string>>;
    /** 编程语言通用关键字集合（代码标识符提取时排除保留字） */
    static get languageKeywords(): Readonly<Set<string>>;
    /** 获取完整的 ext→lang 映射（不可变） */
    static get extToLangMap(): Record<string, string>;
    /** 获取完整的 bareExt→lang 映射（不可变） */
    static get bareExtToLangMap(): Record<string, string>;
    /**
     * 根据语言 ID 返回主扩展名（带 dot）
     * @param langId 如 'go', 'swift', 'python'
     * @returns 如 '.go', '.swift', '.py'；未知返回 null
     */
    static extForLang(langId: string): string | null;
    /** 获取语言别名映射表（不可变） */
    static get langAliases(): Record<string, string>;
    /** 获取 ECO_TO_LANGS 映射（不可变） */
    static get ecoToLangs(): Record<string, readonly string[]>;
    /** 获取 BUILD_SYSTEM_MARKERS（不可变） */
    static get buildSystemMarkers(): readonly {
        file: string;
        eco: string;
        buildTool: string;
    }[];
    /** 获取 SCAN_SKIP_DIRS（不可变） */
    static get scanSkipDirs(): Readonly<Set<string>>;
    /**
     * 根据生态系统/Discoverer ID 获取对应的语言 ID 数组
     * @param ecoId 如 'spm', 'node', 'rust', 'dart'
     */
    static langsForEco(ecoId: string): readonly string[];
    /**
     * 检测构建系统标志文件 — 纯数据匹配，不访问文件系统
     *
     * @param entryNames 目录内文件/目录名列表
     * @returns >}
     */
    static matchBuildMarkers(entryNames: string[]): {
        eco: string;
        buildTool: string;
    }[];
    /**
     * 检测项目使用的编程语言 — 统一入口
     *
     * 策略（按优先级）：
     *   1. 若传入 discovererIds（来自 ModuleService），直接映射为语言
     *   2. 否则扫描项目目录的构建系统标记文件（支持 monorepo 多层扫描）
     *
     * @param projectRoot 项目根目录绝对路径
     * @param [opts.discovererIds] ModuleService 检测到的生态 ID
     * @param [opts.maxDepth=2] 最大扫描深度：0=仅根目录，1=+子目录，2=+孙目录
     * @returns 规范化语言 ID 数组（如 ['rust', 'dart']）
     */
    static detectProjectLanguages(projectRoot: string, opts?: {
        discovererIds?: string[];
        maxDepth?: number;
    }): unknown[];
    /**
     * 判定文件路径是否为测试文件
     *
     * 两层判定：
     *   1. 语言特定的文件名模式（_test.go, .test.ts, test_*.py 等）
     *   2. 通用测试目录模式（test/, tests/, __tests__/, spec/ 等）
     *
     * @param filePath 文件路径（相对或绝对均可）
     * @param [language] 已知语言 ID，省略时从扩展名推断
     * @returns 是否为测试文件
     */
    static isTestFile(filePath: string, language?: string): boolean;
}
export default LanguageService;
