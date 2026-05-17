/**
 * @module DiscovererPreference
 * @description Discoverer 用户偏好持久化 + 冲突检测
 *
 * 当多个 Discoverer 匹配且置信度接近时，允许用户确认选择并持久化。
 * CLI 上下文使用 readline 交互，MCP/HTTP 上下文返回 ambiguous 标记。
 */
export interface DiscovererPreferenceData {
    selectedDiscoverer: string;
    selectedAt: string;
    alternatives: string[];
    userConfirmed: boolean;
}
export interface DetectMatch {
    discovererId: string;
    displayName: string;
    confidence: number;
}
export interface ConflictResult {
    ambiguous: boolean;
    reason?: string;
    matches: DetectMatch[];
    recommended?: DetectMatch;
}
/**
 * 检测 Discoverer 匹配结果是否存在冲突/模糊
 */
export declare function detectConflict(matches: DetectMatch[]): ConflictResult;
/**
 * 加载已保存的 Discoverer 偏好
 * @param dataRoot dataRoot（Ghost 模式下为外置工作区）或 projectRoot
 * @returns 偏好数据，或 null（无偏好/文件不存在/损坏）
 */
export declare function loadPreference(dataRoot: string): DiscovererPreferenceData | null;
/**
 * 保存 Discoverer 偏好
 * @param dataRoot dataRoot（Ghost 模式下为外置工作区）或 projectRoot
 */
export declare function savePreference(dataRoot: string, discovererId: string, alternatives: string[], userConfirmed: boolean): void;
/**
 * CLI 交互式确认 Discoverer 选择
 * 仅在 CLI 终端上下文（stdin 可用）时有效
 *
 * @returns 用户选择的 Discoverer ID，或 null（非交互环境/超时）
 */
export declare function promptDiscovererChoice(matches: DetectMatch[], recommended?: DetectMatch): Promise<string | null>;
