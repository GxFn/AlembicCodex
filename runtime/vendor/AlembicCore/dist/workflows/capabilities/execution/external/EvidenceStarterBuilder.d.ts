import type { AstSummary, CallGraphResult, DependencyGraph, DimensionDef, GuardAudit } from '../../../../types/project-snapshot.js';
export interface EvidenceStarterOpts {
    astData?: AstSummary | null;
    guardAudit?: GuardAudit | null;
    depGraphData?: DependencyGraph | null;
    callGraphResult?: CallGraphResult | null;
    panoramaResult?: Record<string, unknown> | null;
}
type EvidenceStarter = {
    hint: string;
    data: unknown;
};
type WeightedEvidenceStarter = EvidenceStarter & {
    strength: number;
};
export declare function buildEvidenceStarters(dim: DimensionDef, { astData, guardAudit, depGraphData, callGraphResult, panoramaResult }: EvidenceStarterOpts): Record<string, WeightedEvidenceStarter> | undefined;
export {};
