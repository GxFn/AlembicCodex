/**
 * Core 内部使用的轻量响应封装。
 *
 * 外层 MCP/HTTP handler 可以继续包自己的 transport envelope；
 * 这里仅保证 workflow projection 有稳定的数据形状。
 */
export function envelope({ success, data = null, message = '', meta = {}, errorCode = null, }) {
    return {
        success: Boolean(success),
        errorCode,
        message,
        data,
        meta: {
            ...meta,
        },
    };
}
