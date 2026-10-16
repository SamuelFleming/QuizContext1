import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { evaluateAttempt, getAttempt, saveAttempt, submitAttempt } from "../../services/quizService.js";
import { setLeaveGuard } from "../../utils/leaveGuard.js";
import { PROFILE_CODES } from "./contextNotice.js";
import QuizResults from "./QuizResults.jsx";

function withResponse(list, questionId, patch) {
  const current = list.find((item) => item.questionId === questionId) || {
    questionId,
    selectedOptionIndex: null,
    text: "",
  };
  return [...list.filter((item) => item.questionId !== questionId), { ...current, ...patch }];
}

function isAnswered(question, response) {
  if (!response) return false;
  if (question.type === "multiple_choice") return Number.isInteger(response.selectedOptionIndex);
  return Boolean(response.text?.trim());
}

export default function QuizPlayerPage({ attemptId, navigate }) {
  const { signOut } = useAuth();
  const [payload, setPayload] = useState(null);
  const [responses, setResponses] = useState([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    let active = true;
    getAttempt(attemptId)
      .then((data) => {
        if (!active) return;
        setPayload(data);
        setResponses(data.attempt.responses || []);
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) signOut();
        else setError(err.status === 404 ? "Attempt not found." : err.message || "Could not load the attempt.");
      });
    return () => {
      active = false;
    };
  }, [attemptId, signOut]);

  const inProgress = payload?.attempt.status === "in_progress";

  useEffect(() => {
    if (!inProgress) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    setLeaveGuard(() => window.confirm("Leave this attempt? It has not been submitted."));
    return () => {
      window.removeEventListener("beforeunload", warn);
      setLeaveGuard(null);
    };
  }, [inProgress]);

  async function run(fn) {
    setBusy(true);
    setError("");
    setErrorCode("");
    try {
      return await fn();
    } catch (err) {
      if (err.status === 401) signOut();
      else {
        setError(err.message || "Could not save the attempt.");
        setErrorCode(err.code || "");
      }
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function changeAnswer(questionId, patch) {
    const next = withResponse(responses, questionId, patch);
    setResponses(next);
    await run(() => saveAttempt(attemptId, next));
  }

  async function goTo(nextIndex) {
    const saved = await run(() => saveAttempt(attemptId, responses));
    if (saved) setIndex(nextIndex);
  }

  async function handleSubmit() {
    const questions = payload.quiz.questions;
    const unanswered = questions.flatMap((question, position) =>
      isAnswered(question, responses.find((item) => item.questionId === question.id)) ? [] : [position + 1],
    );
    if (unanswered.length) {
      const listed = unanswered.join(", ");
      if (!window.confirm(`These questions are unanswered: ${listed}. Submit anyway?`)) return;
    }
    setEvaluating(true);
    setError("");
    setErrorCode("");
    try {
      const result = await submitAttempt(attemptId, responses);
      setPayload(result);
      setResponses(result.attempt.responses || []);
    } catch (err) {
      if (err.status === 401) {
        signOut();
        return;
      }
      setError(err.message || "Could not evaluate the attempt.");
      setErrorCode(err.code || "");
      try {
        const latest = await getAttempt(attemptId);
        setPayload(latest);
        setResponses(latest.attempt.responses || []);
      } catch {
        // The status panel appears once the saved attempt can be read.
      }
    } finally {
      setEvaluating(false);
    }
  }

  async function retryEvaluation() {
    setEvaluating(true);
    setError("");
    setErrorCode("");
    try {
      const result = await evaluateAttempt(attemptId);
      setPayload(result);
      setResponses(result.attempt.responses || []);
    } catch (err) {
      if (err.status === 401) {
        signOut();
        return;
      }
      setError(err.message || "Could not evaluate the attempt.");
      setErrorCode(err.code || "");
      try {
        const latest = await getAttempt(attemptId);
        setPayload(latest);
      } catch {
        // Keep the failed panel and the error already shown.
      }
    } finally {
      setEvaluating(false);
    }
  }

  if (error && !payload) {
    return (
      <section className="card">
        <p className="error-text" role="alert">
          {error}
        </p>
        <button type="button" className="link" onClick={() => navigate("/quizzes")}>
          Back to quizzes
        </button>
      </section>
    );
  }

  if (!payload) {
    return (
      <section className="card">
        <p className="status-line">Loading…</p>
      </section>
    );
  }

  if (evaluating) {
    return (
      <section className="card">
        <p className="eyebrow">Evaluating</p>
        <h1>{payload.quiz.title}</h1>
        <p className="status-line">Marking your answers…</p>
      </section>
    );
  }

  if (payload.attempt.status === "evaluated" && payload.attempt.results) {
    return <QuizResults payload={payload} navigate={navigate} />;
  }

  if (!inProgress) {
    return (
      <section className="card">
        <p className="eyebrow">{payload.attempt.status === "evaluation_failed" ? "Evaluation failed" : "Submitted"}</p>
        <h1>{payload.quiz.title}</h1>
        <p className="lede">Your answers are saved. Evaluation did not finish, so there are no results yet.</p>
        {error ? (
          <p className="error-text" role="alert">
            {error}{" "}
            {PROFILE_CODES.has(errorCode) ? (
              <button type="button" className="link" onClick={() => navigate("/profile")}>
                Open Profile
              </button>
            ) : null}
          </p>
        ) : null}
        <div className="button-row">
          <button type="button" onClick={retryEvaluation} disabled={busy}>
            {busy ? "Retrying…" : "Retry evaluation"}
          </button>
          <button type="button" className="secondary" onClick={() => navigate(`/quizzes/${payload.quiz.id}`)}>
            Back to quiz
          </button>
        </div>
      </section>
    );
  }

  const questions = payload.quiz.questions;
  const question = questions[index];
  const response = responses.find((item) => item.questionId === question.id);
  const answeredCount = questions.filter((item) =>
    isAnswered(item, responses.find((entry) => entry.questionId === item.id)),
  ).length;

  return (
    <section className="card">
      <p className="eyebrow">Quiz</p>
      <h1>{payload.quiz.title}</h1>
      <p className="status-line">
        Question {index + 1} of {questions.length}. {answeredCount} answered.
      </p>
      <nav className="question-nav" aria-label="Questions">
        {questions.map((item, position) => (
          <button
            key={item.id}
            type="button"
            className={position === index ? "secondary" : "link"}
            aria-current={position === index ? "true" : undefined}
            onClick={() => goTo(position)}
            disabled={busy}
          >
            {position + 1}
          </button>
        ))}
      </nav>
      <p>{question.prompt}</p>
      {question.type === "multiple_choice" ? (
        <fieldset className="choice-group">
          <legend>Choose one</legend>
          {question.options.map((option, optionIndex) => (
            <label className="choice" key={option}>
              <input
                type="radio"
                name={question.id}
                checked={response?.selectedOptionIndex === optionIndex}
                onChange={() => changeAnswer(question.id, { selectedOptionIndex: optionIndex, text: "" })}
                disabled={busy}
              />
              {option}
            </label>
          ))}
        </fieldset>
      ) : (
        <label className="field">
          <span>Your answer</span>
          <textarea
            rows={5}
            maxLength={2000}
            value={response?.text || ""}
            onChange={(event) =>
              setResponses((current) => withResponse(current, question.id, { text: event.target.value, selectedOptionIndex: null }))
            }
            onBlur={(event) => {
              const next = withResponse(responses, question.id, {
                text: event.target.value,
                selectedOptionIndex: null,
              });
              setResponses(next);
              run(() => saveAttempt(attemptId, next));
            }}
            disabled={busy}
          />
        </label>
      )}
      {error ? (
        <p className="error-text" role="alert">
          {error}{" "}
          {PROFILE_CODES.has(errorCode) ? (
            <button type="button" className="link" onClick={() => navigate("/profile")}>
              Open Profile
            </button>
          ) : null}
        </p>
      ) : null}
      <div className="button-row">
        <button type="button" className="secondary" onClick={() => goTo(index - 1)} disabled={busy || index === 0}>
          Previous
        </button>
        {index < questions.length - 1 ? (
          <button type="button" onClick={() => goTo(index + 1)} disabled={busy}>
            Next
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={busy}>
            {busy ? "Submitting…" : "Submit"}
          </button>
        )}
      </div>
    </section>
  );
}
