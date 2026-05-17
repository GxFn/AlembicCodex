/**
 * @module lang-dart
 * @description Dart AST Walker 插件
 *
 * 提取: class, mixin, extension, enum, typedef, function, method, field, import
 * 模式: Flutter Widget (Stateless/Stateful/Consumer), Factory, Singleton,
 *        Builder, BLoC/Cubit, Provider/Riverpod, Freezed
 *
 * Phase 5: 新增 ImportRecord 结构化导入 + extractCallSites 调用点提取
 *
 * 注意: tree-sitter-dart 目前尚无兼容 tree-sitter ≥0.25 的稳定版。
 *       已迁移至 web-tree-sitter (WASM)，无原生编译依赖。
 */
declare function walkDart(root: any, ctx: any): void;
declare function detectDartPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
/**
 * 从 Dart AST root 提取所有调用点
 * 遍历 function_definition / method 中的 body → 各种 invocation 节点
 */
declare function extractCallSitesDart(root: any, ctx: any, _lang: any): void;
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkDart;
    detectPatterns: typeof detectDartPatterns;
    extractCallSites: typeof extractCallSitesDart;
    extensions: string[];
};
export {};
