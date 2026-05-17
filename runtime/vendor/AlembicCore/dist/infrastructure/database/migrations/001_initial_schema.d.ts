/**
 * Migration 001: Initial Schema (V3)
 *
 * 全新数据库初始化 — 一次性创建所有表。
 * 10 张表、统一 camelCase 命名（knowledge_entries 主表）。
 *
 * 表清单:
 *   1. knowledge_entries      — 核心知识条目 (Skills/Candidates/Guards)
 *   2. knowledge_edges        — 知识关系图谱边
 *   3. guard_violations       — Guard 违反记录
 *   4. audit_logs             — 审计日志
 *   5. sessions               — 会话管理
 *   6. token_usage            — AI Token 消耗记录
 *   7. semantic_memories      — 项目级语义记忆 (Agent Memory Tier 3)
 *   8. bootstrap_snapshots    — Bootstrap 快照主表
 *   9. bootstrap_dim_files    — 维度-文件关联表
 *  10. code_entities          — 代码实体节点 (AST 解析)
 */
export default function migrate(db: import('better-sqlite3').Database): void;
