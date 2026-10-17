import { useEffect, useMemo, useRef, useState } from "react";
import AiRunDetails from "../../components/ai/AiRunDetails.jsx";
import { useAuth } from "../../context/useAuth.js";
import { listAiModels } from "../../services/aiService.js";
import { listSubjects } from "../../services/subjectService.js";
import { listTopics } from "../../services/topicService.js";
import { generateQuiz, previewQuiz } from "../../services/quizService.js";
import { aiFailureLabel } from "../../utils/aiFailures.js";
import { subtreeTopicIds } from "../content/topicTree.js";
import { CONTEXT_MODES, PROFILE_CODES, generationErrorText } from "./contextNotice.js";
import TopicPicker from "./TopicPicker.jsx";

const DIFFICULTIES = [
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
];

const DEFAULT_MODEL = "gpt-6-luna";
const LIVE_PREVIEW_DEBOUNCE_MS = 400;

function initialQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    subjectId: params.get("subjectId") || "",
    topicId: params.get("topicId") || "",
  };
}

function parseCount(raw) {
  if (!/^\d+$/.test(String(raw).trim())) return null;
  return Number(raw);
}

const formatAiMetric = (value) => (value == null ? "—" : value.toLocaleString());

function formatEstimateCost(value) {
  if (value == null) return "—";
  return `$${Number(value).toFixed(4)}`;
}

function sentCount(counts) {
  return (counts?.included || 0) + (counts?.truncated || 0);
}

function completeTopicIds(topics, selectedIds) {
  return topics
    .filter((topic) => selectedIds.has(topic.id) && topic.contentComplete)
    .map((topic) => topic.id);
}

function buildQuizBody({
  subjectId,
  wholeSubject,
  topics,
  selectedIds,
  multipleChoiceCount,
  shortAnswerCount,
  difficulty,
  contextMode,
  model,
}) {
  const body = {
    subjectId,
    multipleChoiceCount,
    shortAnswerCount,
    difficulty,
    contextMode,
    model,
  };
  if (!wholeSubject) {
    body.topicIds = completeTopicIds(topics, selectedIds);
  }
  return body;
}

function PreviewPanel({ preview, preparing }) {
  return (
    <section className="generation-progress" aria-live="polite" aria-busy="true">
      <p className="eyebrow">{preparing ? "Preparing input" : "Generating quiz"}</p>
      <h2>{preparing ? "Checking your selected content…" : "Your quiz is being created…"}</h2>
      {preview ? (
        <dl className="generation-facts">
          <div>
            <dt>Input size</dt>
            <dd>{formatAiMetric(preview.inputChars)} characters</dd>
          </div>
          <div>
            <dt>Input scope</dt>
            <dd>
              {sentCount(preview.sources?.topics)} topics ·{" "}
              {sentCount(preview.sources?.documents)} documents
            </dd>
          </div>
          <div>
            <dt>Maximum output</dt>
            <dd>{formatAiMetric(preview.maxOutputTokens)} tokens</dd>
          </div>
          <div>
            <dt>Limited sources</dt>
            <dd>
              {preview.context?.sourcesTruncated || 0} truncated ·{" "}
              {preview.context?.sourcesExcluded || 0} excluded
            </dd>
          </div>
        </dl>
      ) : (
        <p className="status-line">Assembling and measuring the selected notes and documents.</p>
      )}
      <p className="generation-progress-note">
        Exact input and output token counts are available when the AI call finishes.
      </p>
    </section>
  );
}

