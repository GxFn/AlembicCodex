/**
 * GuardCrossFileChecks - Guard 跨文件检查
 *
 * 从 GuardCheckEngine._runCrossFileChecks 拆分
 * 包含: 跨文件规则检查 + 路径归一化工具
 */
/**
 * 解析相对 import 路径为归一化路径（去掉扩展名）
 * @param fromDir 当前文件目录
 * @param importPath 相对路径如 './foo' 或 '../bar/baz'
 */
export declare function resolveImportPath(fromDir: string, importPath: string): string | null;
/** 归一化文件路径（去扩展名，用于 import 比较） */
export declare function normalizeFilePath(filePath: string): string;
/**
 * 跨文件检查 — 需要多文件上下文才能发现的问题
 * @param files
 * @param [options.disabledRules] 禁用的规则 ID 列表
 * @returns >}
 */
export interface CrossFileViolation {
    ruleId: string;
    message: string;
    severity: string;
    locations: {
        filePath: string;
        line: number;
        snippet: string;
    }[];
}
export declare function runCrossFileChecks(files: {
    path: string;
    content: string;
}[], options?: {
    disabledRules?: string[];
}): CrossFileViolation[];
