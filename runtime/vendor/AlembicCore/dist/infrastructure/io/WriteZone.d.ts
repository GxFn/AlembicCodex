/**
 * WriteZone — 本地化写入管理系统
 *
 * 三区模型：
 *   Zone.Project → projectRoot  (IDE 配置、Agent 指令等必须留在真实项目目录的文件)
 *   Zone.Data    → dataRoot     (知识库、运行时数据，Ghost 模式下外置到 ~/.asd/workspaces/<id>/)
 *   Zone.Global  → ~/.asd/      (跨项目的全局配置和缓存)
 *
 * 设计要点：
 *   - 编译期通过 ZonedPath<Z> branded type 防止不同 Zone 路径混用
 *   - Ghost 模式透明 — 消费者只需选对 Zone，路径自动解析
 *   - 同时提供同步和异步 API，覆盖全部写入模式
 *   - Zone.Global 使用独立的前缀校验（PathGuard 白名单不覆盖 ~/.asd/ 全局目录）
 *   - 支持 DI 注入和静态工厂两种获取方式
 *
 * @module infrastructure/io/WriteZone
 */
import type { WorkspaceResolver } from '../../shared/WorkspaceResolver.js';
/**
 * 写入区域常量
 *
 * 使用 `as const` 而非 `const enum`，
 * 因为项目启用了 isolatedModules: true。
 */
export declare const Zone: {
    readonly Project: "project";
    readonly Data: "data";
    readonly Global: "global";
};
export type Zone = (typeof Zone)[keyof typeof Zone];
/** 类型化的路径标记 — 防止不同 Zone 的路径混用 */
export interface ZonedPath<Z extends Zone = Zone> {
    readonly zone: Z;
    readonly absolute: string;
}
export type ProjectPath = ZonedPath<'project'>;
export type DataPath = ZonedPath<'data'>;
export type GlobalPath = ZonedPath<'global'>;
export declare class WriteZone {
    #private;
    constructor(resolver: WorkspaceResolver);
    /** 从已有的 WorkspaceResolver 创建 — 初始化流程等 */
    static fromResolver(resolver: WorkspaceResolver): WriteZone;
    /** 从项目根路径创建（异步）— 脚本等一次性场景 */
    static fromProjectRoot(projectRoot: string): Promise<WriteZone>;
    project(relativePath: string): ProjectPath;
    data(relativePath: string): DataPath;
    global(relativePath: string): GlobalPath;
    /** .asd/ 子路径（运行时数据） */
    runtime(sub: string): DataPath;
    /** Alembic/ 子路径（知识库数据） */
    knowledge(sub: string): DataPath;
    get projectRoot(): string;
    get dataRoot(): string;
    get ghost(): boolean;
    ensureDir(target: ZonedPath): string;
    writeFile(target: ZonedPath, content: string | Buffer): void;
    appendFile(target: ZonedPath, content: string): void;
    copyFile(src: string, dest: ZonedPath): void;
    remove(target: ZonedPath, options?: {
        recursive?: boolean;
    }): void;
    /**
     * 移动/重命名 — 自动处理跨文件系统 EXDEV 错误
     * (Ghost 模式下 Zone.Project 和 Zone.Data 可能在不同挂载点)
     */
    rename(src: ZonedPath, dest: ZonedPath): void;
    ensureDirAsync(target: ZonedPath): Promise<string>;
    writeFileAsync(target: ZonedPath, content: string | Buffer): Promise<void>;
    appendFileAsync(target: ZonedPath, content: string): Promise<void>;
    removeAsync(target: ZonedPath, options?: {
        recursive?: boolean;
    }): Promise<void>;
}
export default WriteZone;
