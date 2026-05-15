import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { recordTerminalAudit } from './TerminalAudit.js';
export const execFileAsync = promisify(execFile);
export function execFileWithInput(bin, args, input, options) {
    return new Promise((resolve, reject) => {
        const child = spawn(bin, args, {
            cwd: options.cwd,
            env: options.env,
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        const stdout = [];
        const stderr = [];
        let settled = false;
        let killed = false;
        let timedOut = false;
        const finish = (callback) => {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timeout);
            options.signal?.removeEventListener('abort', abort);
            callback();
        };
        const abort = () => {
            killed = true;
            child.kill('SIGTERM');
        };
        const timeout = setTimeout(() => {
            timedOut = true;
            killed = true;
            child.kill('SIGTERM');
        }, options.timeout);
        options.signal?.addEventListener('abort', abort, { once: true });
        const capture = (target, chunk) => {
            target.push(Buffer.from(chunk));
            if (Buffer.concat(target).byteLength > options.maxBuffer) {
                killed = true;
                child.kill('SIGTERM');
            }
        };
        child.stdout?.on('data', (chunk) => capture(stdout, chunk));
        child.stderr?.on('data', (chunk) => capture(stderr, chunk));
        child.on('error', (err) => finish(() => reject(err)));
        child.on('close', (code) => {
            const stdoutText = Buffer.concat(stdout).toString('utf8');
            const stderrText = Buffer.concat(stderr).toString('utf8');
            if (code === 0 && !timedOut && !options.signal?.aborted) {
                finish(() => resolve({ stdout: stdoutText, stderr: stderrText }));
                return;
            }
            const error = new Error(stderrText || `Process exited with code ${code}`);
            error.code = code ?? 1;
            error.killed = killed;
            error.stdout = stdoutText;
            error.stderr = stderrText;
            finish(() => reject(error));
        });
        child.stdin?.end(input);
    });
}
export function statusForFailure(request, failure) {
    return request.context.abortSignal?.aborted ? 'aborted' : failure.killed ? 'timeout' : 'error';
}
export async function recordAndReturn(request, envelope) {
    await recordTerminalAudit(request, envelope);
    return envelope;
}
export function getTerminalSessionManager(request, fallback) {
    try {
        const candidate = request.context.services.get('terminalSessionManager');
        if (isTerminalSessionManager(candidate)) {
            return candidate;
        }
    }
    catch {
        return fallback;
    }
    return fallback;
}
export function scriptAuditData(script) {
    return {
        shell: script.shell,
        scriptHash: script.scriptHash,
        verificationHash: createHash('sha256').update(script.script).digest('hex'),
        lineCount: script.lineCount,
        byteLength: script.byteLength,
    };
}
export function shellAuditData(shell) {
    return {
        shell: shell.shell,
        commandHash: shell.commandHash,
        verificationHash: createHash('sha256').update(shell.command).digest('hex'),
        lineCount: shell.lineCount,
        byteLength: shell.byteLength,
    };
}
function isTerminalSessionManager(value) {
    return (!!value &&
        typeof value === 'object' &&
        typeof value.acquire === 'function' &&
        typeof value.snapshot === 'function' &&
        typeof value.list === 'function' &&
        typeof value.close === 'function' &&
        typeof value.cleanup === 'function');
}
/**
 * 直接执行结构化命令。
 *
 * Alembic 不再在插件进程内叠加额外的 OS 级命令沙箱；执行安全边界由 Codex
 * 宿主环境提供，Alembic 保留自己的命令策略、cwd 校验、超时和输出截断。
 */
export async function executeTerminalFile(bin, args, options, _intent) {
    const r = await execFileAsync(bin, args, options);
    return { stdout: r.stdout, stderr: r.stderr };
}
/**
 * 直接执行带一次性 stdin 的结构化命令。
 */
export async function executeTerminalFileWithInput(bin, args, input, options, _intent) {
    return execFileWithInput(bin, args, input, options);
}
