/**
 * resolveProjectRoot — 统一的 projectRoot 解析辅助函数
 *
 * 三级 fallback:
 *   1. ServiceContainer.singletons._projectRoot（最可靠，Bootstrap 后一定有值）
 *   2. process.env.ALEMBIC_PROJECT_DIR（MCP/HTTP Server 启动时设置）
 *   3. process.cwd()（CLI 模式下通常正确；MCP 模式下可能是 $HOME）
 *
 * 用于 MCP handler / HTTP route / Service 内部获取项目根目录，
 * 替代散落在各处的裸 `process.cwd()` 调用。
 */
import { WorkspaceResolver } from './WorkspaceResolver.js';
/** ServiceContainer 最小类型，避免循环依赖 */
interface ContainerLike {
    singletons?: {
        _projectRoot?: unknown;
        _workspaceResolver?: unknown;
        [key: string]: unknown;
    };
}
/**
 * 解析项目根目录
 * @param container DI 容器实例（McpContext.container / getServiceContainer()）
 * @returns 项目根目录绝对路径
 */
export declare function resolveProjectRoot(container?: ContainerLike | null): string;
/**
 * 解析数据根目录（Ghost 感知）
 *
 * Ghost 模式下返回 ~/.asd/workspaces/<id>/，标准模式下返回 projectRoot。
 * 所有运行时数据（.asd/）和知识库（Alembic/）的写入应基于 dataRoot。
 *
 * @param container DI 容器实例
 * @returns 数据根目录绝对路径
 */
export declare function resolveDataRoot(container?: ContainerLike | null): string;
/**
 * 解析知识库扫描目录（Ghost 感知）
 *
 * 返回相对于 dataRoot 的目录列表，优先使用 WorkspaceResolver 中的知识库目录，
 * 同时保留 legacy recipes/candidates 兼容路径。
 */
export declare function resolveKnowledgeScanDirs(container?: ContainerLike | null): string[];
/**
 * 获取 WorkspaceResolver 实例
 * @param container DI 容器实例
 * @returns WorkspaceResolver 或 null（未初始化时）
 */
export declare function resolveWorkspace(container?: ContainerLike | null): WorkspaceResolver | null;
export {};
