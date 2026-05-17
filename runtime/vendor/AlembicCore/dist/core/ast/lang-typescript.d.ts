/**
 * @module lang-typescript
 * @description TypeScript AST Walker 插件
 *
 * 提取: class, interface, type alias, enum, function, method, property, import, export
 * 模式检测: Singleton, Factory, Observer, React Hook/Component, Middleware, Decorator
 *
 * Phase 5: 新增 ImportRecord 结构化导入 + extractCallSites 调用点提取
 */
import { extractCallSitesTS } from '../analysis/CallSiteExtractor.js';
declare function walkTypeScript(root: any, ctx: any): void;
declare function detectTSPatterns(root: any, lang: any, methods: any, properties: any, classes: any): any[];
declare function getGrammar(): any;
export declare function setGrammar(grammar: any): void;
export declare const plugin: {
    getGrammar: typeof getGrammar;
    walk: typeof walkTypeScript;
    detectPatterns: typeof detectTSPatterns;
    extractCallSites: typeof extractCallSitesTS;
    extensions: string[];
};
declare function getTsxGrammar(): any;
export declare function setTsxGrammar(grammar: any): void;
export declare const tsxPlugin: {
    getGrammar: typeof getTsxGrammar;
    walk: typeof walkTypeScript;
    detectPatterns: typeof detectTSPatterns;
    extractCallSites: typeof extractCallSitesTS;
    extensions: string[];
};
export {};
