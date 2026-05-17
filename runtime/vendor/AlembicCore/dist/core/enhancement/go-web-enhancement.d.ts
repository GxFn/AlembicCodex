/**
 * Go Web Enhancement Pack
 * 条件: { languages: ['go'], frameworks: ['gin', 'echo', 'fiber', 'chi', 'gorilla', 'beego'] }
 *
 * 覆盖所有主流 Go HTTP 框架:
 *   - Gin, Echo, Fiber, Chi, Gorilla Mux, Beego
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class GoWebEnhancement extends EnhancementPack {
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
export declare const pack: GoWebEnhancement;
export {};
