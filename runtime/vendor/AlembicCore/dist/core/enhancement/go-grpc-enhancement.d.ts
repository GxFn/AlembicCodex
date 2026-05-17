/**
 * Go gRPC Enhancement Pack
 * 条件: { languages: ['go'], frameworks: ['grpc'] }
 *
 * 覆盖 gRPC Go 微服务项目:
 *   - protobuf service 实现
 *   - Unimplemented*Server 嵌入
 *   - 流式/一元 RPC 方法
 *   - interceptor 链
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class GoGrpcEnhancement extends EnhancementPack {
    get id(): string;
    get displayName(): string;
    get conditions(): {
        languages: string[];
        frameworks: string[];
    };
    getExtraDimensions(): {
        id: string;
        label: string;
        guide: string;
        tierHint: number;
        knowledgeTypes: string[];
        skillWorthy: boolean;
        dualOutput: boolean;
        skillMeta: {
            name: string;
            description: string;
        };
    }[];
    getGuardRules(): {
        ruleId: string;
        category: string;
        dimension: string;
        severity: string;
        languages: string[];
        pattern: RegExp;
        message: string;
    }[];
    detectPatterns(astSummary: AstSummary): DetectedPattern[];
}
export declare const pack: GoGrpcEnhancement;
export {};
