import {
  CONTENT_DESCRIPTION_MAX,
  CONTENT_NAME_MAX,
  CONTENT_NOTES_MAX,
} from "../constants/validation.js";
import { createHttpError } from "./httpError.js";

// Picks and validates the editable subject/topic fields. Anything else in the body,
// including ids, is dropped before it reaches server-data.
export function pickContentFields(body, { requireName }) {
  const values = {};
  const { name, description, notes } = body || {};

  if (name !== undefined || requireName) {
    const trimmed = typeof name === "string" ? name.trim() : "";
    if (!trimmed) {
      throw createHttpError(400, "A name is required");
    }
    if (trimmed.length > CONTENT_NAME_MAX) {
      throw createHttpError(400, `Name must be at most ${CONTENT_NAME_MAX} characters`);
    }
    values.name = trimmed;
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.length > CONTENT_DESCRIPTION_MAX) {
      throw createHttpError(
        400,
        `Description must be at most ${CONTENT_DESCRIPTION_MAX} characters`,
      );
    }
    values.description = description;
  }
  if (notes !== undefined) {
    if (typeof notes !== "string" || notes.length > CONTENT_NOTES_MAX) {
      throw createHttpError(400, `Notes must be at most ${CONTENT_NOTES_MAX} characters`);
    }
    values.notes = notes;
  }
  return values;
}
