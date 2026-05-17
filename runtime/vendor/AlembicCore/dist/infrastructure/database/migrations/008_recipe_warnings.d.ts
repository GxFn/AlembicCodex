/**
 * Migration 008: recipe_warnings 表
 *
 * 持久化 KnowledgeMetabolism 产出的 RecipeWarning（contradiction / redundancy）。
 * 原先 warning 仅存在于内存中的 MetabolismReport，Database 中无持久化。
 */
export default function migrate(db: import('better-sqlite3').Database): void;
