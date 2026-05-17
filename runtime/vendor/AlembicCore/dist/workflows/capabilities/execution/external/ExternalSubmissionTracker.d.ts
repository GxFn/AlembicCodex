/**
 * ExternalSubmissionTracker — 外部 Agent 提交追踪与质量评估
 *
 * 质量门控的外部 Agent 对应模块。
 * 内部 Agent 使用 EvidenceCollector 从 toolCall 中收集证据 (bootstrap-gate.js)，
 * 外部 Agent 使用 ExternalSubmissionTracker 从 knowledge 调用中积累证据。
 *
 * 职责:
 *   - 追踪每个维度的 knowledge 提交 (recipe 元数据 + 引用文件)
 *   - 从提交内容构建 evidenceMap (filePath → 引用摘要)
 *   - 从 dimension_complete 的 analysisText 提取负空间信号
 *   - 计算维度级质量评分 (对应 bootstrap-gate.js 的 buildQualityScores)
 *   - 为下游维度提供结构化跨维度证据
 *
 * 设计对应关系:
 *   内部 Agent                          外部 Agent
 *   ─────────────────                  ─────────────────
 *   EvidenceCollector.processToolCall  → recordSubmission
 *   evidenceMap (代码片段)              → evidenceMap (提交引用)
 *   negativeSignals (搜索未命中)        → negativeSignals (analysisText 提取)
 *   buildQualityScores (4维评分)        → buildQualityReport (4维评分)
 *   explorationLog (工具序列)           → submissionLog (提交序列)
 *
 * @module bootstrap/ExternalSubmissionTracker
 */
/** 一次 knowledge 提交的提交记录 */
interface SubmissionRecord {
    recipeId: string;
    title: string;
    knowledgeType: string;
    kind: string;
    category: string;
    sources: string[];
    coreCodePreview: string;
    contentLength: number;
    confidence: number;
    submittedAt: number;
}
/** 负空间信号 */
interface NegativeSignal {
    pattern: string;
    source: string;
    dimId?: string;
}
/** knowledge 提交原始参数中需要的字段 */
interface SubmissionArgs {
    title?: string;
    knowledgeType?: string;
    kind?: string;
    category?: string;
    trigger?: string;
    coreCode?: string;
    content?: {
        markdown?: string;
        [key: string]: unknown;
    };
    reasoning?: {
        sources?: string[];
        confidence?: number;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
/** 质量评分 4 维度 */
interface QualityScores {
    coverageScore: number;
    evidenceScore: number;
    diversityScore: number;
    coherenceScore: number;
}
/** 维度级质量报告 */
export interface DimensionQualityReport {
    scores: QualityScores;
    totalScore: number;
    suggestions: string[];
    pass: boolean;
}
/** 跨维度文件共享信息 */
interface SharedFileInfo {
    filePath: string;
    dimensions: string[];
}
/** 已完成维度摘要（供跨维度证据使用） */
interface CompletedDimSummary {
    dimId: string;
    submissionCount: number;
    titles: string[];
    knowledgeTypes: string[];
    referencedFiles: string[];
}
/** getAccumulatedEvidence 返回值 */
export interface AccumulatedEvidence {
    completedDimSummaries: CompletedDimSummary[];
    sharedFiles: SharedFileInfo[];
    negativeSignals: NegativeSignal[];
    usedTriggers: string[];
}
export declare class ExternalSubmissionTracker {
    #private;
    /**
     * 记录一次成功的 knowledge 提交
     *
     * @param dimId 当前活跃维度 (由调用方根据 session 进度推断)
     * @param submissionArgs knowledge 的原始参数
     * @param recipeId 提交成功后返回的 recipe ID
     */
    recordSubmission(dimId: string, submissionArgs: SubmissionArgs, recipeId: string): void;
    /**
     * 记录被拒绝的提交 (RecipeReadiness 或 dedup 拒绝)
     *
     * @param title 被拒绝候选的标题
     * @param reason 拒绝原因
     */
    recordRejection(dimId: string, title: string, reason: string): void;
    /**
     * 从 dimension_complete 的 analysisText 中提取负空间信号
     *
     * 识别模式:
     * - "未找到..." / "不存在..." / "没有发现..."
     * - "Not found" / "No evidence of" / "does not use"
     * - "项目未使用..." / "没有使用..."
     */
    extractNegativeSignals(analysisText: string, dimId: string): void;
    /**
     * 计算维度级质量报告
     *
     * 4 维度评分 (各 0-100, 加权总分):
     *   coverageScore  (30%) — 提交数量 + 引用文件覆盖
     *   evidenceScore  (30%) — 提交内容丰富度 (长度 + coreCode + confidence)
     *   diversityScore (20%) — 知识类型 + category 多样性
     *   coherenceScore (20%) — analysisText 结构化程度
     *
     * 与内部 Agent 的 buildQualityScores 对齐:
     *   内部 depthScore    → 外部 coverageScore
     *   内部 evidenceScore → 外部 evidenceScore
     *   内部 breadthScore  → 外部 diversityScore
     *   内部 coherenceScore → 外部 coherenceScore
     *
     * @param [analysisText] dimension_complete 提供的分析文本
     * @param [referencedFiles] 引用文件列表
     */
    buildQualityReport(dimId: string, analysisText?: string, referencedFiles?: string[]): DimensionQualityReport;
    /**
     * 获取跨维度累积证据摘要 — 供下一维度参考
     *
     * @param currentDimId 当前维度 (将排除在结果之外)
     * @returns { completedDimSummaries, sharedFiles, negativeSignals, usedTriggers }
     */
    getAccumulatedEvidence(currentDimId: string): AccumulatedEvidence;
    /** 获取指定维度的提交列表 */
    getSubmissions(dimId: string): SubmissionRecord[];
    /** 获取所有负空间信号 */
    getNegativeSignals(): NegativeSignal[];
    /** 获取全局文件证据地图 */
    getFileEvidenceMap(): Map<string, Set<string>>;
    /** 获取追踪统计 */
    getStats(): {
        dimensions: number;
        totalSubmissions: number;
        totalRejections: number;
        uniqueFiles: number;
        negativeSignals: number;
        usedTriggers: number;
    };
    /**
     * 获取所有已提交候选的标题集合（小写，用于跨维度硬去重）
     *
     * @param [excludeDimId] 可选，排除指定维度的标题
     * @returns Set<string> 小写标题集合
     */
    getAllSubmittedTitles(excludeDimId?: string): Set<string>;
    /**
     * 获取所有已使用 trigger 集合（小写，用于跨维度硬去重）
     */
    getAllSubmittedTriggers(): Set<string>;
}
export default ExternalSubmissionTracker;
