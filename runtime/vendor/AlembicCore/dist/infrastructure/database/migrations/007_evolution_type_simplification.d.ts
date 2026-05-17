/**
 * Migration 007 — Evolution Type Simplification
 *
 * 将 evolution_proposals.type 从 7 种值收敛为 2 种：
 *   - merge, enhance, correction → update
 *   - supersede → deprecate (已有 deprecate 保持不变)
 *   - contradiction, reorganize → 删除（转为 RecipeWarning 信号层）
 */
export default function migrate(db: import('better-sqlite3').Database): void;
