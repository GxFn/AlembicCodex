export const NON_INTERACTIVE_ENV = {
    CI: '1',
    GIT_PAGER: 'cat',
    GIT_TERMINAL_PROMPT: '0',
    LESS: '-FRX',
    PAGER: 'cat',
};
const ALWAYS_STRIP_HOST_ENV = new Set([
    'DOCKER_HOST',
    'KUBECONFIG',
    'SSH_AGENT_PID',
    'SSH_AUTH_SOCK',
]);
const SENSITIVE_HOST_ENV_PATTERN = /(API_KEY|ACCESS_KEY|AUTH|CONNECTION_STRING|COOKIE|CREDENTIAL|DATABASE_URL|PASSWD|PASSWORD|PRIVATE_KEY|REDIS_URL|SECRET|SESSION|TOKEN)/i;
export function buildTerminalEnvironment(env, commandEnv = {}) {
    return {
        ...stripSensitiveHostEnv(env),
        ...commandEnv,
        ...NON_INTERACTIVE_ENV,
    };
}
export function buildCommandEnvironment(sessionEnv, commandEnv) {
    return {
        ...sessionEnv,
        ...commandEnv,
    };
}
function stripSensitiveHostEnv(env) {
    const clean = {};
    for (const [key, value] of Object.entries(env)) {
        if (value !== undefined && !isSensitiveHostEnvKey(key)) {
            clean[key] = value;
        }
    }
    return clean;
}
function isSensitiveHostEnvKey(key) {
    return ALWAYS_STRIP_HOST_ENV.has(key) || SENSITIVE_HOST_ENV_PATTERN.test(key);
}
export function summarizeTerminalEnv(env, persistence) {
    return {
        keys: Object.keys(env).sort(),
        persistence,
    };
}
