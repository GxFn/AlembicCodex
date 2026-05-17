/**
 * SignalTraceWriter — 全类型信号 JSONL 留痕
 *
 * 订阅 SignalBus 全量信号，按类型分文件写入 JSONL。
 * 替代 SignalModule 中 intent-only 的 JSONL 写入逻辑，统一处理全部类型。
 *
 * @module infrastructure/signal/SignalTraceWriter
 */
import type { WriteZone } from '../io/index.js';
import type { Signal, SignalBus } from './SignalBus.js';
export interface SignalTraceQueryOptions {
    type?: string[];
    source?: string;
    target?: string;
    from?: number;
    to?: number;
    limit?: number;
    offset?: number;
}
export declare class SignalTraceWriter {
    #private;
    constructor(signalBus: SignalBus, baseDir: string, writeZone?: WriteZone);
    /** 查询历史信号 */
    query(opts?: SignalTraceQueryOptions): Promise<{
        signals: Signal[];
        total: number;
    }>;
    /** 统计信息 */
    stats(opts?: {
        from?: number;
        to?: number;
    }): Promise<{
        total: number;
        byType: Record<string, number>;
        bySource: Record<string, number>;
    }>;
}
