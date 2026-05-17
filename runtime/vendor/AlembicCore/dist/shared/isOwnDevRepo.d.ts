/**
 * isOwnDevRepo — 检测 projectRoot 是否应排除 Alembic 运行时数据创建
 *
 * 三层保护：
 *  1. isAlembicDevRepo — Alembic 自身源码仓库
 *  2. isAlembicEcosystemRepo — Alembic 生态项目（alembic-book 等）
 *  3. isExcludedProject — 综合判定：不适合创建知识库的项目
 *
 * 用于防止宿主运行时在不当目录创建 `.asd/` 运行时数据。
 *
 * isAlembicDevRepo 检测条件：
 *  1. projectRoot/package.json 的 name === 'alembic-ai'
 *  2. projectRoot/lib/bootstrap.ts 存在（源码标记）
 *  3. projectRoot/SOUL.md 存在（项目灵魂文档）
 * 或 package name === '@alembic/core' 且存在 AGENTS.md / src/index.ts。
 */
/**
 * 判断 dir 是否是 Alembic 自身的源码开发仓库
 * 结果按 dir 缓存，避免重复 IO
 */
export declare function isAlembicDevRepo(dir: string): boolean;
/**
 * 判断 dir 是否是 Alembic 生态项目（不应创建运行时数据）
 *
 * 检测条件：package.json 的 name 以 'alembic-' 或 '@alembic/' 开头
 * 例如 alembic-book、alembic-examples 等
 */
export declare function isAlembicEcosystemRepo(dir: string): boolean;
/**
 * 综合判定：项目是否应排除创建 .asd/ 运行时数据
 *
 * 当前排除：
 *  1. Alembic 源码仓库本身
 *  2. Alembic 生态项目（alembic-book 等）
 *  3. 存在 .asd-skip 标记文件的项目（用户手动排除）
 *
 * @returns { excluded: boolean; reason: string }
 */
export declare function isExcludedProject(dir: string): {
    excluded: boolean;
    reason: string;
};
/** 重置缓存（仅用于测试） */
export declare function _resetDevRepoCache(): void;
