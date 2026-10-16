import {
  CONTENT_DESCRIPTION_MAX,
  CONTENT_NAME_MAX,
  CONTENT_NOTES_MAX,
} from "../constants/content.js";

// Validates the editable fields shared by subjects and topics. Only name, description,
// and notes are read from the body; anything else is ignored.
// Returns { error } or { values }.
export function readContentFields(body, { requireName }) {
  const values = {};
  const { name, description, notes } = body || {};

  if (name !== undefined || requireName) {
    if (typeof name !== "string" || !name.trim() || name.trim().length > CONTENT_NAME_MAX) {
      return { error: `name must be 1-${CONTENT_NAME_MAX} characters` };
    }
    values.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.length > CONTENT_DESCRIPTION_MAX) {
      return { error: `description must be at most ${CONTENT_DESCRIPTION_MAX} characters` };
    }
    values.description = description;
  }
  if (notes !== undefined) {
    if (typeof notes !== "string" || notes.length > CONTENT_NOTES_MAX) {
      return { error: `notes must be at most ${CONTENT_NOTES_MAX} characters` };
    }
    values.notes = notes;
  }
  return { values };
}
