import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { deleteQuiz, downloadQuiz, listQuizzes } from "../../services/quizService.js";
import { listSubjects } from "../../services/subjectService.js";
import { listTopics } from "../../services/topicService.js";
import { modeLabel } from "./contextNotice.js";
import QuizLibraryTopicFilter from "./QuizLibraryTopicFilter.jsx";

function resultLabel(quiz) {
  if (!quiz.latestResult) return "No evaluated attempt";
  return `${quiz.latestResult.score} / ${quiz.latestResult.maxScore}`;
}

function optionalCount(raw, name, minimum) {
  if (raw === "") return { value: undefined };
  if (!/^\d+$/.test(raw)) return { error: `${name} must be a whole number.` };
  const value = Number(raw);
  if (value < minimum || value > 20) {
    return { error: `${name} must be between ${minimum} and 20.` };
  }
  return { value };
}

function buildListQuery({ page, sort, selectedTopicIds, questionCount, multipleChoiceCount, shortAnswerCount }) {
  if (selectedTopicIds.size > 30) {
    return { error: "Choose no more than 30 topics." };
  }
  const total = optionalCount(questionCount, "Total questions", 1);
  if (total.error) return total;
  const mc = optionalCount(multipleChoiceCount, "Multiple-choice questions", 0);
  if (mc.error) return mc;
  const sa = optionalCount(shortAnswerCount, "Short-response questions", 0);
  if (sa.error) return sa;
  if (
    (total.value !== undefined && mc.value !== undefined && mc.value > total.value) ||
    (total.value !== undefined && sa.value !== undefined && sa.value > total.value) ||
    (mc.value !== undefined &&
      sa.value !== undefined &&
      (mc.value + sa.value < 1 ||
        mc.value + sa.value > 20 ||
        (total.value !== undefined && mc.value + sa.value !== total.value)))
  ) {
    return { error: "Those exact counts cannot describe the same 1–20 question quiz." };
  }
  return {
    query: {
      page,
      limit: 25,
      sort,
      topicIds: [...selectedTopicIds].sort(),
      questionCount: total.value,
      multipleChoiceCount: mc.value,
      shortAnswerCount: sa.value,
    },
  };
}

