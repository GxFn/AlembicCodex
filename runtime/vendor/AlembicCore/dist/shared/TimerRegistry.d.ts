/**
 * TimerRegistry — 全局定时器注册中心
 *
 * 职责：
 *   1. 所有 setInterval/setTimeout 通过此中心创建 → 自动 unref + 记录
 *   2. shutdown 时一键 dispose() 清理所有定时器
 *   3. 提供诊断接口：列出活跃定时器（名称、创建时间、类型）
 *
 * 不替代组件内部的定时器引用（组件仍可持有 handle 做 reschedule），
 * 但保证 shutdown 时兜底清理。
 *
 * @module shared/TimerRegistry
 */
import type { Disposable } from './lifecycle.js';
type TimerHandle = ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>;
interface TimerSetOptions {
    /** 是否允许阻止进程退出（默认 false → 自动 unref） */
    blocking?: boolean;
}
declare class TimerRegistryImpl implements Disposable {
    #private;
    /**
     * 创建 setInterval 并自动注册 + unref
     */
    setInterval(fn: () => void, ms: number, label: string, opts?: TimerSetOptions): ReturnType<typeof setInterval>;
    /**
     * 创建 setTimeout 并自动注册 + unref
     *
     * 到期后自动从注册表移除。
     */
    setTimeout(fn: () => void, ms: number, label: string, opts?: TimerSetOptions): ReturnType<typeof setTimeout>;
    /**
     * 手动清除已注册的定时器
     */
    clear(handle: TimerHandle): void;
    /**
     * 注册一个 Disposable 组件（shutdown 时自动调用 dispose）
     */
    registerDisposable(label: string, disposable: Disposable): void;
    /**
     * 移除已注册的 Disposable
     */
    unregisterDisposable(label: string): void;
    /**
     * 清理所有定时器 + 调用所有已注册 Disposable 的 dispose。
     *
     * 幂等：多次调用安全。
     */
    dispose(): Promise<void>;
    /**
     * 诊断：列出所有活跃定时器和已注册的 Disposable
     */
    diagnostics(): {
        timers: Array<{
            label: string;
            kind: string;
            ageMs: number;
        }>;
        disposables: string[];
    };
    /** 活跃定时器数 */
    get timerCount(): number;
    /** 注册的 Disposable 数 */
    get disposableCount(): number;
    /** 是否已 disposed */
    get isDisposed(): boolean;
    /**
     * 重置状态（仅供测试使用）
     */
    _resetForTesting(): void;
}
/** 全局单例 */
export declare const timerRegistry: TimerRegistryImpl;
export {};
