import type { DimensionDef, MissionBriefingResult, ProjectSnapshot } from '../../../../types/project-snapshot.js';
import { buildMissionBriefing } from './MissionBriefingBuilder.js';
import type { BriefingProfile, RescanBriefingInput } from './MissionBriefingSupport.js';
import { getOrCreateSessionManager } from './SessionSupport.js';
export type ExternalSessionContainer = Parameters<typeof getOrCreateSessionManager>[0];
export type ExternalWorkflowSession = ReturnType<ReturnType<typeof getOrCreateSessionManager>['createSession']>;
export type ExternalMissionBriefingInput = Parameters<typeof buildMissionBriefing>[0];
export type ExternalMissionBriefingResult = MissionBriefingResult;
export declare function createExternalWorkflowSession(opts: {
    container: ExternalSessionContainer;
    projectRoot: string;
    dimensions: DimensionDef[];
    snapshot: ProjectSnapshot;
    primaryLang: string | null;
    fileCount: number;
    moduleCount: number;
}): ExternalWorkflowSession;
export declare function buildExternalMissionBriefing(opts: {
    projectRoot: string;
    primaryLang: string | null;
    secondaryLanguages?: string[];
    isMultiLang?: boolean;
    fileCount: number;
    projectType: string;
    profile?: BriefingProfile;
    rescan?: RescanBriefingInput;
    briefing: Omit<ExternalMissionBriefingInput, 'projectMeta' | 'languageExtension' | 'profile' | 'rescan'>;
}): MissionBriefingResult;
export declare function getActiveExternalWorkflowSession(container: ExternalSessionContainer, sessionId?: string): ExternalWorkflowSession | null;
