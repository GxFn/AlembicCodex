export type BootstrapTerminalToolset = 'baseline' | 'terminal-run' | 'terminal-shell' | 'terminal-pty';
export type BootstrapTerminalMode = 'run' | 'shell' | 'pty';
export interface BootstrapTerminalToolsetConfig {
    enabled: boolean;
    toolset: BootstrapTerminalToolset;
    modes: BootstrapTerminalMode[];
}
export declare function resolveBootstrapTerminalToolset(): BootstrapTerminalToolsetConfig;
export declare function getBootstrapStageTerminalTools(stageName: string, config: BootstrapTerminalToolsetConfig): string[];
export declare function buildBootstrapTerminalPolicyHints(config: BootstrapTerminalToolsetConfig): {
    terminalCapability: {
        enabled: boolean;
        toolset: BootstrapTerminalToolset;
        modes: BootstrapTerminalMode[];
        scriptAllowed: boolean;
    };
    constraints: string[];
};
