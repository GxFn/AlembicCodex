export type DaemonJobKind = 'bootstrap' | 'rescan';
export type DaemonJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type DaemonJobSource = 'codex' | 'dashboard' | 'http' | 'system';
export interface DaemonJobError {
    code?: string;
    message: string;
    stack?: string;
}
export interface DaemonJobRecord {
    id: string;
    kind: DaemonJobKind;
    status: DaemonJobStatus;
    source: DaemonJobSource;
    actor?: {
        role?: string;
        user?: string;
    };
    channelId?: string;
    client?: string;
    createdByTool?: string;
    projectRoot: string;
    dataRoot: string;
    projectId: string | null;
    request: Record<string, unknown>;
    result?: unknown;
    error?: DaemonJobError;
    sessionId?: string;
    bootstrapSessionId?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
}
export interface JobStoreOptions {
    projectRoot: string;
}
export interface CreateDaemonJobInput {
    actor?: DaemonJobRecord['actor'];
    channelId?: string;
    client?: string;
    createdByTool?: string;
    kind: DaemonJobKind;
    request?: Record<string, unknown>;
    sessionId?: string;
    source?: DaemonJobSource;
}
export interface ListDaemonJobsOptions {
    kind?: DaemonJobKind;
    status?: DaemonJobStatus;
    limit?: number;
}
export interface MarkActiveJobsInterruptedOptions {
    code?: string;
    reason: string;
}
export declare class JobStore {
    #private;
    readonly dataRoot: string;
    readonly jobsDir: string;
    readonly projectId: string | null;
    readonly projectRoot: string;
    constructor(options: JobStoreOptions);
    create(input: CreateDaemonJobInput): DaemonJobRecord;
    get(id: string): DaemonJobRecord | null;
    list(options?: ListDaemonJobsOptions): DaemonJobRecord[];
    markRunning(id: string): DaemonJobRecord | null;
    complete(id: string, result: unknown, extra?: {
        bootstrapSessionId?: string;
    }): DaemonJobRecord | null;
    fail(id: string, error: unknown): DaemonJobRecord | null;
    cancel(id: string, reason?: string): DaemonJobRecord | null;
    markActiveInterrupted(options: MarkActiveJobsInterruptedOptions): DaemonJobRecord[];
    update(id: string, patch: Partial<DaemonJobRecord>): DaemonJobRecord | null;
}
export declare function isSafeJobId(id: string): boolean;
export declare function isTerminalStatus(status: DaemonJobStatus): boolean;
