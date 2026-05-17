import { existsSync } from 'node:fs';
import Logger from '@alembic/core/logging';
import { GitDiffScanner } from './GitDiffScanner.js';
const DEFAULT_MAX_BATCH_SIZE = 500;
const MAX_ERRORS = 10;
export class GitDiffCheckpointService {
    #dispatcher;
    #logger;
    #maxBatchSize;
    #projectRoot;
    #scanner;
    #errors = [];
    #lastCheckpointAt = null;
    #lastCheckpointHead = null;
    #lastDispatch = {
        at: null,
        batchCount: 0,
        eventCount: 0,
        source: null,
    };
    #lastDispatchedSignature = null;
    constructor(options) {
        this.#dispatcher = options.dispatcher;
        this.#logger = options.logger ?? Logger.getInstance();
        this.#maxBatchSize = normalizePositiveInt(options.maxBatchSize, DEFAULT_MAX_BATCH_SIZE);
        this.#projectRoot = options.projectRoot;
        this.#scanner =
            options.scanner ??
                new GitDiffScanner({
                    logger: this.#logger,
                    projectRoot: this.#projectRoot,
                });
    }
    async checkpoint(now = Date.now()) {
        const scannedAt = new Date(now).toISOString();
        this.#lastCheckpointAt = scannedAt;
        if (!existsSync(this.#projectRoot)) {
            const message = `Project root does not exist: ${this.#projectRoot}`;
            this.#recordError('PROJECT_ROOT_UNRESOLVED', message);
            return this.#failedResult(scannedAt, message);
        }
        const scan = await this.#scanner.scanOnce(now, {
            previousHead: this.#lastCheckpointHead,
        });
        this.#lastCheckpointAt = scan.scannedAt;
        if (!scan.scanned || !scan.signature) {
            const message = this.#scanner.getStatus().lastError ?? 'git diff scan unavailable';
            this.#recordError('GIT_UNAVAILABLE', message);
            return this.#failedResult(scan.scannedAt, message, scan);
        }
        const changed = scan.signature !== this.#lastDispatchedSignature && scan.events.length > 0;
        if (!changed) {
            this.#acceptCheckpoint(scan);
            return {
                changed,
                dirtyPathCount: scan.dirtyPathCount,
                dispatchedEventCount: 0,
                error: null,
                head: scan.head,
                headChanged: scan.headChanged,
                ok: true,
                scanned: true,
                scannedAt: scan.scannedAt,
            };
        }
        try {
            await this.#dispatchInBatches(scan);
            this.#acceptCheckpoint(scan);
            this.#logger.info('[git-diff-checkpoint] dispatched git diff changes', {
                dirtyPathCount: scan.dirtyPathCount,
                eventCount: scan.events.length,
                projectRoot: this.#projectRoot,
            });
            return {
                changed: true,
                dirtyPathCount: scan.dirtyPathCount,
                dispatchedEventCount: scan.events.length,
                error: null,
                head: scan.head,
                headChanged: scan.headChanged,
                ok: true,
                scanned: true,
                scannedAt: scan.scannedAt,
            };
        }
        catch (error) {
            const dispatchError = error instanceof Error ? error : new Error(String(error));
            this.#recordError('DISPATCH_FAILED', dispatchError.message);
            return this.#failedResult(scan.scannedAt, dispatchError.message, scan, true);
        }
    }
    getStatus() {
        const scanner = this.#scanner.getStatus();
        const waitingForFirstCheckpoint = scanner.lastScanAt === null;
        return {
            enabled: true,
            errors: [...this.#errors],
            healthy: waitingForFirstCheckpoint ? true : scanner.healthy,
            lastCheckpointAt: this.#lastCheckpointAt,
            lastDispatch: { ...this.#lastDispatch },
            mode: 'git-diff-checkpoint',
            projectRoot: this.#projectRoot,
            reason: waitingForFirstCheckpoint ? 'waiting for explicit git diff checkpoint' : null,
            scanner,
            surface: 'codex-plugin',
        };
    }
    async #dispatchInBatches(scan) {
        let batchCount = 0;
        for (let start = 0; start < scan.events.length; start += this.#maxBatchSize) {
            const events = scan.events.slice(start, start + this.#maxBatchSize);
            batchCount += 1;
            await this.#dispatcher.dispatch(events);
        }
        this.#lastDispatch = {
            at: new Date().toISOString(),
            batchCount,
            eventCount: scan.events.length,
            source: inferBatchSource(scan.events) ?? null,
        };
    }
    #acceptCheckpoint(scan) {
        this.#lastCheckpointHead = scan.head;
        this.#lastDispatchedSignature = scan.signature;
    }
    #failedResult(scannedAt, message, scan, changed = false) {
        return {
            changed,
            dirtyPathCount: scan?.dirtyPathCount ?? 0,
            dispatchedEventCount: 0,
            error: message,
            head: scan?.head ?? null,
            headChanged: scan?.headChanged ?? false,
            ok: false,
            scanned: Boolean(scan?.scanned),
            scannedAt,
        };
    }
    #recordError(code, message) {
        const previousError = this.#errors.at(-1);
        if (previousError?.code === code && previousError.message === message) {
            return;
        }
        this.#errors.push({
            at: new Date().toISOString(),
            code,
            message,
        });
        if (this.#errors.length > MAX_ERRORS) {
            this.#errors = this.#errors.slice(-MAX_ERRORS);
        }
        this.#logger.warn('[git-diff-checkpoint] error', { code, message });
    }
}
function inferBatchSource(events) {
    const counts = new Map();
    for (const event of events) {
        if (event.eventSource) {
            counts.set(event.eventSource, (counts.get(event.eventSource) ?? 0) + 1);
        }
    }
    let winner;
    let max = -1;
    for (const [source, count] of counts) {
        if (count > max) {
            winner = source;
            max = count;
        }
    }
    return winner;
}
function normalizePositiveInt(value, fallback) {
    if (!Number.isFinite(value) || !value || value <= 0) {
        return fallback;
    }
    return Math.floor(value);
}
