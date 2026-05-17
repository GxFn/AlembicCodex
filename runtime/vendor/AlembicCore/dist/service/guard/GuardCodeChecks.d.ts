/**
 * GuardCodeChecks - Guard 代码级别检查（跨行 / 配对检查）
 *
 * 从 GuardCheckEngine._runCodeLevelChecks 拆分
 * 按语言分发到各自的检查逻辑，不依赖正则规则
 */
/**
 * 代码级别检查 - 需要上下文理解的检查（跨行 / 配对检查）
 * 按语言分发到各自的检查逻辑
 * 支持 disabledRules 禁用特定检查、codeLevelThresholds 调整阈值
 *
 * @param code 源代码
 * @param language 语言标识
 * @param lines 按行拆分的源代码
 * @param [options.disabledRules] 禁用的规则 ID 列表
 * @param [options.codeLevelThresholds] 可配置阈值
 * @returns >}
 */
interface CodeLevelViolation {
    ruleId: string;
    message: string;
    severity: string;
    line: number;
    snippet: string;
    dimension?: string;
    fixSuggestion?: string;
}
export declare function runCodeLevelChecks(code: string, language: string, lines: string[], options?: {
    disabledRules?: string[];
    codeLevelThresholds?: Record<string, number>;
}): CodeLevelViolation[];
export {};
