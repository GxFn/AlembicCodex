/**
 * MCP Handler — alembic_task (Intent Lifecycle + Signal Collection)
 *
 * 5 Operations:
 *   prime            — Load knowledge context + initialize intent
 *   create           — Create in-memory task anchor (generates ID)
 *   close            — Complete task + persist intent chain + conditionally recommend Guard
 *   fail             — Abandon task + persist intent chain
 *   record_decision  — Record user preference signal
 *
 * Architecture: Zero DB. Pure memory (IntentState) + SignalBus → JSONL signals.
 */
import { resolveProjectRoot } from '@alembic/core/workspace';
import { buildCodexPrimeRuntimeContext } from '#codex/runtime/ProjectRuntimeContext.js';
import { GitDiffScanner } from '#service/evolution/git-diff-checkpoint/GitDiffScanner.js';
import { buildHostIntentFrame, buildResidentIntentHandoff, prepareHostIntentInput, } from '#service/task/HostIntentFrame.js';
import { extract as extractIntent } from '#service/task/IntentExtractor.js';
import { classifyTaskLifecycleInput, decideGuardTrigger, normalizeTaskLifecycleFileRefs, } from '#service/task/TaskLifecyclePolicy.js';
import { envelope } from '../envelope.js';
import { createIdleIntent } from './types.js';
// ─── In-memory task ID counter ───────────────────────────
let _taskCounter = 0;
let _primeReceiptCounter = 0;
const _primeReceiptOrder = 'This receipt must be the next developer-visible response after the prime tool result, before any further tool call, code reading, edit, Guard check, or final summary.';
function _generateTaskId() {
    _taskCounter++;
    return `alembic-${Date.now().toString(36)}-${_taskCounter}`;
}
function _generatePrimeReceiptId() {
    _primeReceiptCounter++;
    return `prime-${Date.now().toString(36)}-${_primeReceiptCounter}`;
}
// ─── Task Rules Reminder ─────────────────────────────────
const _taskRules = {
    reminder: [
        '📋 TASK LIFECYCLE RULES (CODEX-AWARE):',
        '🔑 YOU are the task operator — user speaks naturally, you translate to task operations.',
        '• Prime only when project knowledge is relevant to the current semantic task; do not raw-prime automation or direct-thread envelopes.',
        '• Create task anchors for explicit implementation/fix/refactor/multi-step code evidence work; skip read-only, status, Design, and automation-control turns.',
        '• Close only an existing task anchor, with a meaningful reason.',
        '• Guard after close only when task-scoped guard-relevant code diff exists; pass explicit files instead of no-args Guard.',
        '• When user agrees/disagrees → record_decision immediately',
        '• NEVER tell user to run task commands',
    ].join('\n'),
    translationHint: [
        'User Says → You Run:',
        '"fix bug"/"implement" → create→code→close',
        '"continue" → resume in-progress→close',
        '"pause"/"abandon" → fail(id, reason)',
        '"agreed"/"disagree" → record_decision',
        'Quick question/status/read-only/design/envelope → no task anchor; answer or report status.',
    ].join('\n'),
};
/**
 * Unified entry point
 */
