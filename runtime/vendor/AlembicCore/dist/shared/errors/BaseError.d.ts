/** BaseError - 所有错误的基类 */
export declare class BaseError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code: string, statusCode?: number);
    toJSON(): {
        name: string;
        code: string;
        message: string;
        statusCode: number;
    };
}
/** PermissionDenied - 权限拒绝错误 */
export declare class PermissionDenied extends BaseError {
    constructor(message: string);
}
/** ConstitutionViolation - 宪法违反错误 */
export declare class ConstitutionViolation extends BaseError {
    violations: Array<{
        rule: string;
    }>;
    constructor(violations: Array<{
        rule: string;
    }>);
}
/** ValidationError - 验证错误 */
export declare class ValidationError extends BaseError {
    details: Record<string, unknown>;
    constructor(message: string, details?: Record<string, unknown>);
}
/** NotFoundError - 资源未找到错误 */
export declare class NotFoundError extends BaseError {
    resource: string | undefined;
    resourceId: string | undefined;
    constructor(message: string, resource?: string, resourceId?: string);
}
/** ConflictError - 资源冲突错误 */
export declare class ConflictError extends BaseError {
    details: Record<string, unknown>;
    constructor(message: string, details: Record<string, unknown>);
}
/** InternalError - 内部错误 */
export declare class InternalError extends BaseError {
    constructor(message: string);
}
