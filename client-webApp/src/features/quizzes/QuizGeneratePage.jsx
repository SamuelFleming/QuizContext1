import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { listSubjects } from "../../services/subjectService.js";
import { listTopics } from "../../services/topicService.js";
import { generateQuiz } from "../../services/quizService.js";
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
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState("");

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
    setLoading(true);
    try {
      const body = {
        subjectId,
        multipleChoiceCount: mc,
        shortAnswerCount: sa,
        difficulty,
        contextMode,
      };
      if (!wholeSubject) body.topicIds = topicIds;
      const quiz = await generateQuiz(body);
      navigate(`/quizzes/${quiz.id}`);
    } catch (err) {
      if (err.status === 401) signOut();
      else setError(err);
    } finally {
      setLoading(false);
    }
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
        {error ? (
          <div className="generation-error error-text" role="alert">
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
      </form>
    </section>
  );
}
