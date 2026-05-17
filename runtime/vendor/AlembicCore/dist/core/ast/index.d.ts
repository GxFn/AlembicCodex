/**
 * @module ast/index
 * @description 语言 AST 插件自动加载器（web-tree-sitter WASM 版）
 *
 * 初始化流程:
 *   1. 调用 initParser() — 初始化 web-tree-sitter WASM 运行时
 *   2. 并行加载所有 .wasm 语法文件
 *   3. 将 Language 对象注入每个 lang-*.js 插件
 *   4. 注册到 AstAnalyzer
 *
 * .wasm 文件位于 resources/grammars/，随 npm 包一起发布。
 * 不再依赖原生 tree-sitter 编译，任何平台即装即用。
 *
 * 使用方式:
 *   import '../core/ast/index.js';  // 副作用: 注册所有可用语言插件
 *
 * 或按需:
 *   import { loadPlugins } from '../core/ast/index.js';
 *   await loadPlugins();
 */
/**
 * 重置加载标志，允许 loadPlugins() 再次执行
 * 仅由 ensure-grammars.js 在安装新包后调用
 */
export declare function _resetForReload(): void;
/**
 * 加载并注册所有可用的语言 AST 插件
 * 幂等 — 多次调用只执行一次
 */
export declare function loadPlugins(): Promise<void>;
