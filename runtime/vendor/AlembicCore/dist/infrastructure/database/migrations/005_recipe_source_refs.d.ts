/**
 * Migration 005 — Recipe Source References 桥接表
 *
 * 存储 Recipe 的 reasoning.sources 路径引用及其健康状态：
 *   - active:  文件存在，路径有效
 *   - renamed: 文件已移动到 new_path，等待修复
 *   - stale:   路径失效，无法自动修复
 */
export default function migrate(db: import('better-sqlite3').Database): void;
