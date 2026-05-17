/**
 * SignalBus — 统一信号总线
 *
 * Phase 0 核心基础设施。所有子系统（Guard、Search、Agent、Governance）
 * 通过 Signal Bus 发射和消费结构化信号，替代各自为政的事件分发。
 *
 * 设计公理：
 *   - 同步分发，<0.1ms per emit（消费者自行决定是否 buffer）
 *   - 支持精确类型订阅和通配符 '*'
 *   - 支持 pattern 订阅 'guard|search|usage'
 *
 * @module infrastructure/signal/SignalBus
 */
/** 信号类型枚举 */
export type SignalType = 'guard' | 'guard_blind_spot' | 'search' | 'usage' | 'lifecycle' | 'exploration' | 'quality' | 'panorama' | 'decay' | 'forge' | 'intent' | 'anomaly';
/** 信号结构 */
export interface Signal {
    /** 信号类别 */
    type: SignalType;
    /** 产出模块标识 */
    source: string;
    /** 关联 Recipe/Module ID（可选） */
    target: string | null;
    /** 标准化信号值 0-1 */
    value: number;
    /** 原始数据载荷 */
    metadata: Record<string, unknown>;
    /** 信号产生时间戳（ms） */
    timestamp: number;
}
/** 信号处理器 */
export type SignalHandler = (signal: Signal) => void;
export declare class SignalBus {
    #private;
    /**
     * 发射信号。同步分发给所有匹配的订阅者。
     *
     * @param signal 完整的 Signal 对象
     */
    emit(signal: Signal): void;
    /**
     * 订阅信号。支持三种模式：
     * - 精确类型: `subscribe('guard', handler)`
     * - 多类型:   `subscribe('guard|search|usage', handler)`
     * - 通配符:   `subscribe('*', handler)`
     *
     * @returns 取消订阅函数
     */
    subscribe(pattern: string, handler: SignalHandler): () => void;
    /**
     * 创建并发射信号的便捷方法。自动填充 timestamp。
     */
    send(type: SignalType, source: string, value: number, opts?: {
        target?: string | null;
        metadata?: Record<string, unknown>;
    }): void;
    /** 已发射的信号总数（诊断用） */
    get emitCount(): number;
    /** 活跃订阅者数量（诊断用） */
    get listenerCount(): number;
    /** 移除所有订阅者（测试用） */
    clear(): void;
}
