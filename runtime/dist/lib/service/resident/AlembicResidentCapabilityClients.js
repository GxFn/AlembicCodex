import { AlembicResidentServiceClient, } from './AlembicResidentServiceClient.js';
export class ResidentProbeClient {
    client;
    constructor(client) {
        this.client = client;
    }
    probe(options = {}) {
        return this.client.probe(options);
    }
}
export class ResidentProjectScopeClient {
    client;
    constructor(client) {
        this.client = client;
    }
    resolveProjectScopeIdentity(options = {}) {
        return this.client.resolveProjectScopeIdentity(options);
    }
}
export class ResidentSearchClient {
    client;
    constructor(client) {
        this.client = client;
    }
    search(request) {
        return this.client.search(request);
    }
    searchWithResult(request) {
        return this.client.searchWithResult(request);
    }
}
export class ResidentIntentEpisodeClient {
    client;
    constructor(client) {
        this.client = client;
    }
    latestIntentEpisode(options = {}) {
        return this.client.latestIntentEpisode(options);
    }
    recentIntentEpisodes(options = {}) {
        return this.client.recentIntentEpisodes(options);
    }
    startIntentEpisode(request) {
        return this.client.startIntentEpisode(request);
    }
    updateIntentEpisodeOutcome(episodeId, request) {
        return this.client.updateIntentEpisodeOutcome(episodeId, request);
    }
}
export class ResidentDecisionRegisterClient {
    client;
    constructor(client) {
        this.client = client;
    }
    decisionRegister(request) {
        return this.client.decisionRegister(request);
    }
    decisionRegisterCapability(options = {}) {
        return this.client.decisionRegisterCapability(options);
    }
}
export class ResidentJobClient {
    client;
    constructor(client) {
        this.client = client;
    }
    enqueueJob(kind, options = {}) {
        return this.client.enqueueJob(kind, options);
    }
    readJob(args, options = {}) {
        return this.client.readJob(args, options);
    }
}
export class ResidentDashboardClient {
    client;
    constructor(client) {
        this.client = client;
    }
    dashboard(options = {}) {
        return this.client.dashboard(options);
    }
}
export function createAlembicResidentCapabilityClients(options) {
    const client = new AlembicResidentServiceClient(options);
    return {
        dashboard: new ResidentDashboardClient(client),
        decisionRegister: new ResidentDecisionRegisterClient(client),
        jobs: new ResidentJobClient(client),
        intentEpisodes: new ResidentIntentEpisodeClient(client),
        probe: new ResidentProbeClient(client),
        projectScope: new ResidentProjectScopeClient(client),
        search: new ResidentSearchClient(client),
    };
}
export function isResidentProjectScopeReady(identity) {
    return (identity?.available === true &&
        identity.mode === 'project-scope' &&
        identity.resident.owner === 'alembic' &&
        identity.resident.route === 'local-alembic-daemon');
}
