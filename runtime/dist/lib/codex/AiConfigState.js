import { collectAiEnvOverrides, maskAiEnvConfig, PROVIDER_KEY_ENV, WorkspaceSettingsStore, } from '@alembic/core/shared';
import { WorkspaceResolver } from '@alembic/core/workspace';
export function inspectCodexAiConfig(projectRoot, env = process.env) {
    const resolver = WorkspaceResolver.fromProject(projectRoot);
    const store = new WorkspaceSettingsStore(resolver);
    const workspaceConfig = store.readAiConfig();
    const processConfig = collectAiEnvOverrides(workspaceConfig.env, env);
    const rawVars = {
        ...workspaceConfig.env,
        ...processConfig,
    };
    const explicitProvider = normalizeProvider(rawVars.ALEMBIC_AI_PROVIDER);
    const inferredProvider = inferProviderFromKeys(rawVars);
    const provider = explicitProvider === 'auto' ? inferredProvider : explicitProvider || inferredProvider;
    const requiredKeyEnv = provider ? PROVIDER_KEY_ENV[provider] || null : null;
    const missingKeyEnv = requiredKeyEnv && !rawVars[requiredKeyEnv] ? requiredKeyEnv : null;
    const ready = Boolean(provider && provider !== 'mock' && (provider === 'ollama' || !missingKeyEnv));
    return {
        allowsInternalBootstrap: ready,
        hasRuntimeOverrides: Object.keys(processConfig).length > 0,
        hasSecretsFile: workspaceConfig.hasSecretsFile,
        hasSettingsFile: workspaceConfig.hasSettingsFile,
        missingKeyEnv,
        model: rawVars.ALEMBIC_AI_MODEL || null,
        provider: provider || null,
        ready,
        requiredKeyEnv,
        secretsPath: workspaceConfig.secretsPath,
        settingsPath: workspaceConfig.settingsPath,
        source: Object.keys(processConfig).length > 0
            ? 'runtime-overrides'
            : workspaceConfig.hasSettingsFile || workspaceConfig.hasSecretsFile
                ? 'workspace-settings'
                : 'empty',
        vars: maskAiEnvConfig(rawVars),
    };
}
function normalizeProvider(provider) {
    const normalized = provider?.trim().toLowerCase();
    if (!normalized) {
        return null;
    }
    if (normalized === 'google-gemini' || normalized === 'gemini') {
        return 'google';
    }
    if (normalized === 'anthropic') {
        return 'claude';
    }
    return normalized;
}
function inferProviderFromKeys(vars) {
    for (const [provider, envKey] of Object.entries(PROVIDER_KEY_ENV)) {
        if (vars[envKey]) {
            return provider;
        }
    }
    return null;
}