export async function taskHandler(ctx, args) {
    // Normalize taskId → id (schema accepts both for convenience)
    if (!args.id && typeof args.taskId === 'string') {
        args.id = args.taskId;
    }
    let result;
    switch (args.operation) {
        case 'prime':
            return _prime(ctx, args);
        case 'create':
            result = await _create(ctx, args);
            break;
        case 'close':
            result = await _close(ctx, args);
            break;
        case 'fail':
            result = await _fail(ctx, args);
            break;
        case 'record_decision':
            result = await _recordDecision(ctx, args);
            break;
        default:
            return envelope({
                success: false,
                message: `Unknown operation: ${args.operation}. Valid: prime, create, close, fail, record_decision.`,
                meta: { tool: 'alembic_task' },
            });
    }
    return result;
}
// ═══ prime ═══════════════════════════════════════════════
async function _prime(ctx, args) {
    const intent = ctx.session?.intent;
    // If there is an active intent, persist it as abandoned before starting fresh
    if (intent && intent.phase === 'active') {
        await _persistIntentChain(ctx, intent, 'abandoned', 'New prime received', intent.taskId);
    }
    // ─── Intake: merge Codex host hints with deterministic intent signals ───
    const hostIntentInput = prepareHostIntentInput({
        userQuery: args.userQuery,
        activeFile: args.activeFile,
        language: args.language,
        hostDeclaredIntent: args.hostDeclaredIntent,
        hostTurnMeta: args.hostTurnMeta,
        requestHostTurnMeta: ctx.hostTurnMeta,
    });
    const extracted = extractIntent(hostIntentInput.userQuery, hostIntentInput.activeFile, hostIntentInput.language);
    const hostIntentFrame = buildHostIntentFrame(hostIntentInput, extracted);
    const projectRoot = typeof args.projectRoot === 'string' && args.projectRoot.trim()
        ? args.projectRoot.trim()
        : undefined;
    const effectiveProjectRoot = projectRoot ?? resolveProjectRoot(ctx.container);
    const lifecycleClassification = classifyTaskLifecycleInput({
        hostIntentFrame,
        operation: 'prime',
        rawUserQuery: typeof args.userQuery === 'string' ? args.userQuery : undefined,
        userQuery: hostIntentInput.userQuery,
    });
    // ─── Enrichment: multi-query search via PrimeSearchPipeline ───
    const pipeline = _getPipeline(ctx.container);
    let searchResult = null;
    let searchDegraded = false;
    if (lifecycleClassification.primeDecision.action === 'skip') {
        process.stderr.write(`[MCP/Task] prime: lifecycle policy skipped search (${lifecycleClassification.primeDecision.reasonCode})\n`);
    }
    else if (pipeline && extracted.queries[0]?.trim()) {
        try {
            searchResult = await pipeline.search(extracted, {
                hostIntentFrame,
                projectRoot: effectiveProjectRoot,
            });
            if (!searchResult) {
                process.stderr.write('[MCP/Task] prime: pipeline.search returned null (all filtered)\n');
            }
        }
        catch (err) {
            searchDegraded = true;
            process.stderr.write(`[MCP/Task] prime search error: ${err instanceof Error ? err.stack || err.message : String(err)}\n`);
        }
    }
    else if (!pipeline) {
        searchDegraded = true;
        process.stderr.write('[MCP/Task] prime: pipeline is null, skipping search\n');
    }
    else {
        process.stderr.write(`[MCP/Task] prime: queries empty, skipping search. queries=${JSON.stringify(extracted.queries)}\n`);
    }
    const projectRuntime = buildCodexPrimeRuntimeContext({
        projectRoot: effectiveProjectRoot,
        residentSearch: searchResult?.searchMeta.residentSearch ?? null,
    });
    // ─── Lifecycle: initialize IntentState ───
    const freshIntent = createIdleIntent();
    freshIntent.phase = 'active';
    freshIntent.primeQuery = hostIntentInput.userQuery;
    freshIntent.primeActiveFile = hostIntentInput.activeFile;
    freshIntent.primeLanguage = extracted.language;
    freshIntent.primeModule = extracted.module;
    freshIntent.primeScenario = extracted.scenario;
    freshIntent.hostIntentFrame = hostIntentFrame;
    freshIntent.primeAt = Date.now();
    if (searchResult) {
        freshIntent.primeRecipeIds = [...searchResult.relatedKnowledge, ...searchResult.guardRules]
            .map((r) => r.id)
            .filter(Boolean);
        freshIntent.searchMeta = {
            queries: searchResult.searchMeta.queries,
            resultCount: searchResult.searchMeta.resultCount,
            filteredCount: searchResult.searchMeta.filteredCount,
            ...(searchResult.searchMeta.intentEvidence
                ? { intentEvidence: searchResult.searchMeta.intentEvidence }
                : {}),
            ...(searchResult.searchMeta.primeInjectionPackage
                ? { primeInjectionPackage: searchResult.searchMeta.primeInjectionPackage }
                : {}),
            projectRuntime: projectRuntime,
            ...(searchResult.searchMeta.residentSearch
                ? {
                    residentSearch: searchResult.searchMeta.residentSearch,
                }
                : {}),
        };
    }
    const intentEpisode = await _handoffIntentEpisode(ctx, {
        extracted,
        hostIntentFrame,
        hostIntentInput,
        intent: freshIntent,
    });
    if (intentEpisode.current?.episodeId) {
        freshIntent.intentEpisode = {
            episodeId: intentEpisode.current.episodeId,
            sessionKey: intentEpisode.current.sessionKey,
            startAvailable: intentEpisode.available,
        };
    }
    // Bind intent to session
    if (ctx.session) {
        ctx.session.intent = freshIntent;
    }
    // ─── Build response ───
    const relatedCount = searchResult?.relatedKnowledge.length ?? 0;
    const ruleCount = searchResult?.guardRules.length ?? 0;
    const primeKnowledgeMaterial = _buildPrimeKnowledgeMaterial({
        hostIntentInput,
        extracted,
        hostIntentFrame,
        searchResult,
        searchDegraded,
        intentEpisode,
        taskAnchorDecision: lifecycleClassification.taskAnchorDecision,
    });
    const lines = [];
    if (lifecycleClassification.primeDecision.action === 'skip') {
        lines.push(`Prime search skipped by Codex task lifecycle policy: ${lifecycleClassification.primeDecision.reasonCode}.`);
        lines.push(_formatPrimeTrustPostureMessage(primeKnowledgeMaterial.trustPosture));
        lines.push('📣 Codex must say no project knowledge was searched because the lifecycle policy skipped prime for this turn; continue only within the visible task boundary and do not claim accepted project knowledge.');
    }
    else if (primeKnowledgeMaterial.status === 'degraded') {
        lines.push('Prime knowledge search degraded; no project knowledge was delivered.');
        lines.push(_formatPrimeTrustPostureMessage(primeKnowledgeMaterial.trustPosture));
        lines.push('📣 Codex must immediately shout in the first person that it did not receive usable project knowledge because prime degraded before any further tool call, code reading, edit, Guard check, or final summary. Say the trust posture is not-available-or-degraded, and do not claim trusted-to-use or trusted-to-obey project knowledge. Do not make Alembic prime the speaker or subject.');
    }
    else if (relatedCount > 0 || ruleCount > 0) {
        lines.push(`📋 Found ${relatedCount} recipe(s), ${ruleCount} guard rule(s).`);
        for (const r of searchResult?.relatedKnowledge ?? []) {
            const hint = r.actionHint ? ` — ${r.actionHint}` : '';
            lines.push(`  • ${r.trigger || r.title}${hint}`);
        }
        for (const r of searchResult?.guardRules ?? []) {
            lines.push(`  • [rule] ${r.trigger || r.title}`);
        }
        lines.push(_formatPrimeTrustPostureMessage(primeKnowledgeMaterial.trustPosture));
        lines.push('📣 Codex must immediately shout a short knowledge receipt before any further tool call, code reading, edit, Guard check, or final summary. Speak as Codex or I, not as Alembic prime: summarize trusted-to-obey Guard constraints, trusted-to-use Recipe or pattern knowledge, context-only host intent or evidence hints, and requires-verification source refs or candidates; keep evidenceRefs in the payload for later verification instead of listing paths by default.');
    }
    else {
        lines.push('No matching recipes found.');
        lines.push(_formatPrimeTrustPostureMessage(primeKnowledgeMaterial.trustPosture));
        lines.push('📣 Codex must immediately shout in the first person that it did not receive usable project knowledge before any further tool call, code reading, edit, Guard check, or final summary. Say the trust posture is not-available-or-degraded, and do not claim trusted-to-use or trusted-to-obey project knowledge. Do not make Alembic prime the speaker or subject.');
    }
    return envelope({
        success: true,
        data: {
            primeKnowledgeMaterial,
            knowledge: searchResult
                ? {
                    relatedKnowledge: searchResult.relatedKnowledge,
                    guardRules: searchResult.guardRules,
                }
                : null,
            searchMeta: searchResult
                ? { ...searchResult.searchMeta, projectRuntime }
                : { projectRuntime },
            projectRuntime,
            intentEpisode,
            lifecyclePolicy: lifecycleClassification,
            _taskRules,
        },
        message: lines.join('\n'),
        meta: { tool: 'alembic_task' },
    });
}
function _buildPrimeKnowledgeMaterial(input) {
    const relatedKnowledge = input.searchResult?.relatedKnowledge ?? [];
    const guardRules = input.searchResult?.guardRules ?? [];
    const acceptedKnowledge = relatedKnowledge.map(_projectAcceptedKnowledge);
    const acceptedGuards = guardRules.map(_projectAcceptedGuard);
    const hasDeliveredKnowledge = acceptedKnowledge.length > 0 || acceptedGuards.length > 0;
    const status = input.searchDegraded
        ? 'degraded'
        : hasDeliveredKnowledge
            ? 'delivered'
            : 'empty';
    const receiptId = _generatePrimeReceiptId();
    const intent = {
        userQuery: input.hostIntentInput.userQuery,
        scenario: input.searchResult?.searchMeta.scenario ?? input.extracted.scenario,
        queries: input.searchResult?.searchMeta.queries ?? input.extracted.queries,
        hostIntentFrame: input.hostIntentFrame,
    };
    if (input.hostIntentInput.activeFile) {
        intent.activeFile = _redactVisiblePath(input.hostIntentInput.activeFile);
    }
    const language = input.searchResult?.searchMeta.language ?? input.extracted.language;
    if (language) {
        intent.language = language;
    }
    const moduleName = input.searchResult?.searchMeta.module ?? input.extracted.module;
    if (moduleName) {
        intent.module = moduleName;
    }
    const trustPosture = _buildPrimeTrustPosture({
        acceptedGuards,
        acceptedKnowledge,
        intent,
        searchResult: input.searchResult,
        status,
    });
    return {
        status,
        receiptId,
        intent,
        acceptedKnowledge,
        acceptedGuards,
        trustPosture,
        shoutInstruction: _buildPrimeShoutInstruction(status, trustPosture),
        hostResponse: _buildPrimeHostResponseInstruction(status, receiptId, trustPosture),
        nextActions: _buildPrimeKnowledgeNextActions(input.taskAnchorDecision),
        intentEpisode: input.intentEpisode,
        ...(input.searchResult?.searchMeta.intentEvidence
            ? { intentEvidence: input.searchResult.searchMeta.intentEvidence }
            : {}),
        ...(input.searchResult?.searchMeta.primeInjectionPackage
            ? { primeInjectionPackage: input.searchResult.searchMeta.primeInjectionPackage }
            : {}),
    };
}
function _buildPrimeTrustPosture(input) {
    const primePackage = input.searchResult?.searchMeta.primeInjectionPackage;
    const packageStatus = primePackage?.injection.status;
    const packageNeedsVerification = _isPrimePackageVerificationStatus(packageStatus);
    const packageUnavailable = _isPrimePackageUnavailableStatus(packageStatus);
    const acceptedKnowledgeIds = new Set(input.acceptedKnowledge.map((item) => item.id));
    const trustedToObey = input.acceptedGuards.map((guard) => ({
        id: `guard:${guard.id}`,
        title: guard.trigger || guard.title,
        source: 'accepted-guard',
        reason: 'Follow this Guard or rule as an accepted constraint before acting.',
        evidenceRefs: guard.evidenceRefs,
    }));
    const trustedToUse = packageNeedsVerification || packageUnavailable
        ? []
        : input.acceptedKnowledge.map((item) => ({
            id: `knowledge:${item.id}`,
            title: item.trigger || item.title,
            source: 'accepted-knowledge',
            reason: 'Use this Recipe or pattern as project knowledge while preserving its evidence for later checks.',
            evidenceRefs: item.evidenceRefs,
        }));
    if (packageStatus === 'ready') {
        for (const item of primePackage?.selectedKnowledge ?? []) {
            const itemId = _recordString(item, 'itemId');
            if (!itemId || acceptedKnowledgeIds.has(itemId)) {
                continue;
            }
            trustedToUse.push({
                id: `prime-package-selected:${itemId}`,
                title: _recordString(item, 'trigger') ?? _recordString(item, 'title') ?? itemId,
                source: 'prime-injection-package',
                reason: 'Use this resident-selected knowledge because the prime injection package marked it ready.',
                status: _recordString(item, 'injectionStatus') ?? packageStatus,
                evidenceRefs: _extractEvidenceRefs(_recordStringArray(item.sourceRefs)),
            });
        }
    }
    const contextOnly = [
        {
            id: 'prime-query-context',
            title: 'Prime query, scenario, and generated search queries',
            source: 'search-context',
            reason: 'Use the query and scenario to steer search and receipt wording; do not present them as verified project facts.',
        },
    ];
    if (input.intent.hostIntentFrame) {
        contextOnly.push({
            id: 'host-intent-frame',
            title: 'Codex host intent frame',
            source: 'host-intent',
            reason: 'Treat host-declared intent and host turn metadata as navigation hints, not trusted project knowledge.',
            status: input.intent.hostIntentFrame.degraded
                ? 'degraded'
                : input.intent.hostIntentFrame.source,
        });
    }
    if (input.searchResult?.searchMeta.intentEvidence) {
        contextOnly.push({
            id: 'resident-intent-evidence',
            title: 'Resident intent evidence summary',
            source: 'intent-evidence',
            reason: 'Use ranking, relation, and anchor evidence as context for why material was selected, not as a rule to obey.',
            status: input.searchResult.searchMeta.intentEvidence.degraded ? 'degraded' : 'available',
        });
    }
    const requiresVerification = [];
    const acceptedEvidenceRefs = _uniquePrimeEvidenceRefs([...input.acceptedKnowledge, ...input.acceptedGuards].flatMap((item) => item.evidenceRefs));
    if (acceptedEvidenceRefs.length > 0) {
        requiresVerification.push({
            id: 'accepted-material-evidence',
            title: 'Accepted material evidenceRefs',
            source: 'evidence-ref',
            reason: 'Keep evidenceRefs as verification inputs for later code reading or user-requested citations; do not dump paths in the receipt by default.',
            evidenceRefs: acceptedEvidenceRefs,
        });
    }
    const packageTraceRefs = _extractEvidenceRefs(primePackage?.trace.sourceRefs ?? []);
    if (packageTraceRefs.length > 0) {
        requiresVerification.push({
            id: 'prime-package-source-refs',
            title: 'Prime package sourceRefs',
            source: 'prime-injection-package',
            reason: 'Treat sourceRefs from the injection package as verification anchors, not as automatically verified facts.',
            evidenceRefs: packageTraceRefs,
            status: packageStatus,
        });
    }
    if (packageNeedsVerification) {
        requiresVerification.push({
            id: `prime-package-status:${packageStatus}`,
            title: `Prime injection package status: ${packageStatus}`,
            source: 'prime-injection-package',
            reason: 'Candidate or needs-confirmation knowledge must be named as requiring verification before it is acted on as trusted project knowledge.',
            status: packageStatus,
        });
    }
    for (const item of primePackage?.selectedKnowledge ?? []) {
        const injectionStatus = _recordString(item, 'injectionStatus');
        if (injectionStatus !== 'candidate') {
            continue;
        }
        const itemId = _recordString(item, 'itemId') ?? 'unknown';
        requiresVerification.push({
            id: `candidate-knowledge:${itemId}`,
            title: _recordString(item, 'trigger') ?? _recordString(item, 'title') ?? itemId,
            source: 'prime-injection-package',
            reason: 'This selectedKnowledge item is only a candidate and must be presented as requiring verification.',
            status: injectionStatus,
            evidenceRefs: _extractEvidenceRefs(_recordStringArray(item.sourceRefs)),
        });
    }
    const notAvailableOrDegraded = [];
    if (input.status === 'empty' || input.status === 'degraded') {
        notAvailableOrDegraded.push({
            id: `prime-status:${input.status}`,
            title: input.status === 'degraded'
                ? 'Prime knowledge search degraded'
                : 'No matching Recipe or Guard knowledge delivered',
            source: 'prime-status',
            reason: input.status === 'degraded'
                ? 'Do not claim usable project knowledge was received; continue only with explicit code reading and verification.'
                : 'Do not claim project-specific knowledge was accepted; continue with normal code reading and verification.',
            status: input.status,
        });
    }
    if (packageUnavailable) {
        notAvailableOrDegraded.push({
            id: `prime-package-unavailable:${packageStatus}`,
            title: `Prime injection package status: ${packageStatus}`,
            source: 'prime-injection-package',
            reason: 'The resident injection package did not provide trusted project knowledge for the receipt.',
            status: packageStatus,
        });
    }
    return {
        status: input.status,
        receiptChecklist: [
            _buildPrimeTrustChecklistLayer('trusted-to-obey', trustedToObey),
            _buildPrimeTrustChecklistLayer('trusted-to-use', trustedToUse),
            _buildPrimeTrustChecklistLayer('context-only', contextOnly),
            _buildPrimeTrustChecklistLayer('requires-verification', requiresVerification),
            _buildPrimeTrustChecklistLayer('not-available-or-degraded', notAvailableOrDegraded),
        ],
        antiEmptyReceipt: {
            required: true,
            forbiddenGenericReceipts: [
                'received knowledge',
                'I received project knowledge',
                '收到了知识',
            ],
            instruction: 'The developer-visible receipt must name the trust layers that are present; a generic received/accepted slogan is not sufficient.',
        },
    };
}
function _buildPrimeTrustChecklistLayer(layer, items) {
    return {
        layer,
        label: _primeTrustLayerLabel(layer),
        summary: items.length > 0 ? `${items.length} item(s) require receipt handling.` : 'No items.',
        items,
        requiredInVisibleReceipt: items.length > 0,
        visibleReceiptDirective: _primeTrustLayerDirective(layer),
    };
}
function _primeTrustLayerLabel(layer) {
    switch (layer) {
        case 'trusted-to-obey':
            return 'Guard and rule constraints Codex must obey';
        case 'trusted-to-use':
            return 'Recipe or pattern knowledge Codex may use';
        case 'context-only':
            return 'Host intent, query, and evidence context only';
        case 'requires-verification':
            return 'Source refs, candidates, and evidence that require verification';
        case 'not-available-or-degraded':
            return 'Missing or degraded project knowledge';
    }
}
function _primeTrustLayerDirective(layer) {
    switch (layer) {
        case 'trusted-to-obey':
            return 'In the visible receipt, say which Guard or rule constraints I will obey.';
        case 'trusted-to-use':
            return 'In the visible receipt, say which Recipe or pattern knowledge I can use as project guidance.';
        case 'context-only':
            return 'In the visible receipt, name host intent, queries, and evidence summaries only as context or hints.';
        case 'requires-verification':
            return 'In the visible receipt, say candidate knowledge, source refs, and evidence refs require later verification.';
        case 'not-available-or-degraded':
            return 'In the visible receipt, say no usable project knowledge was delivered when this layer has items.';
    }
}
function _formatPrimeTrustPostureMessage(posture) {
    const counts = posture.receiptChecklist
        .map((entry) => `${entry.layer}=${entry.items.length}`)
        .join(', ');
    return `Trust posture checklist: ${counts}. A visible receipt must name the obey/use/context/verify/degraded boundaries and cannot be a generic received-knowledge slogan.`;
}
function _isPrimePackageVerificationStatus(status) {
    return status === 'candidate' || status === 'needs-confirmation';
}
function _isPrimePackageUnavailableStatus(status) {
    return status === 'degraded' || status === 'empty';
}
function _recordString(record, key) {
    const value = record[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
function _recordStringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
}
function _uniquePrimeEvidenceRefs(refs) {
    const seen = new Set();
    const unique = [];
    for (const ref of refs) {
        const key = `${ref.path}\0${ref.line ?? ''}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        unique.push(ref);
    }
    return unique;
}
function _projectAcceptedKnowledge(item) {
    return {
        id: item.id,
        kind: item.kind || 'pattern',
        title: item.title,
        trigger: item.trigger,
        ...(item.actionHint ? { actionHint: item.actionHint } : {}),
        summary: _summarizePrimeItem(item),
        score: item.score,
        evidenceRefs: _extractEvidenceRefs(item.sourceRefs),
    };
}
function _projectAcceptedGuard(item) {
    return {
        id: item.id,
        title: item.title,
        trigger: item.trigger,
        ...(item.actionHint ? { actionHint: item.actionHint } : {}),
        score: item.score,
        evidenceRefs: _extractEvidenceRefs(item.sourceRefs),
    };
}
function _summarizePrimeItem(item) {
    return item.description || item.actionHint || item.trigger || item.title;
}
function _extractEvidenceRefs(sourceRefs) {
    if (!sourceRefs?.length) {
        return [];
    }
    const refs = [];
    const seen = new Set();
    for (const rawRef of sourceRefs) {
        const ref = rawRef.trim();
        if (!ref) {
            continue;
        }
        const evidence = _parseEvidenceRef(ref);
        const key = `${evidence.path}\0${evidence.line ?? ''}`;
        if (seen.has(key)) {
            continue;
        }
        refs.push(evidence);
        seen.add(key);
    }
    return refs;
}
function _parseEvidenceRef(ref) {
    const match = ref.match(/^(.*?)(?::(?:L|line-?|#L)?(\d+))(?:[:,-]\d+)?$/i);
    if (!match?.[1] || !match[2]) {
        return { path: ref, line: null };
    }
    const line = Number.parseInt(match[2], 10);
    return {
        path: match[1],
        line: Number.isFinite(line) && line > 0 ? line : null,
    };
}
function _buildPrimeShoutInstruction(status, trustPosture) {
    const trustChecklist = _formatPrimeTrustPostureMessage(trustPosture);
    if (status === 'delivered') {
        return [
            'Immediately after this prime tool result, before any further tool call, code reading, edit, Guard check, or final summary, shout a short, active knowledge receipt to the developer in your own words.',
            'Use Codex/first-person as the speaker: say what I accepted or what Codex received; do not make "Alembic prime", prime, or any tool/process the grammatical subject of the visible receipt.',
            'Make it feel like a real shout: lead with the accepted trusted-to-obey Guard constraints and trusted-to-use Recipe or pattern knowledge, then name any context-only host intent or evidence hints and any requires-verification source refs or candidates.',
            trustChecklist,
            'Do not collapse the receipt into an empty "I received knowledge" slogan.',
            'Use trigger, actionHint, title, and summary to make the shout readable; do not list evidenceRefs paths or line numbers by default, and do not call out missing line numbers.',
            'Keep evidenceRefs for your later code reading, verification, or user-requested citations.',
            'Then continue the user task based on the accepted knowledge.',
        ].join(' ');
    }
    if (status === 'empty') {
        return [
            'Immediately after this prime tool result, before any further tool call, code reading, edit, Guard check, or final summary, shout a clear receipt in the first person that I did not receive matching Recipe or Guard knowledge for this request.',
            'Do not make "Alembic prime", prime, or any tool/process the grammatical subject of the visible receipt.',
            trustChecklist,
            'Say the trust posture is not-available-or-degraded and that there is no trusted-to-obey or trusted-to-use project knowledge from prime.',
            'Do not claim project-specific knowledge was accepted.',
            'Then continue with normal code reading and verification.',
        ].join(' ');
    }
    return [
        'Immediately after this prime tool result, before any further tool call, code reading, edit, Guard check, or final summary, shout a clear receipt in the first person that I did not receive usable project knowledge because prime degraded.',
        'Do not make "Alembic prime", prime, or any tool/process the grammatical subject of the visible receipt.',
        trustChecklist,
        'Say the trust posture is not-available-or-degraded and that there is no trusted-to-obey or trusted-to-use project knowledge from prime.',
        'Do not pretend Recipe or Guard knowledge was accepted.',
        'Continue only with explicit code reading and verification.',
    ].join(' ');
}
function _buildPrimeHostResponseInstruction(status, receiptId, trustPosture) {
    // hostResponse 是给 Codex 宿主的可见回复动作，不是 MCP 工具调用，避免误触发不存在的 codex_host_response tool。
    const trustChecklist = _formatPrimeTrustPostureMessage(trustPosture);
    return {
        action: 'shout_prime_knowledge_receipt',
        receiptId,
        status,
        timing: 'immediate_after_prime',
        required: true,
        requiredBeforeNextAction: true,
        visibility: 'developer_visible',
        reason: status === 'delivered'
            ? `As Codex, tell the developer the prime trust posture before acting: trusted-to-obey Guard constraints, trusted-to-use Recipe or pattern knowledge, context-only host intent or evidence hints, and requires-verification source refs or candidates. ${trustChecklist} do not make Alembic prime the recipient or speaker. ${_primeReceiptOrder}`
            : `As Codex, tell the developer the prime trust posture is not-available-or-degraded before continuing; do not claim trusted-to-obey or trusted-to-use project knowledge. ${trustChecklist} do not make Alembic prime the recipient or speaker. ${_primeReceiptOrder}`,
    };
}
function _buildPrimeKnowledgeNextActions(taskAnchorDecision) {
    if (taskAnchorDecision.action === 'skip') {
        return [
            {
                tool: 'alembic_task',
                args: {
                    operation: 'create',
                    title: '<short task title>',
                },
                required: false,
                skipped: true,
                reason: `Task anchor skipped by Codex-aware lifecycle policy: ${taskAnchorDecision.reasonCode}.`,
                taskAnchorDecision,
            },
        ];
    }
    return [
        {
            tool: 'alembic_task',
            args: {
                operation: 'create',
                title: '<short task title>',
            },
            required: false,
            reason: `Create a task anchor after the prime knowledge receipt only for real implementation work (${taskAnchorDecision.reasonCode}).`,
            taskAnchorDecision,
        },
    ];
}
// ═══ create ═════════════════════════════════════════════
async function _create(ctx, args) {
    if (!args.title) {
        return envelope({
            success: false,
            message: 'title is required',
            meta: { tool: 'alembic_task' },
        });
    }
    const taskId = _generateTaskId();
    const intent = ctx.session?.intent;
    // Bind task ID to current intent
    if (intent && intent.phase === 'active') {
        intent.taskId = taskId;
        intent.taskTitle = args.title;
    }
    return envelope({
        success: true,
        data: { id: taskId, title: args.title },
        message: `📌 Created: ${taskId} — ${args.title}`,
        meta: { tool: 'alembic_task' },
    });
}
// ═══ close ══════════════════════════════════════════════
async function _close(ctx, args) {
    const intent = ctx.session?.intent;
    // Resolve id: explicit arg > session intent > fail
    const id = args.id || (intent?.taskId ?? '');
    if (!id) {
        return envelope({
            success: false,
            message: 'id is required (pass id or ensure a task was created in this session)',
            meta: { tool: 'alembic_task' },
        });
    }
    const reason = args.reason || 'Completed';
    const projectRoot = _resolveTaskProjectRoot(ctx, args);
    const detectedChangedFiles = await _detectTaskLifecycleChangedFiles(projectRoot);
    const changedFiles = _uniqueStrings([
        ...detectedChangedFiles,
        ...normalizeTaskLifecycleFileRefs(args.changedFiles, { projectRoot }),
    ]);
    const taskScopeFiles = _collectTaskScopeFiles(args, intent, projectRoot);
    const guardDecision = decideGuardTrigger({
        changedFiles,
        taskAnchorExists: true,
        taskScopeFiles,
    });
    const lifecyclePolicy = {
        ...classifyTaskLifecycleInput({
            hostIntentFrame: intent?.hostIntentFrame,
            operation: 'close',
            rawUserQuery: typeof args.userQuery === 'string' ? args.userQuery : undefined,
            taskId: id,
            title: intent?.taskTitle,
            userQuery: reason,
        }),
        guardDecision,
    };
    // Persist intent chain via SignalBus
    if (intent && intent.phase === 'active') {
        await _persistIntentChain(ctx, intent, 'completed', reason, id);
    }
    // Reset intent to idle
    if (ctx.session) {
        ctx.session.intent = createIdleIntent();
    }
    const lines = [`✅ Closed: ${id} — ${reason}`];
    lines.push('');
    lines.push(_formatGuardDecisionMessage(guardDecision));
    return envelope({
        success: true,
        data: {
            closed: { id, reason, closedAt: Date.now() },
            guardDecision,
            lifecyclePolicy,
            nextAction: _buildGuardNextAction(guardDecision),
        },
        message: lines.join('\n'),
        meta: { tool: 'alembic_task' },
    });
}
function _buildGuardNextAction(guardDecision) {
    if (guardDecision.action === 'run') {
        return {
            tool: 'alembic_guard',
            args: {
                files: guardDecision.taskScopedFiles,
            },
            required: true,
            reason: 'Post-close task-scoped compliance review — check only files changed by this task before moving on.',
        };
    }
    return {
        tool: 'alembic_guard',
        args: {},
        required: false,
        skipped: true,
        reason: `Post-close Guard skipped by Codex-aware lifecycle policy: ${guardDecision.reasonCode}.`,
    };
}
function _formatGuardDecisionMessage(guardDecision) {
    if (guardDecision.action === 'run') {
        return `⚠️ REQUIRED: Call alembic_guard with files=${JSON.stringify(guardDecision.taskScopedFiles)} before moving on.`;
    }
    return `Guard skipped by Codex-aware lifecycle policy: ${guardDecision.reasonCode}.`;
}
function _resolveTaskProjectRoot(ctx, args) {
    return typeof args.projectRoot === 'string' && args.projectRoot.trim()
        ? args.projectRoot.trim()
        : resolveProjectRoot(ctx.container);
}
async function _detectTaskLifecycleChangedFiles(projectRoot) {
    try {
        const scan = await new GitDiffScanner({ projectRoot }).scanOnce();
        return normalizeTaskLifecycleFileRefs(scan.events.map((event) => event.path), { projectRoot });
    }
    catch (err) {
        process.stderr.write(`[MCP/Task] close guard diff scan unavailable: ${err instanceof Error ? err.message : String(err)}\n`);
        return [];
    }
}
function _collectTaskScopeFiles(args, intent, projectRoot) {
    const frame = intent?.hostIntentFrame;
    return _uniqueStrings([
        ...normalizeTaskLifecycleFileRefs(args.changedFiles, { projectRoot }),
        ...normalizeTaskLifecycleFileRefs(args.sourceRefs, { projectRoot }),
        ...normalizeTaskLifecycleFileRefs(args.activeFile, { projectRoot }),
        ...normalizeTaskLifecycleFileRefs(intent?.primeActiveFile, { projectRoot }),
        ...normalizeTaskLifecycleFileRefs(intent?.mentionedFiles, { projectRoot }),
        ...normalizeTaskLifecycleFileRefs(frame?.recognizedIntentDraft.sourceRefs, { projectRoot }),
        ...normalizeTaskLifecycleFileRefs(frame?.hostDeclaredIntent?.sourceRefs, { projectRoot }),
    ]);
}
// ═══ fail ═══════════════════════════════════════════════
async function _fail(ctx, args) {
    const intent = ctx.session?.intent;
    // Resolve id: explicit arg > session intent > fail
    const id = args.id || (intent?.taskId ?? '');
    if (!id) {
        return envelope({
            success: false,
            message: 'id is required (pass id or ensure a task was created in this session)',
            meta: { tool: 'alembic_task' },
        });
    }
    const reason = args.reason || 'Agent execution failed';
    // Persist intent chain via SignalBus
    if (intent && intent.phase === 'active') {
        await _persistIntentChain(ctx, intent, 'failed', reason, id);
    }
    // Reset intent to idle
    if (ctx.session) {
        ctx.session.intent = createIdleIntent();
    }
    return envelope({
        success: true,
        data: {
            failed: { id, reason, failedAt: Date.now() },
        },
        message: `❌ Failed: ${id} — ${reason}`,
        meta: { tool: 'alembic_task' },
    });
}
// ═══ record_decision ════════════════════════════════════
async function _recordDecision(ctx, args) {
    if (!args.title) {
        return envelope({
            success: false,
            message: 'title is required',
            meta: { tool: 'alembic_task' },
        });
    }
    if (!args.description) {
        return envelope({
            success: false,
            message: 'description is required',
            meta: { tool: 'alembic_task' },
        });
    }
    const decisionId = `dec-${Date.now().toString(36)}`;
    const decision = {
        id: decisionId,
        title: args.title,
        description: args.description,
        rationale: args.rationale,
        tags: args.tags,
        recordedAt: Date.now(),
    };
    // Push to current intent's decisions
    const intent = ctx.session?.intent;
    if (intent && intent.phase === 'active') {
        intent.decisions.push(decision);
    }
    return envelope({
        success: true,
        data: { decision: { id: decisionId, title: args.title } },
        message: `📌 Decision recorded: ${args.title}`,
        meta: { tool: 'alembic_task' },
    });
}
// ═══ Intent Chain Persistence (via SignalBus) ═══════════
async function _persistIntentChain(ctx, intent, outcome, reason, taskId) {
    const now = Date.now();
    const chain = {
        sessionId: ctx.session?.id || 'unknown',
        taskId: intent.taskId,
        outcome,
        primeQuery: intent.primeQuery,
        primeActiveFile: intent.primeActiveFile,
        primeRecipeIds: intent.primeRecipeIds,
        primeAt: intent.primeAt || now,
        primeLanguage: intent.primeLanguage ?? null,
        primeModule: intent.primeModule ?? null,
        primeScenario: intent.primeScenario ?? 'search',
        searchMeta: intent.searchMeta,
        toolCalls: intent.toolCalls,
        searchQueries: intent.searchQueries,
        mentionedFiles: intent.mentionedFiles,
        decisions: intent.decisions,
        driftEvents: intent.driftEvents,
        driftScore: _computeDriftScore(intent),
        closeReason: outcome === 'completed' ? reason : undefined,
        failReason: outcome !== 'completed' ? reason : undefined,
        startedAt: intent.primeAt || now,
        endedAt: now,
        duration: now - (intent.primeAt || now),
    };
    // Emit via SignalBus — subscribers handle JSONL persistence
    try {
        const signalBus = ctx.container.get('signalBus');
        signalBus.send('intent', 'TaskHandler', _computeDriftScore(intent), {
            target: intent.taskId ?? null,
            metadata: { chain },
        });
    }
    catch {
        // signalBus unavailable — silent failure, non-blocking
    }
    await _updateIntentEpisodeOutcome(ctx, intent, outcome, reason, taskId);
}
async function _handoffIntentEpisode(ctx, input) {
    const episodeSession = _resolveEpisodeSession(ctx, input.hostIntentFrame);
    const request = _buildIntentEpisodeStartRequest(input, episodeSession.sessionId);
    const requestFields = Object.keys(request).sort();
    const unavailable = {
        available: false,
        current: null,
        degraded: true,
        latest: null,
        recent: [],
        read: {
            latest: { ok: false, reason: 'residentServiceClient unavailable' },
            recent: { ok: false, reason: 'residentServiceClient unavailable' },
        },
        reason: 'residentServiceClient unavailable',
        requestFields,
        sessionSource: episodeSession.source,
        start: { ok: false, reason: 'residentServiceClient unavailable' },
    };
    const client = _getResidentIntentEpisodeClient(ctx.container);
    if (!client) {
        return unavailable;
    }
    try {
        const latestResult = await client.latestIntentEpisode({ sessionId: episodeSession.sessionId });
        const recentResult = await client.recentIntentEpisodes({
            limit: 3,
            sessionId: episodeSession.sessionId,
        });
        const startResult = await client.startIntentEpisode(request);
        const latest = latestResult.ok ? _projectIntentEpisodeRecord(latestResult.value.episode) : null;
        const recent = recentResult.ok
            ? (recentResult.value.episodes ?? [])
                .map(_projectIntentEpisodeRecord)
                .filter((episode) => episode !== null)
            : [];
        const current = startResult.ok ? _projectIntentEpisodeRecord(startResult.value.episode) : null;
        const reason = startResult.ok
            ? null
            : startResult.reason || startResult.message || 'IntentEpisode start unavailable';
        if (!startResult.ok) {
            process.stderr.write(`[MCP/Task] intent episode start degraded: ${reason}\n`);
        }
        return {
            available: startResult.ok,
            current,
            degraded: !startResult.ok,
            latest,
            recent,
            read: {
                latest: _summarizeResidentCall(latestResult),
                recent: _summarizeResidentCall(recentResult),
            },
            reason,
            requestFields,
            sessionSource: episodeSession.source,
            start: _summarizeResidentCall(startResult),
        };
    }
    catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        process.stderr.write(`[MCP/Task] intent episode handoff error: ${reason}\n`);
        return {
            ...unavailable,
            reason,
            read: {
                latest: { ok: false, reason },
                recent: { ok: false, reason },
            },
            start: { ok: false, reason },
        };
    }
}
function _buildIntentEpisodeStartRequest(input, sessionId) {
    const frame = input.hostIntentFrame;
    const draft = frame.recognizedIntentDraft;
    const sourceRefs = _collectEpisodeSourceRefs(frame, input.intent);
    const handoff = buildResidentIntentHandoff({
        hostIntentFrame: frame,
        language: input.extracted.language,
        sourceRefs,
        userQuery: input.hostIntentInput.userQuery,
    });
    const hostIntent = {
        applied: true,
        confidence: frame.confidence,
        degraded: frame.degraded,
        degradedReason: frame.degradedReasons.join('; ') || undefined,
        recognizedIntentDraft: {
            action: draft.action,
            confidence: draft.confidence,
            constraints: draft.constraints,
            degraded: draft.degraded,
            degradedReasons: draft.degradedReasons,
            language: draft.language,
            query: draft.query,
            source: draft.source,
            sourceRefs: _uniqueStrings([...(draft.sourceRefs ?? []), ...sourceRefs]),
            status: draft.status,
            target: draft.target,
        },
        scenario: input.extracted.scenario,
        searchIntent: input.extracted.scenario,
        sourceRefs,
        sources: _uniqueStrings([
            frame.source,
            ...(frame.hostDeclaredIntent ? ['hostDeclaredIntent'] : []),
            ...(frame.hostTurnMeta ? ['hostTurnMeta'] : []),
        ]),
    };
    if (handoff?.intentContext && _isRecord(handoff.intentContext)) {
        Object.assign(hostIntent, handoff.intentContext);
    }
    if (frame.hostDeclaredIntent) {
        hostIntent.hostDeclaredIntent = frame.hostDeclaredIntent;
    }
    if (frame.hostTurnMeta) {
        hostIntent.hostTurnMeta = frame.hostTurnMeta;
    }
    return _stripUndefined({
        activeFile: input.hostIntentInput.activeFile,
        hostIntent: _stripUndefined(hostIntent),
        language: draft.language ?? input.extracted.language ?? undefined,
        module: draft.target ?? input.extracted.module ?? undefined,
        query: draft.query || input.hostIntentInput.userQuery || input.extracted.queries[0],
        scenario: input.extracted.scenario,
        searchMeta: _projectEpisodeSearchMeta(input.intent.searchMeta, frame, sourceRefs),
        sessionId,
        sourceRefs,
        turnId: frame.hostTurnMeta?.turnId ?? frame.hostTurnMeta?.messageId,
    });
}
function _resolveEpisodeSession(ctx, hostIntentFrame) {
    const turnMeta = hostIntentFrame.hostTurnMeta;
    if (turnMeta?.threadIdHash) {
        return { sessionId: `thread:${turnMeta.threadIdHash}`, source: 'host-thread-hash' };
    }
    if (turnMeta?.conversationIdHash) {
        return {
            sessionId: `conversation:${turnMeta.conversationIdHash}`,
            source: 'host-conversation-hash',
        };
    }
    if (turnMeta?.sessionIdHash) {
        return { sessionId: `host-session:${turnMeta.sessionIdHash}`, source: 'host-session-hash' };
    }
    return { sessionId: ctx.session?.id || 'mcp-session', source: 'mcp-session' };
}
function _projectEpisodeSearchMeta(searchMeta, hostIntentFrame, sourceRefs) {
    const residentSearch = _isRecord(searchMeta?.residentSearch)
        ? searchMeta.residentSearch
        : undefined;
    const residentSearchMeta = _isRecord(residentSearch?.searchMeta)
        ? residentSearch.searchMeta
        : undefined;
    return _stripUndefined({
        filteredCount: searchMeta?.filteredCount,
        hostIntentApplied: residentSearchMeta?.hostIntentApplied ?? residentSearch?.hostIntentApplied ?? true,
        hostIntentConfidence: residentSearchMeta?.hostIntentConfidence ??
            residentSearch?.hostIntentConfidence ??
            hostIntentFrame.confidence,
        hostIntentDegraded: residentSearchMeta?.hostIntentDegraded ??
            residentSearch?.hostIntentDegraded ??
            hostIntentFrame.degraded,
        hostIntentDegradedReason: residentSearchMeta?.hostIntentDegradedReason ??
            residentSearch?.hostIntentDegradedReason ??
            (hostIntentFrame.degradedReasons.length > 0
                ? hostIntentFrame.degradedReasons.join('; ')
                : undefined),
        hostIntentSourceRefs: residentSearchMeta?.hostIntentSourceRefs ??
            residentSearch?.hostIntentSourceRefs ??
            sourceRefs,
        ...(searchMeta?.intentEvidence ? { intentEvidence: searchMeta.intentEvidence } : {}),
        ...(searchMeta?.primeInjectionPackage
            ? { primeInjectionPackage: searchMeta.primeInjectionPackage }
            : {}),
        queries: searchMeta?.queries,
        resultCount: searchMeta?.resultCount,
    });
}
async function _updateIntentEpisodeOutcome(ctx, intent, outcome, reason, taskId) {
    const episodeId = intent.intentEpisode?.episodeId;
    if (!episodeId) {
        return;
    }
    const client = _getResidentIntentEpisodeClient(ctx.container);
    if (!client) {
        return;
    }
    const status = outcome === 'completed' ? 'completed' : outcome === 'failed' ? 'failed' : 'abandoned';
    try {
        const result = await client.updateIntentEpisodeOutcome(episodeId, {
            reason,
            searchMeta: intent.hostIntentFrame
                ? _projectEpisodeSearchMeta(intent.searchMeta, intent.hostIntentFrame, _collectEpisodeSourceRefs(intent.hostIntentFrame, intent))
                : undefined,
            status,
            taskId: taskId ?? intent.taskId,
        });
        if (!result.ok) {
            process.stderr.write(`[MCP/Task] intent episode outcome degraded: ${result.reason || result.message}\n`);
        }
    }
    catch (err) {
        process.stderr.write(`[MCP/Task] intent episode outcome error: ${err instanceof Error ? err.message : String(err)}\n`);
    }
}
function _getResidentIntentEpisodeClient(container) {
    try {
        return container.get('residentIntentEpisodeClient');
    }
    catch {
        // Older in-process containers still expose a compatibility facade while the
        // Codex-facing route split rolls through the package.
    }
    try {
        return container.get('residentServiceClient');
    }
    catch {
        return null;
    }
}
function _projectIntentEpisodeRecord(record) {
    if (!record?.episodeId) {
        return null;
    }
    return {
        episodeId: record.episodeId,
        ...(record.query ? { query: record.query } : {}),
        sessionKey: record.sessionKey ?? null,
        sourceRefs: _stringArray(record.sourceRefs).slice(0, 12),
        status: record.status,
    };
}
function _summarizeResidentCall(result) {
    if (result.ok) {
        return {
            ok: true,
            owner: result.status?.owner,
            route: result.status?.route,
        };
    }
    return {
        ok: false,
        owner: result.status?.owner,
        reason: result.reason || result.message,
        retryable: result.retryable,
        route: result.status?.route,
    };
}
function _collectEpisodeSourceRefs(frame, intent) {
    return _uniqueStrings([
        ...(frame.recognizedIntentDraft.sourceRefs ?? []),
        ...(frame.hostDeclaredIntent?.sourceRefs ?? []),
        ...(intent.primeRecipeIds ?? []).map((id) => `knowledge:${id}`),
    ]).slice(0, 24);
}
function _stripUndefined(input) {
    const output = {};
    for (const [key, value] of Object.entries(input)) {
        if (value !== undefined) {
            output[key] = value;
        }
    }
    return output;
}
function _stringArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
}
function _uniqueStrings(values) {
    const seen = new Set();
    const output = [];
    for (const value of values) {
        const trimmed = value.trim();
        if (!trimmed || seen.has(trimmed)) {
            continue;
        }
        seen.add(trimmed);
        output.push(trimmed);
    }
    return output;
}
function _isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
function _redactVisiblePath(value) {
    if (!value.startsWith('/')) {
        return value;
    }
    const normalized = value.replace(/\\/g, '/');
    const basename = normalized.split('/').filter(Boolean).pop() || 'file';
    return `[absolute-path]/${basename}`;
}
function _computeDriftScore(intent) {
    if (intent.driftEvents.length === 0) {
        return 0;
    }
    const sum = intent.driftEvents.reduce((acc, d) => acc + (1 - d.primeOverlap), 0);
    return sum / intent.driftEvents.length;
}
function _getPipeline(container) {
    try {
        const p = container.get('primeSearchPipeline');
        if (!p) {
            process.stderr.write('[MCP/Task] _getPipeline: container returned null/undefined\n');
        }
        return p;
    }
    catch (err) {
        process.stderr.write(`[MCP/Task] _getPipeline failed: ${err instanceof Error ? err.message : String(err)}\n`);
        return null;
    }
}
