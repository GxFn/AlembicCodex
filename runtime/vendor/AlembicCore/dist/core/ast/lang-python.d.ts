/**
 * @module lang-python
 * @description Python AST Walker 插件
 *
 * 提取: class, function, import, decorator, docstring, module-level assignments
 * 模式: Singleton, Factory, Context Manager, Decorator pattern, Data Class
 *
 * Phase 5: 新增 ImportRecord 结构化导入 + extractCallSites 调用点提取
 */
import { extractCallSitesPython } from '../analysis/CallSiteExtractor.js';
declare function walkPython(root: any, ctx: any): void;
declare function detectPyPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkPython;
    detectPatterns: typeof detectPyPatterns;
    extractCallSites: typeof extractCallSitesPython;
    extensions: string[];
};
export {};
