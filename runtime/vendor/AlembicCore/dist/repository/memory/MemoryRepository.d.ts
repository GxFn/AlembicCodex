/**
 * MemoryRepository — Agent 语义记忆的仓储实现
 *
 * 从 MemoryStore 提取的数据操作，
 * 使用 Drizzle 类型安全 API 操作 semantic_memories 表。
 * embedding 已迁移到 JSON sidecar (MemoryEmbeddingStore)。
 */
import { semanticMemories } from '../../infrastructure/database/drizzle/schema.js';
import { RepositoryBase } from '../base/RepositoryBase.js';
export interface SemanticMemoryEntity {
    id: string;
    type: string;
    content: string;
    source: string;
    importance: number;
    accessCount: number;
    lastAccessedAt: string | null;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
    relatedEntities: string[];
    relatedMemories: string[];
    sourceDimension: string | null;
    sourceEvidence: string | null;
    bootstrapSession: string | null;
    tags: string[];
}
export interface SemanticMemoryInsert {
    id: string;
    type?: string;
    content: string;
    source?: string;
    importance?: number;
    expiresAt?: string | null;
    relatedEntities?: string[];
    sourceDimension?: string | null;
    sourceEvidence?: string | null;
    bootstrapSession?: string | null;
    tags?: string[];
}
export interface SemanticMemoryUpdate {
    content?: string;
    importance?: number;
    accessCount?: number;
    relatedEntities?: string[];
    relatedMemories?: string[];
    tags?: string[];
}
export interface MemoryStats {
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    avgImportance: number;
}
export declare class MemoryRepositoryImpl extends RepositoryBase<typeof semanticMemories, SemanticMemoryEntity> {
    #private;
    constructor(drizzle: ConstructorParameters<typeof RepositoryBase<typeof semanticMemories, SemanticMemoryEntity>>[0]);
    findById(id: string): Promise<SemanticMemoryEntity | null>;
    create(data: SemanticMemoryInsert): Promise<SemanticMemoryEntity>;
    delete(id: string): Promise<boolean>;
    /** 动态字段更新 */
    update(id: string, updates: SemanticMemoryUpdate): Promise<boolean>;
    /** 更新访问计数 */
    touchAccess(id: string): Promise<void>;
    /** 获取所有活跃记忆 (未过期) */
    getAllActive(filters?: {
        source?: string;
        type?: string;
    }): Promise<SemanticMemoryEntity[]>;
    /** 获取候选记忆 (用于相似度搜索) */
    getCandidates(type: string | null, limit?: number): Promise<SemanticMemoryEntity[]>;
    /** 记忆总数 */
    size(filters?: {
        source?: string;
    }): Promise<number>;
    /**
     * 执行维护: 清理过期记忆 + 自然遗忘 + 重要度衰减
     */
    compact(): Promise<{
        expired: number;
        forgotten: number;
        archived: number;
        remaining: number;
    }>;
    /** 容量控制 */
    enforceCapacity(maxMemories?: number): Promise<number>;
    getStats(): Promise<MemoryStats>;
    /** 清除所有 bootstrap 来源的记忆 */
    clearBootstrapMemories(): Promise<number>;
}
