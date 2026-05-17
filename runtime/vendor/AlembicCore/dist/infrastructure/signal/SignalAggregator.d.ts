/**
 * SignalAggregator — 滑窗统计 + 异常检测
 *
 * 订阅可聚合的事实型信号，周期性写入 Report（统计）并在异常时发射 Signal。
 *
 * @module infrastructure/signal/SignalAggregator
 */
import type { Startable } from '../../shared/lifecycle.js';
import type { ReportStore } from '../report/ReportStore.js';
import type { SignalBus } from './SignalBus.js';
export declare class SignalAggregator implements Startable {
    #private;
    constructor(signalBus: SignalBus, reportStore: ReportStore, opts?: {
        intervalMs?: number;
        windowMs?: number;
    });
    start(): void;
    stop(): void;
    dispose(): void;
}
