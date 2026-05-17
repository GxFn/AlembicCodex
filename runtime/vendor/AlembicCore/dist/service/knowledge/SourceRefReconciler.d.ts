/**
 * SourceRefReconciler — Recipe 来源引用健康检查 + 自动修复
 *
 * 从 knowledge_entries.reasoning.sources 填充 recipe_source_refs 桥接表，
 * 验证路径存在性，检测 git rename，修复路径引用。
 *
 * 状态机:
 *   active  — 文件存在，路径有效
 *   renamed — 文件已移动到 new_path，等待修复
 *   stale   — 路径失效，无法自动修复
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { RecipeSourceRefRepositoryImpl } from '../../repository/sourceref/RecipeSourceRefRepository.js';
export interface ReconcileReport {
    /** 新插入的 sourceRef 条目 */
    inserted: number;
    /** 验证为 active 的条目 */
    active: number;
    /** 标记为 stale 的条目 */
    stale: number;
    /** 跳过的条目（24h 内已验证） */
    skipped: number;
    /** 处理的 recipe 数 */
    recipesProcessed: number;
    /** 反向清理的旧行（不再被 reasoning.sources 引用） */
    cleaned?: number;
}
export interface RepairReport {
    /** 成功检测到 rename 的条目 */
    renamed: number;
    /** 仍然 stale 的条目 */
    stillStale: number;
}
export interface ApplyReport {
    /** 成功写回 .md 的条目 */
    applied: number;
    /** 写回失败的条目 */
    failed: number;
}
export declare class SourceRefReconciler {
    #private;
    constructor(projectRoot: string, sourceRefRepo: RecipeSourceRefRepositoryImpl, knowledgeRepo: KnowledgeRepositoryImpl, options?: {
        ttlMs?: number;
        signalBus?: SignalBus;
    });
    /**
     * 从 knowledge_entries.reasoning 填充 recipe_source_refs 表。
     * 对已有条目验证路径存在性，更新 status。
     */
    reconcile(opts?: {
        force?: boolean;
    }): Promise<ReconcileReport>;
    /**
     * 对 stale 条目尝试 git rename 修复。
     * 使用 execFile() 安全执行 git log（防止命令注入）。
     */
    repairRenames(): Promise<RepairReport>;
    /**
     * 将 renamed 条目的 new_path 写回 Recipe .md 文件和 DB。
     * 同时更新 reasoning.sources、content.markdown、coreCode 中的路径引用。
     * 完成后 status → active（通过 replaceSourcePath）。
     */
    applyRepairs(): Promise<ApplyReport>;
}
