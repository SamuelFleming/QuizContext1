import { runAiOperation } from "../openai/aiService.js";
import * as prompt from "../openai/prompts/descriptionSuggestion.js";
import { createHttpError } from "../utils/httpError.js";
import { assembleContext } from "./contextService.js";

const CONTEXT_MODE = "targeted";

function countStatus(manifest, status) {
  return manifest.filter((entry) => entry.status === status).length;
}

// Returns a suggestion only. Nothing is written to the subject or topic; the client saves
// an accepted suggestion through the normal content update.
export async function suggestDescription(userId, body) {
  const { subjectId, topicId = null, includeDescendants = true } = body || {};
  const context = await assembleContext(userId, {
    subjectId,
    topicId,
    includeDescendants,
    contextMode: CONTEXT_MODE,
  });
  if (context.insufficient) {
    throw createHttpError(
      422,
      "There is not enough content here yet. Add notes or a document, then try again.",
      { errorCode: "CONTEXT_INSUFFICIENT" },
    );
  }

  const result = await runAiOperation({
    userId,
    operation: prompt.OPERATION,
    promptVersion: prompt.PROMPT_VERSION,
    context: {
      contextMode: context.contextMode,
      includedChars: context.totals.includedChars,
      sourcesIncluded: countStatus(context.manifest, "included"),
      sourcesTruncated: countStatus(context.manifest, "truncated"),
      sourcesExcluded: countStatus(context.manifest, "excluded"),
    },
    instructions: prompt.INSTRUCTIONS,
    input: prompt.buildInput({
      selectionType: context.selection.type,
      selectionName: context.selection.name,
      contextText: context.text,
    }),
    jsonSchema: prompt.JSON_SCHEMA,
    validate: prompt.validate,
    maxOutputTokens: prompt.MAX_OUTPUT_TOKENS,
  });

  return {
    description: result.data.description.trim(),
    promptVersion: prompt.PROMPT_VERSION,
    contextMode: context.contextMode,
    context: {
      truncated: context.truncated,
      manifest: context.manifest,
      totals: context.totals,
    },
  };
}
