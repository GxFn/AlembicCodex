import { WorkspaceResolver } from './WorkspaceResolver.js';
export declare const AI_SECRET_ENV_KEYS: Set<string>;
export declare const AI_ENV_KEYS: readonly ["ALEMBIC_AI_PROVIDER", "ALEMBIC_AI_MODEL", "ALEMBIC_GOOGLE_API_KEY", "ALEMBIC_OPENAI_API_KEY", "ALEMBIC_CLAUDE_API_KEY", "ALEMBIC_DEEPSEEK_API_KEY", "ALEMBIC_AI_PROXY", "ALEMBIC_AI_REASONING_EFFORT", "ALEMBIC_EMBED_PROVIDER", "ALEMBIC_EMBED_MODEL", "ALEMBIC_EMBED_BASE_URL", "ALEMBIC_EMBED_API_KEY"];
export declare const PROVIDER_KEY_ENV: Record<string, string>;
export interface WorkspaceAiSettings {
    provider?: string;
    model?: string;
    proxy?: string;
    reasoningEffort?: string;
    embedProvider?: string;
    embedModel?: string;
    embedBaseUrl?: string;
}
export interface WorkspaceAiConfigRead {
    env: Record<string, string>;
    hasSecretsFile: boolean;
    hasSettingsFile: boolean;
    secretsPath: string;
    settingsPath: string;
}
export type AiConfigSource = 'workspace-settings' | 'process-env' | 'empty';
export declare class WorkspaceSettingsStore {
    #private;
    readonly resolver: WorkspaceResolver;
    readonly settingsPath: string;
    readonly secretsPath: string;
    constructor(resolver: WorkspaceResolver);
    static fromProject(projectRoot: string): WorkspaceSettingsStore;
    readAiConfig(): WorkspaceAiConfigRead;
    writeAiConfig(updates: Record<string, string>): WorkspaceAiConfigRead;
    applyToProcessEnv(options?: {
        override?: boolean;
    }): WorkspaceAiConfigRead;
}
export declare function isAiEnvReady(env: Record<string, string>): boolean;
export declare function collectAiEnv(env?: Record<string, string | undefined>): Record<string, string>;
export declare function collectAiEnvOverrides(baseEnv: Record<string, string>, env?: Record<string, string | undefined>): Record<string, string>;
export declare function maskAiSecret(value: string): string;
export declare function maskAiEnvConfig(env: Record<string, string>): Record<string, string>;
