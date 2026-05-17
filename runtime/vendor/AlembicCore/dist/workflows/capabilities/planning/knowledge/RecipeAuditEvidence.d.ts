import type { AstSummary, DependencyGraph } from '../../../../types/project-snapshot.js';
export declare function extractCodeEntities(astProjectSummary: AstSummary | null | undefined): Array<{
    name: string;
    kind?: string;
    file?: string;
}>;
export declare function extractDependencyEdges(depGraphData: DependencyGraph | null | undefined): Array<{
    from: string;
    to: string;
}>;
