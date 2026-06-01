/**
 * Compatibility adapter for the external dimension completion workflow.
 *
 * The host-agnostic workflow state lives in Core; this Plugin wrapper adds
 * MCP envelope behavior and Codex-facing completion side effects.
 */
import { envelope } from '#codex/mcp/envelope.js';
import { runExternalDimensionCompletionWorkflow, } from '#codex/mcp/handlers/dimension-complete/ExternalDimensionCompletionWorkflow.js';
export async function dimensionComplete(ctx, args) {
    return envelope(await runExternalDimensionCompletionWorkflow(ctx, args));
}
