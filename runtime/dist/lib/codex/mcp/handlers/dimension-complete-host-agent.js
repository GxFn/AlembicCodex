/**
 * Compatibility adapter for the host-agent dimension completion workflow.
 *
 * The host-agnostic workflow state lives in Core; this Plugin wrapper adds
 * MCP envelope behavior and Codex-facing completion side effects.
 */
import { envelope } from '#codex/mcp/envelope.js';
import { runHostAgentDimensionCompletionWorkflow, } from '#codex/mcp/handlers/dimension-complete/HostAgentDimensionCompletionWorkflow.js';
export async function dimensionComplete(ctx, args) {
    return envelope(await runHostAgentDimensionCompletionWorkflow(ctx, args));
}
