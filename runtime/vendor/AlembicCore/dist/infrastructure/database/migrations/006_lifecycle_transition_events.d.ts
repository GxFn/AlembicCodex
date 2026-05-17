/**
 * Migration 006 — Lifecycle Transition Events
 *
 * Recipe 生命周期状态转移事件日志表（Event Sourcing 模式）。
 * 记录每次状态转移的完整审计信息，支持回溯与监控。
 */
export default function migrate(db: import('better-sqlite3').Database): void;
