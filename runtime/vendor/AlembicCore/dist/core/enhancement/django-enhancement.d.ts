/**
 * Django Enhancement Pack
 * 条件: { languages: ['python'], frameworks: ['django'] }
 *
 * 覆盖 Django 全栈生态:
 *   - Model 字段/关系/Manager/QuerySet
 *   - DRF (Django REST Framework) Serializer/ViewSet
 *   - URL 路由约定
 *   - Signal (pre_save/post_save)
 *   - Middleware
 *   - Management Command
 *   - Celery Task 集成
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class DjangoEnhancement extends EnhancementPack {
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
export declare const pack: DjangoEnhancement;
export {};
