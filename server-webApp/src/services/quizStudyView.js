// Study view for the client: prompts and options only. Answer keys, criteria, and the
// frozen snapshot stay on the server until evaluation or export.
export function toStudyView(quiz) {
  if (!quiz) {
    return null;
  }
  const manifest = (quiz.sourceManifest || []).map((entry) => ({
    type: entry.type,
    id: entry.id,
    title: entry.title,
    path: entry.path,
    status: entry.status,
  }));
  return {
    id: quiz.id,
    title: quiz.title,
    subjectId: quiz.subjectId,
    topicId: quiz.topicId || null,
    subjectName: quiz.subjectName,
    topicPath: quiz.topicPath || null,
    multipleChoiceCount: quiz.multipleChoiceCount,
    shortAnswerCount: quiz.shortAnswerCount,
    difficulty: quiz.difficulty,
    includeDescendants: quiz.includeDescendants,
    contextMode: quiz.contextMode,
    promptVersion: quiz.promptVersion,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
    context: {
      truncated: (quiz.sourceManifest || []).some((entry) => entry.status !== "included"),
      manifest,
    },
    questions: (quiz.questions || []).map((question) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      ...(question.type === "multiple_choice" ? { options: question.options } : {}),
    })),
  };
}
