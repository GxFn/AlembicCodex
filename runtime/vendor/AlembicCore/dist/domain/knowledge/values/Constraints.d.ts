/**
 * Constraints — 约束值对象
 *
 * 包含 Guard 规则 (regex + ast)、边界约束、前置条件、副作用。
 * Guard 规则预留 AST 类型，为语义规则做前瞻设计。
 */
export interface Guard {
    id: string | null;
    type: 'regex' | 'ast';
    pattern: string | null;
    ast_query: Record<string, unknown> | null;
    message: string;
    severity: 'error' | 'warning' | 'info';
    fix_suggestion: string | null;
}
interface ConstraintsProps {
    guards?: Array<Record<string, unknown>>;
    boundaries?: string[];
    preconditions?: string[];
    sideEffects?: string[];
}
export declare class Constraints {
    boundaries: string[];
    guards: Guard[];
    preconditions: string[];
    sideEffects: string[];
    constructor(props?: ConstraintsProps);
    /** 从任意输入构造 Constraints */
    static from(input: unknown): Constraints;
    /** 标准化 Guard 对象 */
    static _normalizeGuard(g: Record<string, unknown>): Guard;
    /** 获取 regex 类型的 Guard 规则 */
    getRegexGuards(): Guard[];
    /** 获取 ast 类型的 Guard 规则 */
    getAstGuards(): Guard[];
    /** 添加 Guard 规则 */
    addGuard(guard: Record<string, unknown>): Constraints;
    /** 是否有 Guard 规则 */
    hasGuards(): boolean;
    /** 是否为空 */
    isEmpty(): boolean;
    /** 转换为 wire format JSON */
    toJSON(): {
        guards: Guard[];
        boundaries: string[];
        preconditions: string[];
        sideEffects: string[];
    };
    /** 从 wire format 创建 */
    static fromJSON(data: unknown): Constraints;
}
export type { Guard as GuardType };
export default Constraints;
