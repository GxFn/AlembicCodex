/**
 * PanoramaScanner — 全景数据内置扫描器
 *
 * 在全景数据缺失时自动运行轻量级结构扫描（Phase 1→2.1），
 * 填充 code_entities + knowledge_edges，使 PanoramaService 能产生有效数据。
 *
 * 非 MCP 操作，而是 PanoramaService 的内置依赖。
 * 调用时机：
 *   - PanoramaService 发现 DB 中无 code_entities 时自动触发
 *   - 手动调用 invalidate + getResult 时检查并补充
 *
 * @module PanoramaScanner
 */
import type { CodeEntityRepositoryImpl } from '../../repository/code/CodeEntityRepository.js';
import type { KnowledgeEdgeRepositoryImpl } from '../../repository/knowledge/KnowledgeEdgeRepository.js';
export interface PanoramaScannerOptions {
    projectRoot: string;
    container: ScannerContainer;
    entityRepo: CodeEntityRepositoryImpl;
    edgeRepo: KnowledgeEdgeRepositoryImpl;
    logger?: ScannerLogger;
}
export interface ScannerContainer {
    get(name: string): any;
}
export interface ScannerLogger {
    info(...args: unknown[]): void;
    warn(...args: unknown[]): void;
}
export interface ScanResult {
    entities: number;
    edges: number;
    modules: number;
    durationMs: number;
}
export declare class PanoramaScanner {
    #private;
    constructor(opts: PanoramaScannerOptions);
    /**
     * 检测 DB 中是否已有该项目的 code_entities 数据
     */
    hasData(): Promise<boolean>;
    /**
     * 确保全景数据存在。无数据时自动执行扫描。
     * 幂等：扫描过一次后不再重复（重启进程或手动 reset 可重新触发）。
     */
    ensureData(): Promise<ScanResult | null>;
    /**
     * 执行完整扫描（强制，不检查缓存）
     */
    scan(): Promise<ScanResult>;
    /**
     * 重置扫描状态（允许下次 ensureData 重新扫描）
     */
    reset(): void;
}