export default function QuizzesHome({ navigate }) {
  const { signOut } = useAuth();
  const [subjects, setSubjects] = useState(null);
  const [subjectId, setSubjectId] = useState("");
  const [topics, setTopics] = useState([]);
  const [topicError, setTopicError] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState(new Set());
  const [questionCount, setQuestionCount] = useState("");
  const [multipleChoiceCount, setMultipleChoiceCount] = useState("");
  const [shortAnswerCount, setShortAnswerCount] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loadedRequestKey, setLoadedRequestKey] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const parsed = useMemo(
    () =>
      buildListQuery({
        page,
        sort,
        selectedTopicIds,
        questionCount,
        multipleChoiceCount,
        shortAnswerCount,
      }),
    [page, sort, selectedTopicIds, questionCount, multipleChoiceCount, shortAnswerCount],
  );
  const requestKey = parsed.query ? `${JSON.stringify(parsed.query)}:${refreshKey}` : "";
  const displayLoading = Boolean(parsed.query) && loadedRequestKey !== requestKey;
  const hasFilters =
    selectedTopicIds.size > 0 ||
    questionCount !== "" ||
    multipleChoiceCount !== "" ||
    shortAnswerCount !== "";
  const hasChanges = hasFilters || sort !== "newest";

  useEffect(() => {
    let active = true;
    listSubjects()
      .then((data) => {
        if (active) setSubjects(data);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setError(err.message || "Could not load subjects.");
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
        setTopicError("");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else {
          setTopics([]);
          setTopicError(err.message || "Could not load topics.");
        }
      });
    return () => {
      active = false;
    };
  }, [subjectId, signOut]);

  useEffect(() => {
    if (!parsed.query) return undefined;
    let active = true;
    listQuizzes(parsed.query)
      .then((data) => {
        if (!active) return;
        setResult(data);
        setLoadedRequestKey(requestKey);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setLoadedRequestKey(requestKey);
        if (err.status === 401) signOut();
        else setError(err.message || "Could not load quizzes.");
      });
    return () => {
      active = false;
    };
  }, [parsed.query, requestKey, signOut]);

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
    setError("");
  }

  function clearFilters() {
    setSelectedTopicIds(new Set());
    setQuestionCount("");
    setMultipleChoiceCount("");
    setShortAnswerCount("");
    setSort("newest");
    setPage(1);
    setError("");
  }

  async function handleDelete(quiz) {
    if (!window.confirm(`Delete "${quiz.title}" and its attempts? Your notes and documents stay.`)) return;
    setBusyId(quiz.id);
    setError("");
    try {
      await deleteQuiz(quiz.id);
      if (result.items.length === 1 && page > 1) setPage((current) => current - 1);
      else setRefreshKey((current) => current + 1);
    } catch (err) {
      if (err.status === 401) signOut();
      else setError(err.message || "Could not delete the quiz.");
    } finally {
      setBusyId("");
    }
  }

  async function handleExport(quizId) {
    setBusyId(quizId);
    setError("");
    try {
      await downloadQuiz(quizId);
    } catch (err) {
      if (err.status === 401) signOut();
      else setError(err.message || "Could not export the quiz.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Quizzes</p>
          <h1>Quiz library</h1>
        </div>
        <button type="button" onClick={() => navigate("/quizzes/new")}>
          Generate quiz
        </button>
      </div>
      <div className="history-filters quiz-library-filters">
        <label className="field">
          <span>Subject for topics</span>
          <select
            value={subjectId}
            onChange={(event) => {
              setSubjectId(event.target.value);
              setTopics(event.target.value ? null : []);
              setSelectedTopicIds(new Set());
              setTopicError("");
              setPage(1);
            }}
            disabled={subjects === null}
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
          <span>Exact total questions</span>
          <input
            type="number"
            min="1"
            max="20"
            value={questionCount}
            onChange={(event) => changeFilter(setQuestionCount, event.target.value)}
            placeholder="Any"
          />
        </label>
        <label className="field">
          <span>Exact multiple choice</span>
          <input
            type="number"
            min="0"
            max="20"
            value={multipleChoiceCount}
            onChange={(event) => changeFilter(setMultipleChoiceCount, event.target.value)}
            placeholder="Any"
          />
        </label>
        <label className="field">
          <span>Exact short response</span>
          <input
            type="number"
            min="0"
            max="20"
            value={shortAnswerCount}
            onChange={(event) => changeFilter(setShortAnswerCount, event.target.value)}
            placeholder="Any"
          />
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="question_count_asc">Question count low to high</option>
            <option value="question_count_desc">Question count high to low</option>
          </select>
        </label>
      </div>
      {subjectId ? (
        <QuizLibraryTopicFilter
          topics={topics}
          selectedIds={selectedTopicIds}
          disabled={topics === null}
          onChange={(next) => changeFilter(setSelectedTopicIds, next)}
        />
      ) : (
        <p className="usage-meta">Choose a subject only to load topic choices; it does not filter quizzes by itself.</p>
      )}
      <div className="button-row quiz-filter-actions">
        <button type="button" className="secondary" onClick={clearFilters} disabled={!hasChanges}>
          Clear filters
        </button>
      </div>
      {topicError ? (
        <p className="error-text" role="alert">
          {topicError}
        </p>
      ) : null}
      {parsed.error ? (
        <p className="error-text" role="alert">
          {parsed.error}
        </p>
      ) : null}
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {displayLoading ? (
        <p className="status-line">Loading…</p>
      ) : parsed.error || error ? null : result?.items.length === 0 ? (
        <p className="status-line">
          {hasFilters
            ? "No quizzes match these filters."
            : "No quizzes yet. Generate one from a subject or topic."}
        </p>
      ) : (
        <ul className="item-list">
          {(result?.items || []).map((quiz) => (
            <li key={quiz.id} className="library-item">
              <button type="button" className="item-link" onClick={() => navigate(`/quizzes/${quiz.id}`)}>
                <span>{quiz.title}</span>
                <span className="usage-meta">
                  {quiz.topicPath || quiz.subjectName} · {modeLabel(quiz.contextMode)} · {quiz.questionCount} questions ·{" "}
                  {quiz.attemptCount} attempts · {resultLabel(quiz)}
                </span>
              </button>
              <div className="button-row">
                <button type="button" className="secondary" onClick={() => handleExport(quiz.id)} disabled={busyId === quiz.id}>
                  Export
                </button>
                <button type="button" className="secondary" onClick={() => handleDelete(quiz)} disabled={busyId === quiz.id}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!displayLoading && !parsed.error && !error && result?.pagination.totalPages > 1 ? (
        <nav className="pagination quiz-library-pagination" aria-label="Quiz library pages">
          <button
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <p>
            Page {result.pagination.page} of {result.pagination.totalPages}
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= result.pagination.totalPages}
          >
            Next
          </button>
        </nav>
      ) : null}
    </section>
  );
}