function EstimateSummary({ preview, loading, error }) {
  if (error) {
    return (
      <div className="estimate-summary estimate-summary--soft" role="status">
        <p className="usage-meta">{error}</p>
      </div>
    );
  }
  if (loading && !preview) {
    return (
      <div className="estimate-summary estimate-summary--soft" aria-live="polite" aria-busy="true">
        <p className="usage-meta">Estimating cost…</p>
      </div>
    );
  }
  if (!preview) {
    return (
      <div className="estimate-summary estimate-summary--soft">
        <p className="usage-meta">Choose a subject and question counts to see cost estimates.</p>
      </div>
    );
  }
  const includedChars = preview.context?.includedChars;
  return (
    <div className="estimate-summary" aria-live="polite">
      <p className="estimate-summary-title">
        Cost estimate{loading ? " (updating…)" : ""}
        {preview.model ? (
          <>
            {" "}
            · <code>{preview.model}</code>
          </>
        ) : null}
      </p>
      <dl className="estimate-facts">
        <div>
          <dt>Input (sent to API)</dt>
          <dd>
            {formatAiMetric(preview.inputChars)} characters · ~
            {formatAiMetric(preview.estimatedInputTokens)} tokens ·{" "}
            {formatEstimateCost(preview.estimatedInputCostUsd)}
          </dd>
        </div>
        <div>
          <dt>Context budget</dt>
          <dd>
            {includedChars != null
              ? `${formatAiMetric(includedChars)} of ${formatAiMetric(preview.contextMaxChars)} characters used`
              : `${formatAiMetric(preview.contextMaxChars)} character cap`}
          </dd>
        </div>
        <div>
          <dt>Output (up to)</dt>
          <dd>
            {formatAiMetric(preview.maxOutputTokens)} tokens ·{" "}
            {formatEstimateCost(preview.estimatedOutputCostUsd)}
          </dd>
        </div>
        <div>
          <dt>Total (up to)</dt>
          <dd>{formatEstimateCost(preview.estimatedTotalCostUsd)}</dd>
        </div>
      </dl>
      <p className="usage-meta">
        Estimates only — input tokens use a character heuristic (prompt input plus instructions);
        output $ is a ceiling at the max token cap. Exact tokens and cost appear after generation.
      </p>
    </div>
  );
}

function AiRunDialog({ run, onClose, triggerRef }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, []);

  function handleClose() {
    onClose();
    triggerRef.current?.focus();
  }

  return (
    <dialog
      ref={dialogRef}
      className="ai-run-dialog"
      aria-labelledby="ai-run-dialog-title"
      onClose={handleClose}
    >
      <div className="dialog-head">
        <div>
          <p className="eyebrow">AI run</p>
          <h2 id="ai-run-dialog-title">Generation details</h2>
        </div>
        <button
          type="button"
          className="secondary"
          aria-label="Close generation details"
          onClick={() => dialogRef.current?.close()}
        >
          Close
        </button>
      </div>
      <AiRunDetails run={run} />
    </dialog>
  );
}

