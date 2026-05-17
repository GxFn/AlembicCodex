/**
 * DimensionSop — 维度分析 SOP（Standard Operating Procedure）
 *
 * 每个维度定义 3 个自定义分析阶段 + 自动生成的提交阶段。
 * Builder 模式消除 Phase 4 重复 & 共享质量检查清单。
 */
/** 完整 SOP 步骤（消费者使用的形状） */
export interface FullSopStep {
    phase: string;
    action: string;
    expectedOutput?: string;
    tools?: string[];
    qualityChecklist?: string[];
    [key: string]: unknown;
}
/** 完整 SOP 对象（消费者使用的形状） */
export interface FullSop {
    focusKeywords?: string[];
    steps: FullSopStep[];
    timeEstimate: string;
    commonMistakes: string[];
    [key: string]: unknown;
}
/**
 * 提交前全局质量检查清单（跨所有维度通用）
 * 消费者: MissionBriefingBuilder.ts — 嵌入 submissionSpec
 */
export declare const PRE_SUBMIT_CHECKLIST: {
    readonly MUST: readonly ["title: 中文 ≤20 字，引用项目真实类名或模式名（不以项目名开头）", "description: 中文简述 ≤80 字", "trigger: @前缀 kebab-case 唯一标识符", "kind: rule | pattern | fact（必须选一）", "content.markdown: ≥200 字符的项目特写，含代码块+来源标注 (来源: FileName.ext:行号)", "content.rationale: 设计原理说明", "coreCode: 3-8 行纯代码骨架，语法完整可复制", "headers: import 语句数组（无则 []）", "doClause: 英文祈使句 ≤60 tokens，以动词开头", "dontClause: 英文反向约束", "whenClause: 英文触发场景描述", "reasoning.whyStandard + reasoning.sources（非空文件列表）", "sourceRefs: 引用的源文件列表", "usageGuide: ### 使用指南 格式"];
    readonly SHOULD: readonly ["每个候选只聚焦单一知识点 — 不要合并不同模式", "content 中使用 ✅ / ❌ 对比正确写法和禁止写法", "coreCode 使用项目实际的代码而非伪代码", "description 提及影响范围（全局 / 某层 / 某模块）", "tags 包含有意义的搜索关键词", "confidence ≥0.85 才提交"];
    readonly FAIL_EXAMPLES: readonly [{
        readonly bad: "title: '项目使用了 MVVM 模式'";
        readonly good: "title: 'ViewModel 的 Output 必须通过 Driver 转换'";
        readonly why: "title 必须具体到可执行的规则，不能是泛泛的描述";
    }, {
        readonly bad: "content.markdown: '本项目使用 RxSwift 进行响应式编程。'";
        readonly good: "content.markdown: '## ViewModel Output 转换规范\\n\\n所有 ViewModel 的 Output 统一使用...(来源: HomeViewModel.swift:45)'";
        readonly why: "content 必须 ≥200 字符，包含项目特有的实现细节和代码引用";
    }];
};
/**
 * 获取指定维度的完整 SOP
 * @returns FullSop | undefined
 */
export declare function getDimensionSOP(dimId: string): FullSop | undefined;
/**
 * 获取维度的关注关键词（用于 EpisodicMemory 跨维度匹配）
 * 优先使用 SOP 中定义的 focusKeywords，fallback 到从 guideText 解析
 */
export declare function getDimensionFocusKeywords(dimId: string, guideText?: string): string[];
/**
 * 将 SOP / analysisGuide 压缩为纯文本（用于 Level 5 极致压缩模式）
 * 接受 analysisGuide 对象（含 steps + commonMistakes 字段）
 */
export declare function sopToCompactText(guide: Record<string, unknown>): string;
