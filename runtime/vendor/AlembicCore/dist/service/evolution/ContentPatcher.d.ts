/**
 * ContentPatcher — Proposal suggestedChanges 消费引擎
 *
 * 核心职责：
 *   1. 从 Proposal.evidence 提取 suggestedChanges
 *   2. 解析为结构化 Patch（JSON 或降级为纯文本）
 *   3. 创建 Recipe 内容快照（before）
 *   4. 应用 patch 到 Recipe 字段
 *   5. 创建快照（after）
 *   6. 持久化更新
 *
 * 安全边界：
 *   - 只修改 Patch 指定的字段，不擅自变更其他内容
 *   - suggestedChanges 缺失或格式不合规时降级跳过（不阻塞状态转移）
 *   - 所有变更在 before/after 快照中可追溯
 *
 * @module service/evolution/ContentPatcher
 */
import type KnowledgeRepositoryImpl from '../../repository/knowledge/KnowledgeRepository.impl.js';
import type { RecipeSourceRefRepositoryImpl } from '../../repository/sourceref/RecipeSourceRefRepository.js';
import type { ContentPatchResult } from '../../types/evolution.js';
export declare class ContentPatcher {
    #private;
    constructor(knowledgeRepo: KnowledgeRepositoryImpl, sourceRefRepo: RecipeSourceRefRepositoryImpl);
    /**
     * 从 Proposal evidence 提取 suggestedChanges 并应用到 Recipe
     *
     * @returns ContentPatchResult — success: 是否成功应用了至少一个 patch
     */
    applyProposal(proposal: {
        id: string;
        type: string;
        targetRecipeId: string;
        evidence: Record<string, unknown>[];
    }, patchSource?: 'agent-suggestion' | 'correction' | 'merge'): Promise<ContentPatchResult>;
}
