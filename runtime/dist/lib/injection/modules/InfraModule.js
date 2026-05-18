/**
 * InfraModule — 基础设施 + 仓储注册
 *
 * 负责注册:
 *   - database, logger, auditStore, auditLogger
 *   - gateway, eventBus, bootstrapTaskManager
 *   - knowledgeRepository, knowledgeFileWriter, knowledgeSyncService
 */
import path from 'node:path';
import { JobStore } from '@alembic/core/daemon';
import { EventBus } from '@alembic/core/events';
import { ReportStore } from '@alembic/core/infrastructure/report/ReportStore';
import { WriteZone } from '@alembic/core/io';
import Logger from '@alembic/core/logging';
import { MemoryRepositoryImpl } from '@alembic/core/memory';
import { createAlembicRepositories, } from '@alembic/core/repositories';
import { KnowledgeFileWriter } from '@alembic/core/service/knowledge/KnowledgeFileWriter';
import { KnowledgeSyncService } from '@alembic/core/service/knowledge/KnowledgeSyncService';
import { resolveDataRoot, resolveProjectRoot } from '@alembic/core/workspace';
import Gateway from '../../core/gateway/Gateway.js';
import AuditLogger from '../../infrastructure/audit/AuditLogger.js';
import AuditStore from '../../infrastructure/audit/AuditStore.js';
import { getRealtimeService as _getRealtimeService } from '../../infrastructure/realtime/RealtimeService.js';
import { AuditRepositoryImpl } from '../../repository/audit/AuditRepository.js';
import { BootstrapTaskManager } from '../../service/bootstrap/BootstrapTaskManager.js';
export function register(c) {
    // ═══ Infrastructure ═══
    c.register('database', () => {
        if (!c.singletons.database) {
            throw new Error('Database not initialized. Ensure Bootstrap.initialize() is called before using ServiceContainer.');
        }
        return c.singletons.database;
    });
    c.register('logger', () => Logger.getInstance());
    c.singleton('auditStore', (ct) => {
        const db = ct.get('database');
        const drizzle = db.getDrizzle();
        return new AuditStore(db, drizzle);
    });
    c.singleton('auditLogger', (ct) => new AuditLogger(ct.get('auditStore'), ct.services.eventBus
        ? ct.get('eventBus')
        : null));
    c.singleton('gateway', () => new Gateway());
    c.singleton('eventBus', () => new EventBus({ maxListeners: 30 }));
    c.singleton('bootstrapTaskManager', (ct) => {
        const eventBus = ct.get('eventBus');
        const getRS = () => {
            try {
                return _getRealtimeService();
            }
            catch {
                return null;
            }
        };
        return new BootstrapTaskManager({
            eventBus,
            getRealtimeService: getRS,
        });
    });
    c.singleton('jobStore', (ct) => {
        return new JobStore({ projectRoot: resolveProjectRoot(ct) });
    });
    // ═══ WriteZone ═══
    c.singleton('writeZone', (ct) => {
        const resolver = ct.singletons._workspaceResolver;
        if (!resolver) {
            return null;
        }
        return new WriteZone(resolver);
    });
    // ═══ Repositories ═══
    c.singleton('knowledgeRepository', (ct) => {
        return getCoreRepositories(ct).knowledgeRepository;
    });
    c.singleton('knowledgeEdgeRepository', (ct) => {
        return getCoreRepositories(ct).knowledgeEdgeRepository;
    });
    c.singleton('codeEntityRepository', (ct) => {
        return getCoreRepositories(ct).codeEntityRepository;
    });
    c.singleton('bootstrapRepository', (ct) => {
        return getCoreRepositories(ct).bootstrapRepository;
    });
    c.singleton('guardViolationRepository', (ct) => {
        return getCoreRepositories(ct).guardViolationRepository;
    });
    c.singleton('auditRepository', (ct) => {
        const db = ct.get('database');
        const drizzle = db.getDrizzle();
        return new AuditRepositoryImpl(drizzle);
    });
    c.singleton('memoryRepository', (ct) => {
        const db = ct.get('database');
        const drizzle = db.getDrizzle();
        return new MemoryRepositoryImpl(drizzle);
    });
    c.singleton('sessionRepository', (ct) => {
        return getCoreRepositories(ct).sessionRepository;
    });
    c.singleton('proposalRepository', (ct) => {
        return getCoreRepositories(ct).proposalRepository;
    });
    c.singleton('warningRepository', (ct) => {
        return getCoreRepositories(ct).warningRepository;
    });
    c.singleton('lifecycleEventRepository', (ct) => {
        return getCoreRepositories(ct).lifecycleEventRepository;
    });
    c.singleton('recipeSourceRefRepository', (ct) => {
        return getCoreRepositories(ct).recipeSourceRefRepository;
    });
    c.singleton('knowledgeFileWriter', (ct) => {
        const dataRoot = resolveDataRoot(ct);
        const wz = ct.singletons.writeZone;
        return new KnowledgeFileWriter(dataRoot, wz);
    });
    c.singleton('knowledgeSyncService', (ct) => {
        const dataRoot = resolveDataRoot(ct);
        const sourceRefReconciler = ct.singletons.sourceRefReconciler;
        return new KnowledgeSyncService(dataRoot, {
            sourceRefReconciler: sourceRefReconciler || undefined,
        });
    });
    // ═══ ReportStore ═══
    c.singleton('reportStore', (ct) => {
        const dataRoot = resolveDataRoot(ct);
        const wz = ct.get('writeZone');
        return new ReportStore(path.join(dataRoot, '.asd', 'logs', 'reports'), wz ?? undefined);
    });
}
function getCoreRepositories(ct) {
    const cached = ct.singletons.coreRepositories;
    if (cached) {
        return cached;
    }
    const repositories = createAlembicRepositories(ct.get('database'));
    ct.singletons.coreRepositories = repositories;
    return repositories;
}
