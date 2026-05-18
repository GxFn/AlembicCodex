import { GuardCheckEngine } from './service/guard/GuardCheckEngine.js';
export * from './service/guard/index.js';
/**
 * 创建 Guard 检查引擎。
 *
 * Core 只稳定规则检查、跨文件检查、报告和正向治理闭环；MCP tool
 * schema、CLI 参数、Codex 输出格式继续由外层 adapter 包装。
 */
export function createGuardCheckEngine(db, options = {}) {
    return new GuardCheckEngine(db, options);
}
