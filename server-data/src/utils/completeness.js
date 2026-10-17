export function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
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
