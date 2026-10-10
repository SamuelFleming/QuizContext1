import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { listSubjects } from "../../services/subjectService.js";
import { listTopics } from "../../services/topicService.js";
import { generateQuiz } from "../../services/quizService.js";
import { CONTEXT_MODES, PROFILE_CODES, generationErrorText } from "./contextNotice.js";

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
  const [topicId, setTopicId] = useState(prefill.topicId);
  const [includeDescendants, setIncludeDescendants] = useState(true);
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
        setTopicId((current) => (data.some((topic) => topic.id === current) ? current : ""));
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
    if (mc === null || sa === null || mc + sa < 1 || mc + sa > 20) {
      setFormError("Use between 1 and 20 questions in total.");
      return;
    }
    setLoading(true);
    try {
      const quiz = await generateQuiz({
        subjectId,
        topicId: topicId || null,
        includeDescendants,
        multipleChoiceCount: mc,
        shortAnswerCount: sa,
        difficulty,
        contextMode,
      });
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
              setTopicId("");
              setTopics([]);
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
        <label className="field">
          <span>Topic</span>
          <select
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
            disabled={loading || !subjectId}
          >
            <option value="">Whole subject</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>
        <label className="suggestion-toggle">
          <input
            type="checkbox"
            checked={includeDescendants}
            onChange={(event) => setIncludeDescendants(event.target.checked)}
            disabled={loading}
          />
          Include subtopics
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
        {formError ? (
          <p className="error-text" role="alert">
            {formError}
          </p>
        ) : null}
        {error ? (
          <p className="error-text" role="alert">
            {generationErrorText(error)}{" "}
            {PROFILE_CODES.has(error.code) ? (
              <button type="button" className="link" onClick={() => navigate("/profile")}>
                Open Profile
              </button>
            ) : null}
          </p>
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
