/**
 * ExclusionManager — Guard 规则排除策略管理
 * 三级排除: path（路径排除）、rule（规则在特定文件排除）、globalRule（全局禁用规则）
 * 持久化到 Alembic/guard-exclusions.json（Git 友好，跟随知识库提交）
 */
import type { WriteZone } from '../../infrastructure/io/index.js';
interface PathExclusion {
    pattern: string;
    reason: string;
    addedAt: string;
}
interface RuleExclusionEntry {
    filePath: string;
    reason: string;
    addedAt: string;
}
interface GlobalRuleExclusion {
    ruleId: string;
    reason: string;
    addedAt: string;
}
interface ExclusionMeta {
    reason?: string;
}
interface ViolationInput {
    ruleId?: string;
    filePath?: string;
}
interface ExclusionConfig {
    pathExclusions?: {
        pattern: string;
        reason?: string;
    }[];
    ruleExclusions?: Record<string, {
        filePath: string;
        reason?: string;
    }[]>;
    globalRuleExclusions?: {
        ruleId: string;
        reason?: string;
    }[];
}
export declare class ExclusionManager {
    #private;
    constructor(projectRoot: string, options?: {
        knowledgeBaseDir?: string;
        internalDir?: string;
        wz?: WriteZone;
    });
    /**
     * 添加路径排除 (glob 或精确路径)
     * @param meta
     */
    addPathExclusion(pattern: string, meta?: ExclusionMeta): void;
    /** 检查文件路径是否被排除 */
    isPathExcluded(filePath: string): boolean;
    /** 移除路径排除 */
    removePathExclusion(pattern: string): void;
    /** 为特定文件排除某条规则 */
    addRuleExclusion(ruleId: string, filePath: string, meta?: ExclusionMeta): void;
    /** 检查规则在特定文件是否被排除 */
    isRuleExcluded(ruleId: string, filePath: string): boolean;
    /** 移除文件级规则排除 */
    removeRuleExclusion(ruleId: string, filePath: string): void;
    /** 全局禁用某条规则 */
    addGlobalRuleExclusion(ruleId: string, meta?: ExclusionMeta): void;
    /** 检查规则是否被全局禁用 */
    isRuleGloballyDisabled(ruleId: string): boolean;
    /** 移除全局规则排除 */
    removeGlobalRuleExclusion(ruleId: string): void;
    /**
     * 应用排除策略到审计结果
     * @param violations [{ruleId, filePath, ...}]
     * @returns 过滤后的违反列表
     */
    applyExclusions(violations: ViolationInput[]): ViolationInput[];
    /** 导入排除配置 */
    importExclusions(config: ExclusionConfig): void;
    /** 导出当前排除配置 */
    exportExclusions(): {
        pathExclusions: PathExclusion[];
        ruleExclusions: Record<string, RuleExclusionEntry[]>;
        globalRuleExclusions: GlobalRuleExclusion[];
    };
}
export {};
