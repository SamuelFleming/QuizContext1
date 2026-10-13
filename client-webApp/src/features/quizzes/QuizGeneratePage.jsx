import { useEffect, useRef, useState } from "react";
import AiRunDetails from "../../components/ai/AiRunDetails.jsx";
import { useAuth } from "../../context/useAuth.js";
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

function sentCount(counts) {
  return (counts?.included || 0) + (counts?.truncated || 0);
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
  const [multipleChoiceCount, setMultipleChoiceCount] = useState("6");
  const [shortAnswerCount, setShortAnswerCount] = useState("4");
  const [difficulty, setDifficulty] = useState("medium");
  const [contextMode, setContextMode] = useState("targeted");
  const [phase, setPhase] = useState("idle");
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [detailsRun, setDetailsRun] = useState(null);
  const detailsTriggerRef = useRef(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");
  const loading = phase === "preparing" || phase === "generating";

  useEffect(() => {
    let active = true;
    listSubjects()
      .then((data) => {
        if (!active) return;
        setSubjects(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setLoadError(err.message || "Could not load subjects.");
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
    const topicIds = topics
      .filter((topic) => selectedIds.has(topic.id) && topic.contentComplete)
      .map((topic) => topic.id);
    if (!wholeSubject && topicIds.length === 0) {
      setFormError("Choose at least one topic, or Whole subject.");
      return;
    }
    if (mc === null || sa === null || mc + sa < 1 || mc + sa > 20) {
      setFormError("Use between 1 and 20 questions in total.");
      return;
    }
    setPhase("preparing");
    try {
      const body = {
        subjectId,
        multipleChoiceCount: mc,
        shortAnswerCount: sa,
        difficulty,
        contextMode,
      };
      if (!wholeSubject) body.topicIds = topicIds;
      const nextPreview = await previewQuiz(body);
      setPreview(nextPreview);
      setPhase("generating");
      const quiz = await generateQuiz(body);
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
