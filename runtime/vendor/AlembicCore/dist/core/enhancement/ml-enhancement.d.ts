/**
 * AI/ML Enhancement Pack
 * 条件: { languages: ['python'], frameworks: ['ml'] }
 *
 * 覆盖 PyTorch / TensorFlow / HuggingFace 机器学习生态:
 *   - nn.Module 模型架构
 *   - Training Loop 模式 (optimizer.zero_grad → loss.backward → optimizer.step)
 *   - DataLoader / Dataset
 *   - HuggingFace Trainer / Pipeline
 *   - 模型保存/加载 (state_dict / safetensors)
 *   - 分布式训练 (DDP / FSDP)
 */
import { type AstSummary, type DetectedPattern, EnhancementPack } from './EnhancementPack.js';
declare class MLEnhancement extends EnhancementPack {
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
export declare const pack: MLEnhancement;
export {};
