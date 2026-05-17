/**
 * 开发者身份解析
 *
 * 优先级链：
 *   1. 环境变量 ALEMBIC_USER
 *   2. git config user.name（项目级 → 全局）
 *   3. 操作系统用户名
 *   4. 'unknown'
 *
 * 结果在进程级缓存，避免重复 exec。
 */
/**
 * 同步获取当前开发者标识（缓存）。
 * @param cwd — 用于解析 git config 的工作目录（默认 process.cwd()）
 */
export declare function getDeveloperIdentity(cwd?: string): string;
/** 清除缓存（测试用） */
export declare function clearDeveloperIdentityCache(): void;
