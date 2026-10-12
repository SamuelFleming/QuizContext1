import { useState } from "react";
import { childrenByParent, subtreeTopicIds } from "../content/topicTree.js";

function PickerRow({ topic, childMap, collapsed, onToggleOpen, selectedIds, onCheckTopic }) {
  const children = childMap.get(topic.id) || [];
  const isOpen = !collapsed.has(topic.id);
  const complete = topic.contentComplete;
  return (
    <li>
      <div className="tree-row">
        {children.length ? (
          <button
            type="button"
            className="tree-toggle"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${topic.name}`}
            aria-expanded={isOpen}
            onClick={() => onToggleOpen(topic.id)}
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="tree-toggle" aria-hidden="true" />
        )}
        <label className={complete ? "picker-check" : "picker-check incomplete"}>
          <input
            type="checkbox"
            checked={selectedIds.has(topic.id)}
            disabled={!complete}
            onChange={(event) => onCheckTopic(topic, event.target.checked)}
          />
          <span>{topic.name}</span>
          {complete ? null : <span className="picker-reason">No notes or documents</span>}
        </label>
      </div>
      {children.length && isOpen ? (
        <ul className="tree">
          {children.map((child) => (
            <PickerRow
              key={child.id}
              topic={child}
              childMap={childMap}
              collapsed={collapsed}
              onToggleOpen={onToggleOpen}
              selectedIds={selectedIds}
              onCheckTopic={onCheckTopic}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

// Checked state lives in the parent; which rows are open is local only, so
// collapsing a level never changes what is checked.
export default function TopicPicker({ topics, wholeSubject, selectedIds, disabled, onChange }) {
  const [collapsed, setCollapsed] = useState(new Set());
  const childMap = childrenByParent(topics);
  const roots = childMap.get(null) || [];
  const byId = new Map(topics.map((topic) => [topic.id, topic]));
  const incomplete = topics.filter((topic) => !topic.contentComplete);

  function toggleOpen(topicId) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }

  // Checking a topic also checks its content-complete descendants; unchecking
  // clears the whole subtree. Parents are never changed from a child.
  function checkTopic(topic, checked) {
    const next = new Set(selectedIds);
    for (const id of subtreeTopicIds(topics, topic.id)) {
      if (!checked) next.delete(id);
      else if (byId.get(id)?.contentComplete) next.add(id);
    }
    onChange({ wholeSubject: false, selectedIds: next });
  }

  return (
    <fieldset className="topic-picker" disabled={disabled}>
      <legend>Topics</legend>
      <div className="tree-row">
        <span className="tree-toggle" aria-hidden="true" />
        <label className="picker-check whole">
          <input
            type="checkbox"
            checked={wholeSubject}
            onChange={(event) =>
              onChange({ wholeSubject: event.target.checked, selectedIds: new Set() })
            }
          />
          <span>Whole subject</span>
        </label>
      </div>
      {roots.length ? (
        <ul className="tree">
          {roots.map((topic) => (
            <PickerRow
              key={topic.id}
              topic={topic}
              childMap={childMap}
              collapsed={collapsed}
              onToggleOpen={toggleOpen}
              selectedIds={selectedIds}
              onCheckTopic={checkTopic}
            />
          ))}
        </ul>
      ) : (
        <p className="usage-meta picker-note">No topics in this subject yet.</p>
      )}
      {wholeSubject && topics.length ? (
        <p className="usage-meta picker-note">
          {incomplete.length
            ? `These topics have no notes or documents and will be left out: ${incomplete
                .map((topic) => topic.name)
                .join(", ")}.`
            : "Every topic has content."}
        </p>
      ) : null}
    </fieldset>
  );
}
