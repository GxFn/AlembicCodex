/**
 * Rust Web Enhancement Pack
 * 条件: { languages: ['rust'], frameworks: ['actix-web', 'axum', 'rocket', 'warp'] }
 *
 * 覆盖主流 Rust HTTP 框架:
 *   - Axum (tower-based, 最流行)
 *   - Actix-web (actor 模型)
 *   - Rocket (宏驱动)
 *   - Warp (filter 组合)
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class RustWebEnhancement extends EnhancementPack {
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
export declare const pack: RustWebEnhancement;
export {};
