/**
 * CapabilityProbe — 子仓库能力探针
 *
 * 通过 `git push --dry-run` 探测当前用户对子仓库的物理写权限。
 * 探测结果被缓存（默认 24h）以避免重复执行。
 *
 * 子仓库默认指向 `Alembic/recipes/`（可通过 config 或 options 自定义）。
 * 探测路径解析优先级：
 *   1. 构造函数 options.subRepoPath（显式指定）
 *   2. `.asd/config.json` 中 `core.subRepoDir`
 *   3. 默认 `Alembic/recipes`
 *
 * 三种探测结果：
 *   'admin'       — 无子仓库（个人项目）/ 有 push 权限 → developer
 *   'contributor'  — 有子仓库但无 push 权限 → developer（本地用户 = 项目 Owner）
 *   'visitor'      — noRemote=deny 严格模式 → developer（仅探针级别区分，角色统一为 developer）
 *
 * 当没有 remote 时根据 constitution capabilities.git_write.no_remote 策略决定：
 *   'allow' (默认) — 本地开发，视为 admin
 *   'deny'          — 严格模式，视为 visitor
 */
export type ProbeResult = 'admin' | 'contributor' | 'visitor';
export interface ProbeCache {
    result: ProbeResult;
    cachedAt: number;
    expiresAt: number;
    detail: string;
}
export interface CapabilityProbeOptions {
    subRepoPath?: string;
    cacheTTL?: number;
    noRemote?: 'allow' | 'deny';
}
export declare class CapabilityProbe {
    subRepoPath: string | null;
    _cache: ProbeCache | null;
    cacheTTL: number;
    logger: import("winston").Logger;
    noRemote: 'allow' | 'deny';
    /**
     * @param [options.subRepoPath] 子仓库根路径（默认 cwd/Alembic）
     * @param [options.cacheTTL] 缓存 TTL（秒），默认 86400
     * @param [options.noRemote] 无 remote 策略: 'allow' | 'deny'
     */
    constructor(options?: CapabilityProbeOptions);
    /** 执行探测，返回角色级别 */
    probe(): ProbeResult;
    /**
     * 将探测结果映射为 Constitution 角色 ID
     *
     * 映射规则：
     *   'admin'       → 'developer'    有 push 权限 / 无子仓库（个人项目）→ 完整权限
     *   'contributor'  → 'contributor'   有子仓库但无 push 权限 → 只读，禁止提交 Recipe
     *   'visitor'      → 'visitor'       noRemote=deny 严格模式 → 最小权限
     */
    toRole(probeResult: ProbeResult): string;
    /**
     * 一步到位：探测并返回角色
     * @returns Constitution role ID
     */
    probeRole(): string;
    /** 获取当前缓存状态（for dashboard display） */
    getCacheStatus(): {
        cached: boolean;
        result?: undefined;
        cachedAt?: undefined;
        expiresAt?: undefined;
        expired?: undefined;
    } | {
        cached: boolean;
        result: ProbeResult;
        cachedAt: number;
        expiresAt: number;
        expired: boolean;
    };
    /** 清除缓存（强制下次重新探测） */
    invalidate(): void;
    /**
     * 自动检测子仓库路径
     * 优先级：config.json > 默认 Alembic/recipes
     */
    _detectSubRepo(): string | null;
    /** 执行实际探测 */
    _runProbe(): ProbeResult;
    _isGitRepo(repoPath: string): boolean;
    _hasRemote(repoPath: string): boolean;
    /** git push --dry-run 探测 */
    _probePush(repoPath: string): ProbeResult;
}
export default CapabilityProbe;
