import { createHostAiProviderManager, createHostManagedProvider, } from '../../codex/HostAiAdapter.js';
export async function initialize(c) {
    const initialProvider = c.singletons.aiProvider ||
        createHostManagedProvider({
            provider: process.env.ALEMBIC_AI_PROVIDER || null,
            model: process.env.ALEMBIC_AI_MODEL || null,
        });
    const manager = createHostAiProviderManager(initialProvider);
    c.singletons._aiProviderManager = manager;
    manager._bindDiSync((provider, embed) => {
        c.singletons.aiProvider = provider;
        c.singletons._embedProvider = embed;
    });
    manager._bindDependentClearer(() => {
        const cleared = [];
        for (const key of c._aiDependentSingletons || []) {
            if (c.singletons[key]) {
                c.singletons[key] = null;
                cleared.push(key);
            }
        }
        return cleared;
    });
    manager._bindEmbedFallbackInit(() => null);
    if (c.singletons._embedProvider) {
        manager.setEmbedProvider(c.singletons._embedProvider);
    }
    c.singletons.aiProvider = manager.runtimeProvider;
    c.singletons._embedProvider = manager.embedProvider;
}
/**
 * 注册 AI 相关的服务到容器
 *
 * - 标记 AI 模块就绪
 * - 注册 aiProviderManager 服务
 * - 延迟注入 TokenRecorder（tokenUsageStore 此时已可用）
 */
export function register(c) {
    c.singletons._aiModuleReady = true;
    // 注册 aiProviderManager（消费者通过 container.get('aiProviderManager') 获取）
    c.register('aiProviderManager', () => c.singletons._aiProviderManager);
    // 延迟注入 TokenRecorder 到 manager（tokenUsageStore 在 AppModule 中注册）
    const manager = c.singletons._aiProviderManager;
    const containerRef = c;
    manager.setTokenRecorder({
        record(r) {
            try {
                const store = containerRef.get('tokenUsageStore');
                store.record(r);
            }
            catch {
                /* tokenUsageStore not available yet */
            }
        },
    });
}
