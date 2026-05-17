/**
 * ConfigWatcher — 构建配置文件热更新监听器
 *
 * 监听自研构建系统的配置文件变更，执行增量重解析并通知下游服务。
 *
 * 核心策略：
 *   - debounce 3s（配置文件常有连续保存）
 *   - MD5 hash 差量检测避免无效重解析
 *   - 60s 最大频率保护（防 git checkout 等批量变更风暴）
 *   - 增量解析：单文件变更只影响对应模块
 *   - 通过 SignalBus 触发 PanoramaService 缓存失效
 *   - 通过 RealtimeService 推送 Dashboard WebSocket 事件
 *
 * @module ConfigWatcher
 */
import type { SignalBus } from '../../infrastructure/signal/SignalBus.js';
/** 变更类型：仅影响范围不同 */
type ChangeScope = 'full' | 'module' | 'overlay';
interface ConfigChangeEvent {
    /** 变更的文件列表 */
    changedFiles: Array<{
        path: string;
        scope: ChangeScope;
        moduleName?: string;
    }>;
    /** 配置系统 ID */
    systemId: string;
    /** 事件触发时间 */
    timestamp: number;
}
export interface ConfigWatcherOptions {
    /** 项目根目录 */
    projectRoot: string;
    /** 配置系统 ID（easybox / tuist / xcodegen）或自定义 */
    systemId: string;
    /** 自定义 watch patterns（当 systemId 不在内置表中时） */
    watchPatterns?: string[];
    /** 信号总线（触发缓存失效） */
    signalBus?: SignalBus | null;
    /** 变更回调（用于外部通知，如 RealtimeService） */
    onChange?: (event: ConfigChangeEvent) => void;
    /** debounce 毫秒数（默认 3000） */
    debounceMs?: number;
    /** 全量重建最小间隔毫秒（默认 60000） */
    fullRebuildIntervalMs?: number;
}
export declare class ConfigWatcher {
    #private;
    constructor(options: ConfigWatcherOptions);
    /**
     * 启动文件监听。异步解析初始文件 hash 并注册 fs.watch。
     * 自动注册 shutdown hook 以清理资源。
     */
    start(): Promise<void>;
    /**
     * 停止监听，释放所有 fs.watch 资源
     */
    dispose(): void;
    /** 是否正在监听 */
    get active(): boolean;
    /** 监听的文件数 */
    get watchedFileCount(): number;
}
export {};
