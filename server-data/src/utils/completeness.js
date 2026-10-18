export function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Stored length for character totals (no trim). Differs from hasNotes / contentComplete.
export function notesCharLength(notes) {
  return typeof notes === "string" ? notes.length : 0;
}

export function contentFacts(entity, documentCount) {
  const hasDescription = hasText(entity.description);
  const hasNotes = hasText(entity.notes);
  return {
    hasDescription,
    hasNotes,
    documentCount,
    contentComplete: hasNotes || documentCount > 0,
  };
}
