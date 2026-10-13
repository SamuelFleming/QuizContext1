import mongoose from "mongoose";
import { toAiUsage } from "../models/aiUsage.js";
import { createAiUsage, summarizeAiUsage } from "../repositories/aiUsageRepository.js";
import { sendData, sendMessage } from "../utils/responses.js";

export async function create(req, res, next) {
  try {
    const usage = await createAiUsage(req.userId, req.body || {});
    sendData(res, toAiUsage(usage), 201);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      sendMessage(res, 400, "Invalid usage record");
      return;
    }
    next(err);
  }
}

function readPositiveInteger(raw, name, maximum) {
  if (raw === undefined) return {};
  if (!/^[1-9]\d*$/.test(raw)) {
    return { error: `${name} must be a positive integer${maximum ? ` from 1 to ${maximum}` : ""}` };
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || (maximum && value > maximum)) {
    return { error: `${name} must be a positive integer${maximum ? ` from 1 to ${maximum}` : ""}` };
  }
  return { value };
}

export async function getSummary(req, res, next) {
  try {
    const page = readPositiveInteger(req.query.page, "page");
    const limit = readPositiveInteger(req.query.limit, "limit", 100);
    if (page.error || limit.error) {
      sendMessage(res, 400, page.error || limit.error);
      return;
    }
    const summary = await summarizeAiUsage(req.userId, {
      ...(page.value ? { page: page.value } : {}),
      ...(limit.value ? { limit: limit.value } : {}),
    });
    sendData(res, {
      periodStart: summary.periodStart,
      totals: summary.totals,
      recent: summary.recent.map(toAiUsage),
      pagination: summary.pagination,
    });
  } catch (err) {
    next(err);
  }
}
