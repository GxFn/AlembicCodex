/**
 * ASTChunker — 基于 AST 的语法感知代码分块
 *
 * 利用 web-tree-sitter 按函数/类/方法边界分块:
 * - 保持语义完整性 (不在函数/类中间截断)
 * - 超大节点递归拆分
 * - 自动携带结构元数据 (nodeType, name, startLine, endLine)
 *
 * 支持语言: JavaScript, TypeScript, Python, Java, Kotlin, Go, Swift,
 *           Rust, Dart, ObjC (取决于已加载的 tree-sitter grammar)
 *
 * @module infrastructure/vector/ASTChunker
 */
/**
 * 各语言的顶层可分块 AST 节点类型
 * 这些节点通常代表独立的代码单元 (函数/类/方法/接口等)
 */
declare const TOP_LEVEL_TYPES: Set<string>;
/**
 * 语言 ID → tree-sitter langId 映射
 * LanguageService.inferLang() 返回的 id 可能不完全匹配 AST 插件注册的 langId
 */
declare const LANG_ID_MAP: {
    javascript: string;
    typescript: string;
    tsx: string;
    python: string;
    java: string;
    kotlin: string;
    go: string;
    swift: string;
    rust: string;
    dart: string;
    objectivec: string;
    'objective-c': string;
    objc: string;
};
/**
 * 初始化 AST 解析器 (幂等, 延迟加载)
 * @returns 是否成功初始化
 */
declare function ensureParser(): Promise<boolean>;
/**
 * 检查 ASTChunker 是否支持指定语言
 * @param language LanguageService.inferLang() 返回的语言 ID
 */
export declare function isASTChunkerAvailable(language: string): boolean;
/**
 * 按 AST 节点边界分块
 *
 * 策略:
 * 1. 解析源代码为 AST
 * 2. 提取根节点的直接子节点中的顶层声明 (函数/类/方法/接口等)
 * 3. 小于 maxChunkTokens 的节点作为单独 chunk
 * 4. 超大节点递归拆分 (按子节点边界)
 * 5. 非声明代码 (import, 注释等) 合并为一个 chunk
 *
 * @param content 源代码
 * @param language 语言标识 (来自 LanguageService.inferLang)
 * @param metadata 基础 metadata
 * @returns >}
 */
export declare function chunkByAST(content: string, language: string, metadata?: Record<string, unknown>, options?: {
    maxChunkTokens?: number;
}): {
    content: string;
    metadata: Record<string, unknown>;
}[] | null;
export { ensureParser, TOP_LEVEL_TYPES, LANG_ID_MAP };
