import { childrenByParent } from "./topicTree.js";

function TopicNode({ topic, childMap, selectedId, expanded, onToggle, onSelect }) {
  const children = childMap.get(topic.id) || [];
  const isOpen = expanded.has(topic.id);
  return (
    <li>
      <div className={selectedId === topic.id ? "tree-row selected" : "tree-row"}>
        {children.length ? (
          <button
            type="button"
            className="tree-toggle"
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${topic.name}`}
            aria-expanded={isOpen}
            onClick={() => onToggle(topic.id)}
          >
            {isOpen ? "▾" : "▸"}
          </button>
        ) : (
          <span className="tree-toggle" aria-hidden="true" />
        )}
        <button
          type="button"
          className="tree-label"
          aria-current={selectedId === topic.id ? "true" : undefined}
          onClick={() => onSelect(topic.id)}
        >
          {topic.name}
        </button>
      </div>
      {children.length && isOpen ? (
        <ul className="tree">
          {children.map((child) => (
            <TopicNode
              key={child.id}
              topic={child}
              childMap={childMap}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

// selectedId null means the subject itself is selected.
export default function TopicTree({ subjectName, topics, selectedId, expanded, onToggle, onSelect }) {
  const childMap = childrenByParent(topics);
  const roots = childMap.get(null) || [];
  return (
    <nav className="tree-panel" aria-label="Topics">
      <div className={selectedId === null ? "tree-row selected" : "tree-row"}>
        <button
          type="button"
          className="tree-label subject"
          aria-current={selectedId === null ? "true" : undefined}
          onClick={() => onSelect(null)}
        >
          {subjectName}
        </button>
      </div>
      {roots.length ? (
        <ul className="tree">
          {roots.map((topic) => (
            <TopicNode
              key={topic.id}
              topic={topic}
              childMap={childMap}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : (
        <p className="usage-meta tree-empty">No topics yet.</p>
      )}
    </nav>
  );
}
