export const CONTENT_NAME_MAX = 120;
export const CONTENT_DESCRIPTION_MAX = 2000;
export const CONTENT_NOTES_MAX = 50000;

export const DOCUMENT_TITLE_MAX = 200;
export const DOCUMENT_CONTENT_MAX = 200000;
export const DOCUMENT_FILE_NAME_MAX = 255;
export const DOCUMENT_MIME_TYPE_MAX = 100;

export const CONTEXT_MODES = ["very_strict", "targeted", "loose"];

export const QUIZ_DIFFICULTIES = ["easy", "medium", "hard"];
export const QUIZ_QUESTION_TYPES = ["multiple_choice", "short_answer"];
export const QUIZ_QUESTIONS_MIN = 1;
export const QUIZ_QUESTIONS_MAX = 20;
export const QUIZ_PROMPT_MAX = 1000;
export const QUIZ_OPTION_MAX = 300;
export const QUIZ_EXPECTED_ANSWER_MAX = 2000;
export const QUIZ_CRITERION_MAX = 500;
export const QUIZ_CRITERIA_MIN = 1;
export const QUIZ_CRITERIA_MAX = 5;
export const QUIZ_CONCEPTS_MAX = 5;
export const QUIZ_CONCEPT_MAX = 80;
// Must cover the largest experiment context budget (source text) plus labelled block headers.
export const QUIZ_SNAPSHOT_MAX = 250000;
export const QUIZ_TOPIC_IDS_MAX = 30;
export const QUIZ_TOPIC_PATH_MAX = 2000;

export const ATTEMPT_STATUSES = ["in_progress", "submitted", "evaluated", "evaluation_failed"];
export const ATTEMPT_RESPONSE_MAX = 2000;
