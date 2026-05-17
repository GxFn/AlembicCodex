/**
 * Migration 004 — Evolution Proposals + Staging Support
 *
 * M2 Recipe 治理所需的 schema 扩展：
 *   1. evolution_proposals 表 — 存储进化提案（矛盾/冗余/衰退/增强）
 *   2. knowledge_entries 添加 staging_deadline 列
 */
export default function migrate(db: import('better-sqlite3').Database): void;
