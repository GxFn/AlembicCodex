/**
 * SessionRepository — 会话管理的仓储实现
 *
 * 操作 sessions 表，负责会话的 CRUD 和过期清理。
 * 使用 Drizzle 类型安全 API。
 */
import { sessions } from '../../infrastructure/database/drizzle/schema.js';
import { RepositoryBase } from '../base/RepositoryBase.js';
export interface SessionEntity {
    id: string;
    scope: string;
    scopeId: string | null;
    context: Record<string, unknown>;
    metadata: Record<string, unknown>;
    actor: string | null;
    createdAt: number;
    lastActiveAt: number | null;
    expiredAt: number | null;
}
export interface SessionInsert {
    id: string;
    scope: string;
    scopeId?: string | null;
    context?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    actor?: string | null;
    createdAt: number;
    lastActiveAt?: number | null;
}
export declare class SessionRepositoryImpl extends RepositoryBase<typeof sessions, SessionEntity> {
    #private;
    constructor(drizzle: ConstructorParameters<typeof RepositoryBase<typeof sessions, SessionEntity>>[0]);
    findById(id: string): Promise<SessionEntity | null>;
    create(data: SessionInsert): Promise<SessionEntity>;
    delete(id: string): Promise<boolean>;
    /** 按 scope 查询所有会话 */
    findByScope(scope: string): Promise<SessionEntity[]>;
    /** 按 actor 查询 */
    findByActor(actor: string): Promise<SessionEntity[]>;
    /** 更新最后活跃时间 */
    updateLastActivity(id: string, timestamp?: number): Promise<void>;
    /** 过期清理 — 删除 expiredAt < now 的会话 */
    cleanup(now?: number): Promise<number>;
    /** 会话总数 */
    count(scope?: string): Promise<number>;
}
