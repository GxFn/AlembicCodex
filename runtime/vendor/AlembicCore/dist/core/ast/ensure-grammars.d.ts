/**
 * @module ast/ensure-grammars
 * @description 检查 .wasm 语法文件可用性
 *
 * 迁移至 web-tree-sitter (WASM) 后，不再需要运行时 npm install。
 * 所有 .wasm 文件随包一起发布在 resources/grammars/。
 * 此模块保留旧接口以兼容调用方，但内部逻辑改为检查 .wasm 文件。
 *
 * 使用方式:
 *   import { ensureGrammars } from '../core/ast/ensure-grammars.js';
 *   const result = await ensureGrammars(['typescript', 'javascript'], { logger });
 */
/**
 * 检查所需语言的 .wasm 文件是否就绪
 *
 * 保持旧接口签名以兼容 bootstrap 等调用方。
 * WASM 模式下不会执行 npm install —— 文件随包分发。
 *
 * @param detectedLanguages 检测到的语言列表
 * @param [options.logger] Logger 实例（可选）
 * @returns >}
 */
export declare function ensureGrammars(detectedLanguages: any, options?: any): Promise<{
    installed: string[];
    skipped: string[];
    failed: string[];
    alreadyAvailable: string[];
}>;
/**
 * 在安装新包后重新加载 AST 插件
 * 由于 loadPlugins() 是幂等的（_loaded 标志），需要重置标志后重新加载
 */
export declare function reloadPlugins(): Promise<void>;
/**
 * 从文件扩展名统计推断需要的语言列表
 *
 * @param langStats { swift: 120, m: 80, ts: 200 }
 * @returns 需要的语言 ID 列表
 */
export declare function inferLanguagesFromStats(langStats: any): unknown[];
