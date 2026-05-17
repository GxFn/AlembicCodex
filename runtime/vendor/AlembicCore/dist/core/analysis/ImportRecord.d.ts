/**
 * @module ImportRecord
 * @description 增强的 Import 记录 - 对外表现类似 string，内部携带结构化元信息。
 *
 * Phase 5: 跨文件调用链分析的基础数据结构。
 *
 * 兼容性保证:
 *   - imp.includes('express')     ✅  (includes 方法代理到 path)
 *   - `${imp}`                     ✅  (toString 返回 path)
 *   - imp.startsWith('./')         ✅  (同上代理)
 *   - JSON.stringify(imp)          ✅  (toJSON 返回 path)
 *   - typeof imp === 'object'      ⚠️  不再是 'string'
 *
 * @example
 *   const rec = new ImportRecord('./UserRepo', { symbols: ['UserRepo'], kind: 'named' });
 *   rec.includes('User');   // true
 *   `${rec}`;               // './UserRepo'
 *   rec.symbols;            // ['UserRepo']
 */
export interface ImportRecordMeta {
    symbols?: string[];
    alias?: string | null;
    kind?: 'named' | 'default' | 'namespace' | 'side-effect' | 'dynamic';
    isTypeOnly?: boolean;
}
export declare class ImportRecord {
    alias: string | null;
    isTypeOnly: boolean;
    kind: 'named' | 'default' | 'namespace' | 'side-effect' | 'dynamic';
    path: string;
    symbols: string[];
    /**
     * @param path 导入路径原始字符串
     * @param [meta.symbols] 导入的符号名 e.g. ['UserRepo', 'findById'] 或 ['*']
     * @param [meta.alias] 导入别名 e.g. import { UserRepo as Repo }
     * @param [meta.kind] 导入方式
     * @param [meta.isTypeOnly] 是否为类型导入 (TypeScript)
     */
    constructor(path: string, meta?: ImportRecordMeta);
    toString(): string;
    includes(s: string): boolean;
    startsWith(s: string): boolean;
    endsWith(s: string): boolean;
    indexOf(s: string): number;
    replace(a: string | RegExp, b: string): string;
    match(re: RegExp): RegExpMatchArray | null;
    split(sep: string | RegExp): string[];
    trim(): string;
    toJSON(): string;
    get length(): number;
    valueOf(): string;
    /** 是否具有结构化符号信息 */
    get isStructured(): boolean;
    /** 检查是否导入了指定符号名 */
    hasSymbol(symbolName: string): boolean;
}
export default ImportRecord;
