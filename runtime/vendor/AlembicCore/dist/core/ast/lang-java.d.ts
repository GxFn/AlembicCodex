/**
 * @module lang-java
 * @description Java AST Walker 插件
 *
 * 提取: class, interface, enum, record, method, field, import, annotation
 * 模式: Singleton, Builder, Factory, DI, Stream Pipeline
 */
declare function walkJava(root: any, ctx: any): void;
declare function detectJavaPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
/**
 * 从 Java AST root 提取所有调用点
 * 遍历 method_declaration / constructor_declaration 中的 block → method_invocation / object_creation_expression
 */
declare function extractCallSitesJava(root: any, ctx: any, _lang: any): void;
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkJava;
    detectPatterns: typeof detectJavaPatterns;
    extractCallSites: typeof extractCallSitesJava;
    extensions: string[];
};
export {};
