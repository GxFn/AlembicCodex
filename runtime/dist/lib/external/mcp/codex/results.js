// Codex-facing MCP helper 统一返回结构，避免 server orchestration 重复拼 envelope。
export function failureResult(tool, message, data = {}) {
    return {
        success: false,
        message,
        errorCode: 'CODEX_MCP_ERROR',
        tool,
        data,
    };
}
export function isErrorResult(result) {
    if (!result || typeof result !== 'object') {
        return false;
    }
    const value = result;
    return value.ok === false || value.success === false || value.isError === true;
}
export function extractResponseError(payload) {
    if (!payload || typeof payload !== 'object') {
        return null;
    }
    const obj = payload;
    return typeof obj.message === 'string'
        ? obj.message
        : typeof obj.error?.message === 'string'
            ? obj.error.message
            : null;
}
export function attachEnhancementRoute(result, enhancementRoute) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        return result;
    }
    const record = result;
    const data = record.data && typeof record.data === 'object' && !Array.isArray(record.data)
        ? record.data
        : {};
    return {
        ...record,
        data: {
            ...data,
            enhancementRoute,
        },
    };
}
export function attachCodexServiceBoundary(result, serviceBoundary) {
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        return result;
    }
    const record = result;
    const data = record.data && typeof record.data === 'object' && !Array.isArray(record.data)
        ? record.data
        : {};
    return {
        ...record,
        data: {
            ...data,
            serviceBoundary,
        },
    };
}
