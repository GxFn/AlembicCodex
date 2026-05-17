/**
 * SessionSupport — SessionManager 单例获取与项目分析 Session 缓存
 *
 * 为冷启动和增量扫描提供 BootstrapSessionManager 的单例解析，
 * 以及 Phase 1-4 分析结果的缓存，供后续维度执行复用。
 */
import type { DimensionDef, ProjectSnapshot } from '../../../../types/project-snapshot.js';
import { BootstrapSessionManager } from './BootstrapSession.js';
interface SessionManagerContainer {
    get(name: string): unknown;
    register?: (name: string, factory: () => unknown) => void;
}
export declare function getOrCreateSessionManager(container: SessionManagerContainer): BootstrapSessionManager;
export type WorkflowSessionContainer = Parameters<typeof getOrCreateSessionManager>[0];
interface WorkflowSessionLogger {
    warn(message: string): void;
}
export declare function cacheProjectAnalysisSession(opts: {
    container: WorkflowSessionContainer;
    projectRoot: string;
    dimensions: DimensionDef[];
    snapshot: ProjectSnapshot;
    primaryLang: string | null;
    fileCount: number;
    moduleCount: number;
    logger: WorkflowSessionLogger;
    logPrefix: string;
}): string | null;
export {};
