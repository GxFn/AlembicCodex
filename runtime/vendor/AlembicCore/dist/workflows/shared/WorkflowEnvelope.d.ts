export interface WorkflowEnvelopeMeta {
    responseTimeMs?: number;
    tool?: string;
    source?: string;
    version?: string;
    [key: string]: unknown;
}
export interface WorkflowEnvelopeOptions<T = unknown> {
    success: boolean;
    data?: T | null;
    message?: string;
    meta?: WorkflowEnvelopeMeta;
    errorCode?: string | null;
}
/**
 * Core 内部使用的轻量响应封装。
 *
 * 外层 MCP/HTTP handler 可以继续包自己的 transport envelope；
 * 这里仅保证 workflow projection 有稳定的数据形状。
 */
export declare function envelope<T = unknown>({ success, data, message, meta, errorCode, }: WorkflowEnvelopeOptions<T>): {
    success: boolean;
    errorCode: string | null;
    message: string;
    data: T | null;
    meta: {
        [key: string]: unknown;
        responseTimeMs?: number;
        tool?: string;
        source?: string;
        version?: string;
    };
};
