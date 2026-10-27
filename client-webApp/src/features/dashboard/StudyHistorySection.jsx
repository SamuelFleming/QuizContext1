import { useEffect, useState } from "react";
import HistoryCounts from "../../components/history/HistoryCounts.jsx";
import RecentResultsList from "../../components/history/RecentResultsList.jsx";
import { useAuth } from "../../context/useAuth.js";
import { getStudyHistory } from "../../services/studyHistoryService.js";
import { listTopics } from "../../services/topicService.js";

const formatDate = (value) => new Date(value).toLocaleDateString();

const formatBucketDate = (value) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });

const formatAverage = (value) =>
  Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });

function ActivityChart({ activity }) {
  const total = activity.buckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const maximum = Math.max(1, ...activity.buckets.map((bucket) => bucket.count));
  const unit = activity.interval === "day" ? "Day" : "Week";

  return (
    <>
      <div
        className="activity-chart"
        style={{ "--activity-columns": activity.buckets.length }}
        aria-label={`Evaluated attempts over the last ${activity.days} days`}
      >
        {activity.buckets.map((bucket) => (
          <div className="activity-bucket" key={bucket.start}>
            <span className="activity-count">{bucket.count}</span>
            <span
              className={`activity-bar${bucket.count === 0 ? " empty" : ""}`}
              style={{ "--activity-height": `${Math.max(10, (bucket.count / maximum) * 100)}%` }}
              aria-hidden="true"
            />
            <span
              className="activity-date"
              title={`${unit} starting ${formatDate(bucket.start)}`}
            >
              {formatBucketDate(bucket.start)}
            </span>
          </div>
        ))}
      </div>
      <p className="status-line">
        {total} evaluated {total === 1 ? "attempt" : "attempts"} in the last {activity.days} days.
      </p>
    </>
  );
}

function WeakestLists({ topics, questions, navigate }) {
  return (
    <div className="weakness-grid">
      <div>
        <h3 className="subheading">Weakest topics</h3>
        {topics.length === 0 ? (
          <p className="status-line">No topic weakness data yet.</p>
        ) : (
          <ul className="usage-list">
            {topics.map((topic) => (
              <li key={`${topic.subjectName}-${topic.topicPath}`}>
                <span>{topic.topicPath}</span>
                <span className="usage-meta">
                  {topic.subjectName} · {topic.averagePercent}% average · {topic.quizCount}{" "}
                  {topic.quizCount === 1 ? "quiz" : "quizzes"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="subheading">Weakest questions</h3>
        {questions.length === 0 ? (
          <p className="status-line">No question weakness data yet.</p>
        ) : (
          <ul className="item-list compact-item-list">
            {questions.map((question, index) => (
              <li key={`${question.quizId}-${question.attemptId}-${index}`}>
                <button
                  type="button"
                  className="item-link"
                  onClick={() => navigate(`/attempts/${question.attemptId}`)}
                >
                  <span>{question.prompt}</span>
                  <span className="usage-meta">{question.quizTitle}</span>
                  <span className="usage-meta">
                    Average score {formatAverage(question.averageScore)} · answered{" "}
                    {question.timesAnswered} {question.timesAnswered === 1 ? "time" : "times"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function StudyHistorySection({ subjects, navigate }) {
  const { signOut } = useAuth();
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [recent, setRecent] = useState("5");
  const [activityDays, setActivityDays] = useState("7");
  const [page, setPage] = useState(1);
  const [topics, setTopics] = useState([]);
  const [topicError, setTopicError] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!subjectId) return undefined;

    let active = true;
    listTopics(subjectId)
      .then((data) => active && setTopics(data))
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          signOut();
          return;
        }
        setTopics([]);
        setTopicError(err.message || "Could not load topics.");
      });
    return () => {
      active = false;
    };
  }, [subjectId, signOut]);

  useEffect(() => {
    let active = true;
    getStudyHistory({ subjectId, topicId, recent, activity: activityDays, page })
      .then((data) => {
        if (!active) return;
        setSummary(data);
        setLoadError("");
      })
      .catch((err) => {
        if (!active) return;
        if (err.status === 401) {
          signOut();
          return;
        }
        setLoadError(err.message || "Could not load study history.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [subjectId, topicId, recent, activityDays, page, signOut]);

  const resetResults = () => {
    setPage(1);
    setSummary(null);
    setLoading(true);
    setLoadError("");
  };

  const changeSubject = (event) => {
    const nextSubjectId = event.target.value;
    setSubjectId(nextSubjectId);
    setTopicId("");
    setTopics(nextSubjectId ? null : []);
    setTopicError("");
    resetResults();
  };

  const changeTopic = (event) => {
    setTopicId(event.target.value);
    resetResults();
  };

  const changeRecent = (event) => {
    setRecent(event.target.value);
    resetResults();
  };

  const changeActivity = (event) => {
    setActivityDays(event.target.value);
    resetResults();
  };

  const changePage = (nextPage) => {
    setLoading(true);
    setLoadError("");
    setPage(nextPage);
  };

  return (
    <section className="card study-history" aria-live="polite">
      <h2>Study history</h2>
      <div className="history-filters">
        <label className="field">
          <span>Subject</span>
          <select value={subjectId} onChange={changeSubject} disabled={subjects === null}>
            <option value="">All subjects</option>
            {subjects?.map((subject) => (
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
            onChange={changeTopic}
            disabled={!subjectId || topics === null}
          >
            <option value="">All topics</option>
            {topics?.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.path || topic.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Recent results</span>
          <select value={recent} onChange={changeRecent}>
            <option value="1">Last 1 quiz</option>
            <option value="3">Last 3 quizzes</option>
            <option value="5">Last 5 quizzes</option>
            <option value="all">All quizzes</option>
          </select>
        </label>
        <label className="field">
          <span>Activity</span>
          <select value={activityDays} onChange={changeActivity}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
      </div>

      {topicError ? (
        <p className="error-text" role="alert">
          {topicError}
        </p>
      ) : null}
      {loadError ? (
        <p className="error-text" role="alert">
          {loadError}
        </p>
      ) : null}
      {!summary && loading ? (
        <p className="status-line">Loading study history…</p>
      ) : summary ? (
        <>
          <HistoryCounts counts={summary.counts} lastStudiedAt={summary.lastStudiedAt} />

          {summary.counts.quizzesSaved === 0 ? (
            <p className="status-line">No quizzes in this filter.</p>
          ) : summary.counts.evaluatedAttempts === 0 ? (
            <p className="status-line">
              Quizzes are saved in this filter, but none have an evaluated attempt yet.
            </p>
          ) : (
            <>
              <h3 className="subheading">Activity</h3>
              <ActivityChart activity={summary.activity} />
              <RecentResultsList
                items={summary.recentResults}
                pagination={summary.pagination}
                loading={loading}
                onPageChange={changePage}
                onSelectRow={(result) => navigate(`/attempts/${result.attemptId}`)}
              />
              <WeakestLists
                topics={summary.weakestTopics}
                questions={summary.weakestQuestions}
                navigate={navigate}
              />
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
