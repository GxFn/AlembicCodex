/**
 * TargetClassifier — Target/文件分类辅助
 *
 * 负责：
 *   - Target 名称 → 模块职责推断
 *   - 文件名 → 分析优先级推断
 */
/** 根据 Target 名称推断模块职责 */
export declare function inferTargetRole(targetName: string): "config" | "ui" | "model" | "core" | "app" | "service" | "networking" | "storage" | "feature" | "test" | "auth" | "routing" | "utility";
/** 根据文件名推断分析优先级 */
export declare function inferFilePriority(filename: string): "low" | "medium" | "high";