export default function QuizGeneratePage({ navigate }) {
  const { signOut } = useAuth();
  const prefill = initialQuery();
  const [subjects, setSubjects] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subjectId, setSubjectId] = useState(prefill.subjectId);
  const [wholeSubject, setWholeSubject] = useState(!prefill.topicId);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const prefillTopicRef = useRef(prefill.topicId);
  const [title, setTitle] = useState("");
  const [multipleChoiceCount, setMultipleChoiceCount] = useState("6");
  const [shortAnswerCount, setShortAnswerCount] = useState("4");
  const [difficulty, setDifficulty] = useState("medium");
  const [contextMode, setContextMode] = useState("targeted");
  const [models, setModels] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [livePreview, setLivePreview] = useState(null);
  const [livePreviewLoading, setLivePreviewLoading] = useState(false);
  const [livePreviewError, setLivePreviewError] = useState("");
  const [result, setResult] = useState(null);
  const [detailsRun, setDetailsRun] = useState(null);
  const detailsTriggerRef = useRef(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const loading = phase === "preparing" || phase === "generating";
  const selectedKey = useMemo(
    () => Array.from(selectedIds).sort().join(","),
    [selectedIds],
  );

  useEffect(() => {
    let active = true;
    Promise.all([listSubjects(), listAiModels()])
      .then(([subjectData, modelData]) => {
        if (!active) return;
        setSubjects(subjectData);
        const rows = Array.isArray(modelData) ? modelData : [];
        setModels(rows);
        if (rows.some((row) => row.id === DEFAULT_MODEL)) {
          setModel(DEFAULT_MODEL);
        } else if (rows[0]?.id) {
          setModel(rows[0].id);
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setLoadError(err.message || "Could not load subjects or models.");
      });
    return () => {
      active = false;
    };
  }, [signOut]);

  useEffect(() => {
    if (!subjectId) return undefined;
    let active = true;
    listTopics(subjectId)
      .then((data) => {
        if (!active) return;
        setTopics(data);
        // Apply a ?topicId= link once: check the topic and its content-complete
        // descendants when it is complete; otherwise leave nothing checked so the
        // disabled row shows why.
        const prefillId = prefillTopicRef.current;
        if (!prefillId) return;
        prefillTopicRef.current = "";
        const target = data.find((topic) => topic.id === prefillId);
        if (!target) {
          setWholeSubject(true);
          return;
        }
        if (target.contentComplete) {
          const byId = new Map(data.map((topic) => [topic.id, topic]));
          setSelectedIds(
            new Set(
              subtreeTopicIds(data, target.id).filter((id) => byId.get(id).contentComplete),
            ),
          );
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setTopics([]);
      });
    return () => {
      active = false;
    };
  }, [subjectId, signOut]);

  useEffect(() => {
    if (phase !== "idle" && phase !== "failure") {
      return undefined;
    }
    const mc = parseCount(multipleChoiceCount);
    const sa = parseCount(shortAnswerCount);
    const topicIds = completeTopicIds(topics, selectedIds);
    const canPreview =
      Boolean(subjectId) &&
      Boolean(model) &&
      mc !== null &&
      sa !== null &&
      mc + sa >= 1 &&
      mc + sa <= 20 &&
      (wholeSubject || topicIds.length > 0);

    if (!canPreview) {
      setLivePreview(null);
      setLivePreviewError("");
      setLivePreviewLoading(false);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(() => {
      setLivePreviewLoading(true);
      setLivePreviewError("");
      const body = buildQuizBody({
        subjectId,
        wholeSubject,
        topics,
        selectedIds,
        multipleChoiceCount: mc,
        shortAnswerCount: sa,
        difficulty,
        contextMode,
        model,
      });
      previewQuiz(body)
        .then((data) => {
          if (!active) return;
          setLivePreview(data);
          setLivePreviewLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          if (err.status === 401) {
            signOut();
            return;
          }
          setLivePreview(null);
          setLivePreviewLoading(false);
          setLivePreviewError(
            err.code === "CONTEXT_INSUFFICIENT"
              ? err.message || "Not enough content to estimate yet."
              : err.message || "Could not refresh the cost estimate.",
          );
        });
    }, LIVE_PREVIEW_DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    phase,
    subjectId,
    wholeSubject,
    selectedKey,
    topics,
    multipleChoiceCount,
    shortAnswerCount,
    difficulty,
    contextMode,
    model,
    signOut,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPreview(null);
    setResult(null);
    setFormError("");
    const mc = parseCount(multipleChoiceCount);
    const sa = parseCount(shortAnswerCount);
    if (!subjectId) {
      setFormError("Choose a subject.");
      return;
    }
    // Mirror the server: only content-complete ids, and never both Whole
    // subject and topicIds (whole subject sends neither field).
    const topicIds = completeTopicIds(topics, selectedIds);
    if (!wholeSubject && topicIds.length === 0) {
      setFormError("Choose at least one topic, or Whole subject.");
      return;
    }
    if (mc === null || sa === null || mc + sa < 1 || mc + sa > 20) {
      setFormError("Use between 1 and 20 questions in total.");
      return;
    }
    if (!model) {
      setFormError("Choose a model.");
      return;
    }
    setPhase("preparing");
    try {
      const body = buildQuizBody({
        subjectId,
        wholeSubject,
        topics,
        selectedIds,
        multipleChoiceCount: mc,
        shortAnswerCount: sa,
        difficulty,
        contextMode,
        model,
      });
      const nextPreview = await previewQuiz(body);
      setPreview(nextPreview);
      setLivePreview(nextPreview);
      setPhase("generating");
      const quiz = await generateQuiz({ ...body, ...(title.trim() ? { title } : {}) });
      setResult(quiz);
      setPhase("success");
    } catch (err) {
      if (err.status === 401) {
        setPhase("idle");
        signOut();
      } else {
        setError(err);
        setPhase("failure");
      }
    }
  }

  function openDetails(run, event) {
    detailsTriggerRef.current = event.currentTarget;
    setDetailsRun(run);
  }

  function resetGeneration() {
    setError(null);
    setPreview(null);
    setResult(null);
    setPhase("idle");
  }

  if (loadError) {
    return (
      <section className="card">
        <p className="error-text" role="alert">
          {loadError}
        </p>
      </section>
    );
  }

  if (phase === "success" && result) {
    return (
      <section className="card generation-result" aria-live="polite">
        <p className="eyebrow">Quiz ready</p>
        <h1>{result.title}</h1>
        <p className="lede">Generation completed. Open the saved quiz when you are ready.</p>
        <dl className="generation-facts">
          <div>
            <dt>Input</dt>
            <dd>{formatAiMetric(result.aiRun?.inputTokens)} tokens</dd>
          </div>
          <div>
            <dt>Output</dt>
            <dd>{formatAiMetric(result.aiRun?.outputTokens)} tokens</dd>
          </div>
          <div>
            <dt>Input size</dt>
            <dd>{formatAiMetric(result.aiRun?.inputChars)} characters</dd>
          </div>
        </dl>
        <div className="button-row">
          <button type="button" onClick={() => navigate(`/quizzes/${result.id}`)}>
            Open quiz
          </button>
          {result.aiRun ? (
            <button type="button" className="secondary" onClick={(event) => openDetails(result.aiRun, event)}>
              See details
            </button>
          ) : null}
          <button type="button" className="link" onClick={resetGeneration}>
            Generate another
          </button>
        </div>
        {detailsRun ? (
          <AiRunDialog
            run={detailsRun}
            triggerRef={detailsTriggerRef}
            onClose={() => setDetailsRun(null)}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section className="card">
      <p className="eyebrow">New quiz</p>
      <h1>Generate a quiz</h1>
      <p className="lede">Choose what to study. Targeted is the default context mode.</p>
      <form className="stack" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Quiz title (optional)</span>
          <input
            type="text"
            value={title}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
            disabled={loading}
          />
          <span className="usage-meta">
            Leave blank to use a label based on the selected subject or topics.
          </span>
        </label>
        <label className="field">
          <span>Subject</span>
          <select
            value={subjectId}
            onChange={(event) => {
              setSubjectId(event.target.value);
              setTopics([]);
              setSelectedIds(new Set());
              setWholeSubject(true);
            }}
            disabled={loading || !subjects}
            required
          >
            <option value="">{subjects ? "Choose a subject" : "Loading…"}</option>
            {(subjects || []).map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        {subjectId ? (
          <TopicPicker
            topics={topics}
            wholeSubject={wholeSubject}
            selectedIds={selectedIds}
            disabled={loading}
            onChange={(next) => {
              setWholeSubject(next.wholeSubject);
              setSelectedIds(next.selectedIds);
            }}
          />
        ) : null}
        <div className="generate-settings-row">
          <div className="generate-settings-fields">
            <label className="field">
              <span>Model</span>
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                disabled={loading || !models}
                required
              >
                {(models || [{ id: DEFAULT_MODEL, displayName: "Luna" }]).map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.displayName}
                  </option>
                ))}
              </select>
            </label>
            <div className="count-row">
              <label className="field">
                <span>Multiple choice</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={multipleChoiceCount}
                  onChange={(event) => setMultipleChoiceCount(event.target.value)}
                  disabled={loading}
                  required
                />
              </label>
              <label className="field">
                <span>Short answer</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={shortAnswerCount}
                  onChange={(event) => setShortAnswerCount(event.target.value)}
                  disabled={loading}
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
                disabled={loading}
              >
                {DIFFICULTIES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Context mode</span>
              <select
                value={contextMode}
                onChange={(event) => setContextMode(event.target.value)}
                disabled={loading}
              >
                {CONTEXT_MODES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <EstimateSummary
            preview={livePreview}
            loading={livePreviewLoading}
            error={livePreviewError}
          />
        </div>
        {formError ? (
          <p className="error-text" role="alert">
            {formError}
          </p>
        ) : null}
        {loading ? <PreviewPanel preview={preview} preparing={phase === "preparing"} /> : null}
        {error ? (
          <div className="generation-error error-text" role="alert">
            {error.code ? (
              <p>
                <strong>Error code:</strong> <code>{error.code}</code>
              </p>
            ) : null}
            <p>
              {generationErrorText(error)}{" "}
              {PROFILE_CODES.has(error.code) ? (
                <button type="button" className="link" onClick={() => navigate("/profile")}>
                  Open Profile
                </button>
              ) : null}
            </p>
            {error.code === "AI_INVALID_OUTPUT" && error.failures?.length > 0 ? (
              <ul className="failure-list">
                {error.failures.map((failure) => (
                  <li key={failure}>{aiFailureLabel(failure)}</li>
                ))}
              </ul>
            ) : null}
            {error.aiRun ? (
              <button
                type="button"
                className="secondary generation-details-button"
                onClick={(event) => openDetails(error.aiRun, event)}
              >
                See details
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="button-row">
          <button type="submit" disabled={loading}>
            {loading ? "Generating…" : "Generate quiz"}
          </button>
          <button type="button" className="link" onClick={() => navigate("/quizzes")} disabled={loading}>
            Cancel
          </button>
        </div>
        {detailsRun ? (
          <AiRunDialog
            run={detailsRun}
            triggerRef={detailsTriggerRef}
            onClose={() => setDetailsRun(null)}
          />
        ) : null}
      </form>
    </section>
  );
}
