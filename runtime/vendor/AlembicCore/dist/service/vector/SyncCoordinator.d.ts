/**
 * SyncCoordinator — 知识 CRUD → 向量索引事件驱动同步
 *
 * 监听 EventBus 的 `knowledge:changed` 事件，
 * debounce 合并后批量执行 chunk → embed → upsert/remove。
 *
 * 设计:
 *   - 2s debounce 窗口内合并多个 CRUD 事件
 *   - maxBatchSize(20) 达到时立即触发
 *   - 启动时可执行一次 DB↔Vector 对账
 *
 * @module service/vector/SyncCoordinator
 */
import type { DrizzleDB } from '../../infrastructure/database/drizzle/index.js';
import type { EventBus } from '../../infrastructure/event/EventBus.js';
import type { VectorStore } from '../../infrastructure/vector/VectorStore.js';
import type { VectorChunkEnricher } from './EnrichmentTypes.js';
import type { EmbedProvider } from './VectorService.js';
export interface SyncCoordinatorConfig {
    vectorStore: VectorStore;
    embedProvider: EmbedProvider;
    contextualEnricher: VectorChunkEnricher | null;
    debounceMs: number;
    maxBatchSize?: number;
    drizzle?: DrizzleDB;
}
export declare class SyncCoordinator {
    #private;
    constructor(config: SyncCoordinatorConfig);
    /** 绑定 EventBus，开始监听知识变更事件 */
    bindEventBus(eventBus: EventBus): void;
    /** 手动触发立即刷入（用于测试或 shutdown 前确保数据落盘） */
    flush(): Promise<void>;
    /**
     * 启动对账: 比较 DB knowledge_entries 与向量索引，修复不一致
     * - 孤儿向量 (在索引中但 DB 无对应) → 删除
     * - 缺失向量 (在 DB 中但索引无对应) → 加入待同步队列
     *
     * @param db - 数据库连接 (better-sqlite3 style)
     * @returns 对账结果
     */
    reconcile(db?: {
        prepare(sql: string): {
            all(...args: unknown[]): Array<{
                id: string;
                title?: string;
                content?: string;
                kind?: string;
            }>;
        };
    }): Promise<{
        orphansRemoved: number;
        missingSynced: number;
        errors: string[];
    }>;
    /** 销毁: 清理定时器和事件监听 */
    destroy(): void;
}
