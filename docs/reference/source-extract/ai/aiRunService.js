// server/src/services/ai/aiRunService.js

const AiRun = require('../../models/AiRun');
const { AI_ERROR_CODES } = require('./aiErrors');

// AiRun is a log, never a source of truth. Logging failures must never take down the
// flow that was being logged, so every write here is best-effort.
const EXECUTION_STATUS_BY_ERROR_CODE = {
  [AI_ERROR_CODES.AI_REFUSED]: 'refused',
  [AI_ERROR_CODES.AI_INCOMPLETE]: 'incomplete',
};

const swallow = (operation, run) => {
  console.error(`AiRun ${operation} failed for run ${run?.id || 'unknown'}`);
};

const openRun = async ({
  userId,
  type,
  targetEntityType = 'none',
  targetEntityId = null,
  opportunityId = null,
  inputSummary = '',
}) => {
  try {
    return await AiRun.create({
      userId,
      type,
      targetEntityType,
      targetEntityId,
      opportunityId,
      inputSummary,
      executionStatus: 'requested',
      reviewStatus: 'not_required',
      requestedAt: new Date(),
    });
  } catch (error) {
    swallow('open', null);
    return null;
  }
};

/**
 * Marks a run as executed. `reviewStatus` becomes `pending` for suggestion flows,
 * which wait on an explicit user accept or reject.
 */
const completeRun = async (
  run,
  { promptVersion, model, output, usage = {}, latencyMs, reviewStatus = 'pending' }
) => {
  if (!run) {
    return null;
  }

  try {
    run.set({
      executionStatus: 'completed',
      reviewStatus,
      promptVersion,
      model,
      output,
      inputTokens: usage.inputTokens ?? null,
      outputTokens: usage.outputTokens ?? null,
      latencyMs: latencyMs ?? null,
      completedAt: new Date(),
    });

    return await run.save();
  } catch (error) {
    swallow('complete', run);
    return run;
  }
};

const failRun = async (run, error) => {
  if (!run) {
    return null;
  }

  try {
    const code = error?.aiErrorCode || '';

    run.set({
      executionStatus: EXECUTION_STATUS_BY_ERROR_CODE[code] || 'failed',
      reviewStatus: 'not_required',
      errorCode: code,
      errorMessage: error?.message || 'AI run failed',
      completedAt: new Date(),
    });

    return await run.save();
  } catch (saveError) {
    swallow('fail', run);
    return run;
  }
};

/**
 * Records the user's decision on a suggestion. Ownership-scoped so a run belonging to
 * another user can never be updated.
 */
const recordReview = async (aiRunId, userId, reviewStatus) => {
  if (!aiRunId) {
    return null;
  }

  try {
    return await AiRun.findOneAndUpdate(
      { _id: aiRunId, userId },
      { reviewStatus, reviewedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    swallow('review', { id: aiRunId });
    return null;
  }
};

module.exports = {
  completeRun,
  failRun,
  openRun,
  recordReview,
};
