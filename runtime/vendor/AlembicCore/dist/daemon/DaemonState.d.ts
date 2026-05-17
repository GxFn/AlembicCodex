export declare const DAEMON_STATE_SCHEMA_VERSION = 1;
export interface DaemonPaths {
    dataRoot: string;
    jobsDir: string;
    lockDir: string;
    logPath: string;
    pidPath: string;
    projectId: string | null;
    projectRoot: string;
    runtimeDir: string;
    statePath: string;
}
export interface DaemonState {
    schemaVersion: number;
    projectRoot: string;
    dataRoot: string;
    projectId: string | null;
    pid: number;
    host: string;
    port: number;
    url: string;
    dashboardUrl: string;
    token: string;
    version: string;
    mode: 'daemon';
    startedAt: string;
    lastReadyAt: string;
    databasePath: string;
    schemaMigrationVersion: string | null;
}
export declare function getPackageVersion(): string;
export declare function resolveDaemonPaths(projectRoot: string): DaemonPaths;
export declare function ensureDaemonDirs(paths: DaemonPaths): void;
export declare function readDaemonState(statePath: string): DaemonState | null;
export declare function writeDaemonState(statePath: string, state: DaemonState): void;
export declare function removeDaemonState(paths: Pick<DaemonPaths, 'statePath' | 'pidPath' | 'lockDir'>, options?: {
    includeLock?: boolean;
}): void;
