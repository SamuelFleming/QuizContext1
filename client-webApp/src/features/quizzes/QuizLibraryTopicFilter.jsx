import { childrenByParent } from "../content/topicTree.js";

function TopicRows({ parentId, childMap, selectedIds, onToggle }) {
  const topics = childMap.get(parentId) || [];
  if (!topics.length) return null;
  return (
    <ul className="tree">
      {topics.map((topic) => (
        <li key={topic.id}>
          <div className="tree-row">
            <span className="tree-toggle" aria-hidden="true" />
            <label className="picker-check">
              <input
                type="checkbox"
                checked={selectedIds.has(topic.id)}
                onChange={(event) => onToggle(topic.id, event.target.checked)}
              />
              <span>{topic.name}</span>
            </label>
          </div>
          <TopicRows
            parentId={topic.id}
            childMap={childMap}
            selectedIds={selectedIds}
            onToggle={onToggle}
          />
        </li>
      ))}
    </ul>
  );
}

export default function QuizLibraryTopicFilter({ topics, selectedIds, disabled, onChange }) {
  const childMap = childrenByParent(topics || []);

  function toggle(topicId, checked) {
    const next = new Set(selectedIds);
    if (checked) next.add(topicId);
    else next.delete(topicId);
    onChange(next);
  }

  return (
    <fieldset className="topic-picker library-topic-filter" disabled={disabled}>
      <legend>Topics</legend>
      {topics === null ? (
        <p className="status-line">Loading topics…</p>
      ) : topics.length === 0 ? (
        <p className="usage-meta picker-note">No topics in this subject yet.</p>
      ) : (
        <TopicRows
          parentId={null}
          childMap={childMap}
          selectedIds={selectedIds}
          onToggle={toggle}
        />
      )}
    </fieldset>
  );
}
