import type { DimensionDef, MissionBriefingResult, ProjectSnapshot } from '../../../types/project-snapshot.js';
import { buildMissionBriefing } from './MissionBriefingBuilder.js';
import type { BriefingProfile, RescanBriefingInput } from './MissionBriefingSupport.js';
import { getOrCreateSessionManager } from './SessionSupport.js';
export type HostAgentSessionContainer = Parameters<typeof getOrCreateSessionManager>[0];
export type HostAgentWorkflowSession = ReturnType<ReturnType<typeof getOrCreateSessionManager>['createSession']>;
export type HostAgentMissionBriefingInput = Parameters<typeof buildMissionBriefing>[0];
export type HostAgentMissionBriefingResult = MissionBriefingResult;
export declare function createHostAgentWorkflowSession(opts: {
    container: HostAgentSessionContainer;
    projectRoot: string;
    dimensions: DimensionDef[];
    snapshot: ProjectSnapshot;
    primaryLang: string | null;
    fileCount: number;
    moduleCount: number;
}): HostAgentWorkflowSession;
export declare function buildHostAgentMissionBriefing(opts: {
    projectRoot: string;
    primaryLang: string | null;
    secondaryLanguages?: string[];
    isMultiLang?: boolean;
    fileCount: number;
    projectType: string;
    profile?: BriefingProfile;
    rescan?: RescanBriefingInput;
    briefing: Omit<HostAgentMissionBriefingInput, 'projectMeta' | 'languageExtension' | 'profile' | 'rescan'>;
}): MissionBriefingResult;
export declare function getActiveHostAgentWorkflowSession(container: HostAgentSessionContainer, sessionId?: string): HostAgentWorkflowSession | null;
