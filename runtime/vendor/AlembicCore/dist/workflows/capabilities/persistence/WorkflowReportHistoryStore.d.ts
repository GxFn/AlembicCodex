import type { WorkflowReport } from './WorkflowReportTypes.js';
export declare function getReportSessionId(report: WorkflowReport): string | null;
export declare function buildWorkflowReportSummary(report: WorkflowReport): {
    sessionId: string | null;
    timestamp: string;
    project: {
        name: string;
        files: number;
        lang: string;
    };
    mode: {} | null;
    terminalCapability: {};
    durationMs: number;
    candidates: {};
    toolCalls: {};
    terminalEnabled: boolean;
    terminalSuccessRate: number;
};
export declare function buildWorkflowReportArtifactManifest(report: WorkflowReport): {
    version: string;
    sessionId: string | null;
    createdAt: string;
    report: {
        latest: string;
        history: string | null;
    };
    snapshot: import("./WorkflowReportTypes.js").WorkflowSnapshotSummary;
    terminal: {
        enabled: boolean;
        commandCount: number;
        transcriptRefs: string[];
    };
    artifacts: {
        kind: string;
        ref: string;
    }[];
    notes: string[];
};
export declare function writeWorkflowReportHistoryWithWriteZone(writeZone: import('../../../infrastructure/io/index.js').WriteZone, report: WorkflowReport): Promise<void>;
export declare function writeWorkflowReportHistory(reportDir: string, report: WorkflowReport): Promise<void>;
