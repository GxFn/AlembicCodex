/**
 * test-mode.ts — 通用测试模式支持
 *
 * 通过 .env 配置启用测试模式，限制 bootstrap / rescan 维度数量以加速端到端测试。
 * 终端能力已成为默认沙箱能力；这里仅保留终端档位覆盖配置。
 *
 * 环境变量:
 *   ALEMBIC_TEST_MODE=1                                    启用测试模式
 *   ALEMBIC_TEST_BOOTSTRAP_DIMS=arch,coding                冷启动阶段维度 (逗号分隔 ID)
 *   ALEMBIC_TEST_RESCAN_DIMS=design-patterns               增量扫描阶段维度 (逗号分隔 ID)
 *   ALEMBIC_TERMINAL_TOOLSET=terminal-run                   终端工具集 (baseline|terminal-run|terminal-shell|terminal-pty)
 *
 * 当 ALEMBIC_TEST_MODE 未设置或为 falsy 时，所有 API 透明返回原始数据。
 */
export interface DimensionDef {
    id: string;
    [key: string]: unknown;
}
/** 是否启用了测试模式 */
export declare function isTestMode(): boolean;
/** 终端默认能力配置 */
export interface TerminalConfig {
    enabled: boolean;
    toolset: string;
}
/** 沙箱状态信息 */
export interface SandboxStatusConfig {
    mode: string;
    available: boolean;
}
/** 完整测试模式配置 */
export interface TestModeConfig {
    enabled: boolean;
    bootstrapDims: string[];
    rescanDims: string[];
    terminal: TerminalConfig;
    sandbox: SandboxStatusConfig;
}
/** 获取测试模式完整配置（供 API / 前端展示 / 终端工具集解析） */
export declare function getTestModeConfig(): TestModeConfig;
/**
 * 根据测试模式配置过滤维度
 *
 * - 测试模式关闭时原样返回
 * - 测试模式开启但未配置对应阶段的维度 ID 时原样返回（不限制）
 * - 测试模式开启且有配置时，只保留配置中列出的维度
 */
export declare function applyTestDimensionFilter(dimensions: DimensionDef[], mode: 'bootstrap' | 'rescan'): DimensionDef[];
