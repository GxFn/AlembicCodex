export interface RecipeDimensionFields {
    dimensionId?: string | null;
    category?: string | null;
    knowledgeType?: string | null;
    topicHint?: string | null;
    tags?: string[] | string | null;
    agentNotes?: unknown;
}
export interface RecipeDimensionResolveOptions {
    knownDimensionIds?: Iterable<string>;
}
export declare function isKnownDimensionId(value: unknown, options?: RecipeDimensionResolveOptions): value is string;
export declare function resolveRecipeDimensionId(entry: RecipeDimensionFields, options?: RecipeDimensionResolveOptions): string | null;
export declare function recipeBelongsToDimension(entry: RecipeDimensionFields, dimension: {
    id: string;
    knowledgeTypes?: readonly string[];
}, options?: RecipeDimensionResolveOptions): boolean;
export declare function recipeDimensionIdOrUnknown(entry: RecipeDimensionFields, options?: RecipeDimensionResolveOptions): string;
export declare function recipeStorageBucket(entry: RecipeDimensionFields, options?: RecipeDimensionResolveOptions): string;
export declare function dimensionTags(dimensionId: string | null | undefined, existing?: string[]): string[];
