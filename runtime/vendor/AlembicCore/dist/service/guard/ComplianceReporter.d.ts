/**
 * ComplianceReporter — 全项目 Guard 合规报告生成
 *
 * 依赖:
 *   - GuardCheckEngine.auditFiles() — 原始 violations 数据
 *   - ViolationsStore — 历史统计 & 趋势
 *   - RuleLearner — 规则 P/R/F1
 *   - ExclusionManager — 排除项（不计入合规分）
 *   - config.qualityGate — 阈值配置
 *
 * 输出:
 *   ComplianceReport { qualityGate, summary, topViolations, fileHotspots, ruleHealth, trend }
 */
import Logger from '../../infrastructure/logging/Logger.js';
interface ViolationSummary {
    errors: number;
    warnings: number;
    infos?: number;
    total?: number;
    filesScanned?: number;
    totalViolations?: number;
}
interface RuleHealthEntry {
    ruleId: string;
    precision: number;
    recall: number;
    f1: number;
    triggers: number;
    warning: string | null;
}
interface QualityGateThresholds {
    maxErrors?: number;
    maxWarnings?: number;
    minScore?: number;
}
interface GuardCheckEngineLike {
    auditFiles(files: {
        path: string;
        content: string;
    }[], options: {
        scope: string;
    }): {
        files: {
            filePath: string;
            violations: ViolationItem[];
            uncertainResults?: {
                ruleId: string;
                message: string;
                layer: string;
                reason: string;
                detail: string;
            }[];
            summary: ViolationSummary & {
                uncertain?: number;
            };
        }[];
        crossFileViolations: ViolationItem[];
        capabilityReport?: {
            checkCoverage: number;
            uncertainResults: {
                ruleId: string;
                message: string;
                layer: string;
                reason: string;
                detail: string;
            }[];
            boundaries: {
                type: string;
                description: string;
                affectedRules: string[];
                suggestedAction: string;
            }[];
        };
    };
    /** Enhancement Pack 注入（可选，引擎不一定暴露） */
    isEpInjected?(): boolean;
    injectExternalRules?(rules: unknown[]): void;
    markEpInjected?(): void;
}
interface ViolationItem {
    ruleId: string;
    severity: string;
    message: string;
    line?: number;
    snippet?: string;
    fixSuggestion?: string;
    filePath?: string;
}
interface ViolationsStoreLike {
    appendRun(run: {
        filePath: string;
        violations: ViolationItem[];
        summary: string;
    }): string;
    getTrend(): {
        errorsChange: number;
        warningsChange: number;
        hasHistory: boolean;
    };
}
interface RuleLearnerLike {
    getAllStats(): Record<string, {
        triggers: number;
        metrics?: {
            precision?: number;
            recall?: number;
            f1?: number;
        };
    }>;
}
interface ExclusionManagerLike {
    isPathExcluded?(filePath: string): boolean;
    isRuleExcluded?(ruleId: string, filePath: string): boolean;
}
export declare class ComplianceReporter {
    #private;
    engine: GuardCheckEngineLike;
    exclusionManager: ExclusionManagerLike | null;
    logger: ReturnType<typeof Logger.getInstance>;
    qualityGateConfig: Required<QualityGateThresholds>;
    ruleLearner: RuleLearnerLike | null;
    violationsStore: ViolationsStoreLike | null;
    /** @param qualityGateConfig { maxErrors, maxWarnings, minScore } */
    constructor(guardCheckEngine: GuardCheckEngineLike, violationsStore: ViolationsStoreLike | null, ruleLearner: RuleLearnerLike | null, exclusionManager: ExclusionManagerLike | null, qualityGateConfig?: QualityGateThresholds, signalBus?: import('../../infrastructure/signal/SignalBus.js').SignalBus | null);
    /**
     * 生成全项目合规报告
     * @param projectRoot 项目根目录
     * @param [options.qualityGate] 覆盖默认的 Quality Gate 阈值
     * @param [options.maxFiles] 最大扫描文件数
     */
    generate(projectRoot: string, options?: {
        qualityGate?: QualityGateThresholds;
        maxFiles?: number;
    }): Promise<{
        timestamp: string;
        projectRoot: string;
        qualityGate: {
            status: string;
            score: number;
            thresholds: {
                maxErrors: number;
                maxWarnings: number;
                minScore: number;
            };
        };
        complianceScore: number;
        coverageScore: number;
        confidenceScore: number;
        uncertainSummary: {
            total: number;
            byLayer: Record<string, number>;
            byReason: Record<string, number>;
        };
        recentViolationCount: number;
        boundaries: {
            type: string;
            description: string;
            affectedRules: string[];
            suggestedAction: string;
        }[];
        summary: {
            filesScanned: number;
            totalViolations: number;
            errors: number;
            warnings: number;
            infos: number;
        };
        topViolations: any[];
        fileHotspots: {
            filePath: string;
            violationCount: number;
            errorCount: number;
        }[];
        ruleHealth: RuleHealthEntry[];
        trend: {
            errorsChange: number;
            warningsChange: number;
            hasHistory: boolean;
        };
    }>;
    /**
     * 终端格式化输出报告
     * @param report generate() 产出的报告
     * @param options { format: 'text' | 'markdown' | 'json' }
     */
    printReport(report: Record<string, unknown>, options?: {
        format?: string;
    }): void;
    _printText(report: Record<string, unknown>): void;
    _printMarkdown(report: Record<string, unknown>): void;
}
export default ComplianceReporter;
