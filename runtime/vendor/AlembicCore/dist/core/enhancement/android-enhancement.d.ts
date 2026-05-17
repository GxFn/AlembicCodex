/**
 * Android Enhancement Pack
 * 条件: { languages: ['kotlin', 'java'], frameworks: ['android'] }
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class AndroidEnhancement extends EnhancementPack {
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
    detectPatterns(astSummary: AstSummary): DetectedPattern[];
}
export declare const pack: AndroidEnhancement;
export {};
