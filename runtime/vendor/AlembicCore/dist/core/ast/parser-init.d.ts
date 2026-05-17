/**
 * @module ast/parser-init
 * @description web-tree-sitter 初始化器
 *
 * 统一管理 WASM 版 Parser 的生命周期：
 *   1. 调用 Parser.init() 初始化 WASM 运行时（仅一次）
 *   2. 加载 .wasm 语法文件为 Language 对象
 *   3. 提供同步的 Parser 构造与语言设置 API
 *
 * 所有 async 操作（init + wasm 加载）集中在 loadPlugins() 阶段完成，
 * 下游 analyzeFile / findCallExpressions 等保持同步调用。
 */
/**
 * 初始化 web-tree-sitter WASM 运行时
 * 幂等 — 多次调用只执行一次
 */
export declare function initParser(): Promise<void>;
/** 获取 Parser 构造函数 */
export declare function getParserClass(): any;
/** 检查 parser 是否已初始化 */
export declare function isParserReady(): boolean;
/**
 * 从 resources/grammars/ 加载指定语言的 .wasm 文件
 * @param wasmFileName 如 'tree-sitter-javascript.wasm'
 * @returns Language 对象，失败返回 null
 */
export declare function loadLanguageWasm(wasmFileName: any): Promise<any>;
