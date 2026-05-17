/**
 * UncertaintyCollector — Guard uncertain 三态收集器
 *
 * 当 Guard 各层检测遇到能力边界（AST 不可用、跨文件缺失、正则冲突等）时，
 * 收集 skip 原因并产出结构化的 uncertain 结果。
 *
 * 设计原则:
 *   - uncertain 不是"错误"，是"承认能力边界"
 *   - Guard 不调用 AI，uncertain 是确定性输出
 *   - 保持 <10ms 性能
 */
export type SkipLayer = 'regex' | 'code_level' | 'ast' | 'cross_file';
export type SkipReason = 'invalid_regex' | 'lang_unsupported' | 'ast_unavailable' | 'file_missing' | 'scope_mismatch' | 'layer_conflict';
export type SkipImpact = 'high' | 'medium' | 'low';
export interface SkippedCheck {
    layer: SkipLayer;
    ruleId?: string;
    reason: SkipReason;
    detail: string;
    impact: SkipImpact;
}
export type BoundaryType = 'ast_language_gap' | 'cross_file_incomplete' | 'rule_regex_invalid' | 'scope_unchecked' | 'transitive_cycle';
export interface CapabilityBoundary {
    type: BoundaryType;
    description: string;
    affectedRules: string[];
    suggestedAction: string;
}
export interface UncertainResult {
    ruleId: string;
    message: string;
    layer: SkipLayer;
    reason: SkipReason;
    detail: string;
}
export interface GuardCapabilityReport {
    executedChecks: {
        regex: {
            total: number;
            executed: number;
            skipped: number;
        };
        codeLevel: {
            total: number;
            executed: number;
            skipped: number;
        };
        ast: {
            total: number;
            executed: number;
            skipped: number;
        };
        crossFile: {
            total: number;
            executed: number;
            skipped: number;
        };
    };
    skippedChecks: SkippedCheck[];
    boundaries: CapabilityBoundary[];
    uncertainResults: UncertainResult[];
    checkCoverage: number;
}
export declare class UncertaintyCollector {
    #private;
    /** 记录某个规则在某层被跳过 */
    recordSkip(layer: SkipLayer, reason: SkipReason, detail: string, options?: {
        ruleId?: string;
        impact?: SkipImpact;
    }): void;
    /** 追加一条 uncertain 结果 */
    addUncertain(ruleId: string, message: string, layer: SkipLayer, reason: SkipReason, detail: string): void;
    /** 记录各层的检查总数和执行数 */
    recordLayerStats(layer: SkipLayer, total: number, executed: number): void;
    /** 生成能力报告 */
    buildReport(): GuardCapabilityReport;
    /** 获取 uncertain 结果数量 */
    get uncertainCount(): number;
    /** 获取 skipped 总数 */
    get skippedCount(): number;
    /** 重置状态（供多文件审计复用） */
    reset(): void;
}
