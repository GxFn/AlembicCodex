/**
 * EventBus — 应用事件总线
 * 支持 emit/emitAsync、事件历史日志、统计
 */
import { EventEmitter } from 'node:events';
export declare class EventBus extends EventEmitter {
    #private;
    constructor(options?: {
        maxListeners?: number;
        historyLimit?: number;
    });
    /** 同步 emit + 记录历史 */
    emit(eventName: string | symbol, ...args: unknown[]): boolean;
    /** 异步 emit — 串行等待所有 listener 完成 */
    emitAsync(eventName: string | symbol, ...args: unknown[]): Promise<void>;
    /** 获取事件历史 */
    getHistory(limit?: number): {
        event: string | symbol;
        timestamp: string;
        argCount: number;
    }[];
    /** 清空历史 */
    clearHistory(): void;
    /** 获取统计 */
    getStats(): {
        totalEvents: number;
        uniqueEvents: number;
        byEvent: Record<string, number>;
        activeListeners: number;
    };
}
