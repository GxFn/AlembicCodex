import winston from 'winston';
/**
 * Logger - 统一日志系统
 *
 * 环境变量:
 *   ALEMBIC_LOG_LEVEL — 覆盖日志级别 (debug/info/warn/error)
 *   ALEMBIC_MCP_MODE=1 — MCP 模式下禁用 Console transport
 *   ALEMBIC_QUIET=1 — CLI JSON/quiet 场景下禁用 Console transport
 *
 * MCP 模式（ALEMBIC_MCP_MODE=1）下 Console transport 输出到 stderr 并禁用彩色，
 * 避免污染 stdout JSON-RPC 通道。
 */
export declare class Logger {
    static instance: import('winston').Logger | null;
    static getInstance(config?: {
        level?: string;
        console?: boolean;
        file?: {
            enabled?: boolean;
            path?: string;
        };
    }): winston.Logger;
    private static _addTransports;
    static debug(message: string, meta?: Record<string, unknown>): void;
    static info(message: string, meta?: Record<string, unknown>): void;
    static warn(message: string, meta?: Record<string, unknown>): void;
    static error(message: string, meta?: Record<string, unknown>): void;
    /** 审计日志 — 写入独立 audit.log，不受 LOG_LEVEL 控制 */
    static audit(event: string, meta?: Record<string, unknown>): void;
}
export default Logger;
