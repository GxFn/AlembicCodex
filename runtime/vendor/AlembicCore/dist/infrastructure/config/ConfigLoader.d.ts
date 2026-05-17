/**
 * ConfigLoader - 配置加载器
 * 直接读取 JSON 配置文件，避免 node-config 模块在 import 阶段就读取配置目录的时序问题
 */
export declare class ConfigLoader {
    static instance: ConfigLoader | null;
    static config: Record<string, unknown> | null;
    /**
     * 沿目录树向上查找包含 Alembic package.json 的目录。
     * ConfigLoader 是最早加载的模块之一，不能依赖 package-root.ts，因此内联实现。
     */
    static _findPackageRoot(): string;
    static load(env?: string): Record<string, unknown>;
    static _deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown>;
    static get(key: string): unknown;
    static has(key: string): boolean;
    static set(key: string, value: unknown): void;
}
export default ConfigLoader;
