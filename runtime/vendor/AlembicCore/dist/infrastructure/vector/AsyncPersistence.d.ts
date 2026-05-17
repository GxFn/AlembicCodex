/**
 * AsyncPersistence — WAL (Write-Ahead Log) + 异步写入
 *
 * 设计:
 * - 写操作先追加到 WAL 文件 (NDJSON + CRC32), 再应用到内存
 * - 定时 (2s) 或积累 100 条操作后 flush: 写入完整 .asvec + 清理 WAL
 * - 启动时: 加载 .asvec 主文件, 然后 replay WAL 中未刷盘的操作
 * - WAL 条目带 CRC32 校验, 损坏条目跳过 (数据最终由 .asvec 兜底)
 *
 * WAL 格式 (NDJSON):
 *   每行: JSON\tCRC32_HEX\n
 *   JSON: { "t": 1, "id": "doc_1", "c": "content", "v": [...], "m": {...} }
 *   t=1: upsert, t=2: remove, t=3: clear
 *
 * @module infrastructure/vector/AsyncPersistence
 */
import type { WriteZone } from '../io/WriteZone.js';
export declare const WAL_OP: Readonly<{
    UPSERT: 1;
    REMOVE: 2;
    CLEAR: 3;
}>;
/**
 * 计算字符串的 CRC32 校验值
 * @returns 8 位十六进制字符串
 */
declare function crc32(str: string): string;
export declare class AsyncPersistence {
    #private;
    /**
     * @param options.indexPath 主索引文件路径 (.asvec)
     * @param options.onPersist persist 回调: async () => void (写完整 .asvec)
     * @param options.onReplay replay 回调: (op) => void (重放单条操作)
     * @param [options.enabled=true] 是否启用 WAL
     */
    constructor(options: {
        indexPath: string;
        onPersist: () => Promise<void>;
        onReplay: (op: Record<string, unknown>) => void;
        enabled?: boolean;
        flushIntervalMs?: number;
        flushBatchSize?: number;
        writeZone?: WriteZone;
    });
    /** WAL 文件路径 (供外部测试/调试) */
    get walPath(): string;
    /** 当前待刷盘操作数量 */
    get pendingCount(): number;
    /** 是否正在刷盘 */
    get isFlushing(): boolean;
    /**
     * 追加操作到 WAL
     * 操作同时写入磁盘 WAL 文件 (append) 和内存队列
     *
     * @param op WAL 操作
     * @param op.t 操作类型: 1=upsert, 2=remove, 3=clear
     * @param [op.id] 文档 ID
     * @param [op.c] 内容 (upsert)
     * @param [op.v] 向量 (upsert)
     * @param [op.m] metadata (upsert)
     */
    appendWal(op: Record<string, unknown>): void;
    /** 手动触发 flush (用于关闭/测试) */
    flush(): Promise<void>;
    /**
     * 启动时恢复: 读取 WAL 文件, replay 有效条目
     * WAL 条目带 CRC32 校验, 损坏条目跳过
     *
     * @returns }
     */
    recover(): {
        replayed: number;
        skipped: number;
    };
    /** 销毁: 清理定时器 */
    destroy(): void;
    /**
     * 同步 flush (用于进程退出时)
     * 注意: 只清理定时器, 不执行实际 persist (由调用方负责)
     */
    destroySync(): void;
}
export { crc32 };
