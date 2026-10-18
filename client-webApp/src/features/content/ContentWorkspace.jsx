import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { deleteSubject, getSubject, updateSubject } from "../../services/subjectService.js";
import { createTopic, deleteTopic, listTopics, updateTopic } from "../../services/topicService.js";
import DocumentsPanel from "./DocumentsPanel.jsx";
import NodeDetails from "./NodeDetails.jsx";
import ScopeQuizList from "./ScopeQuizList.jsx";
import TopicTree from "./TopicTree.jsx";
import { ancestorIds, countDescendants } from "./topicTree.js";

export default function ContentWorkspace({ subjectId, navigate }) {
  const { signOut } = useAuth();
  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const notesDirty = useRef(false);
  const setNotesDirty = useCallback((dirty) => {
    notesDirty.current = dirty;
  }, []);

  const select = useCallback((id) => {
    if (notesDirty.current && !window.confirm("Discard unsaved changes?")) return;
    notesDirty.current = false;
    setSelectedId(id);
  }, []);

  // A 401 anywhere ends the session; other errors go back to the caller to display.
  const guard = useCallback(
    async (fn) => {
      try {
        return await fn();
      } catch (err) {
        if (err.status === 401) signOut();
        throw err;
      }
    },
    [signOut],
  );

  useEffect(() => {
    let active = true;
    guard(() => Promise.all([getSubject(subjectId), listTopics(subjectId)]))
      .then(([subjectData, topicData]) => {
        if (!active) return;
        setSubject(subjectData);
        setTopics(topicData);
      })
      .catch((err) => {
        if (!active || err.status === 401) return;
        setLoadError(err.status === 404 ? "Subject not found." : err.message);
      });
    return () => {
      active = false;
    };
  }, [subjectId, guard]);

  const toggle = useCallback((id) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (loadError) {
    return (
      <section className="card">
        <p className="error-text" role="alert">
          {loadError}
        </p>
        <button type="button" className="link" onClick={() => navigate("/subjects")}>
          Back to subjects
        </button>
      </section>
    );
  }

  if (!subject) {
    return (
      <section className="card">
        <p className="status-line">Loading…</p>
      </section>
    );
  }

  const selectedTopic = selectedId ? topics.find((t) => t.id === selectedId) : null;
  const kind = selectedTopic ? "topic" : "subject";
  const node = selectedTopic || subject;

  async function saveSelected(changes) {
    if (selectedTopic) {
      const updated = await guard(() => updateTopic(selectedTopic.id, changes));
      setTopics((current) => current.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      setSubject(await guard(() => updateSubject(subjectId, changes)));
    }
  }

  async function handleAddTopic(name) {
    const parentTopicId = selectedTopic ? selectedTopic.id : null;
    const created = await guard(() => createTopic(subjectId, { name, parentTopicId }));
    setTopics((current) => [...current, created]);
    if (parentTopicId) {
      setExpanded((current) => new Set([...current, parentTopicId, ...ancestorIds(topics, parentTopicId)]));
    }
  }

  async function handleDelete() {
    if (selectedTopic) {
      const result = await guard(() => deleteTopic(selectedTopic.id));
      const removed = new Set(result.deletedTopicIds);
      setTopics((current) => current.filter((t) => !removed.has(t.id)));
      notesDirty.current = false;
      setSelectedId(selectedTopic.parentTopicId);
    } else {
      await guard(() => deleteSubject(subjectId));
      navigate("/subjects");
    }
  }

  return (
    <div className="card workspace">
      <div className="workspace-head">
        <button type="button" className="link" onClick={() => navigate("/subjects")}>
          ← Subjects
        </button>
      </div>
      <div className="workspace-body">
        <aside className="workspace-side">
          <TopicTree
            subjectName={subject.name}
            topics={topics}
            selectedId={selectedId}
            expanded={expanded}
            onToggle={toggle}
            onSelect={select}
          />
          <DocumentsPanel
            key={`docs:${selectedTopic ? selectedTopic.id : `subject:${subjectId}`}`}
            subjectId={subjectId}
            topicId={selectedTopic ? selectedTopic.id : null}
            guard={guard}
          />
          <ScopeQuizList
            key={`quizzes:${selectedTopic ? selectedTopic.id : `subject:${subjectId}`}`}
            subjectId={subjectId}
            topicId={selectedTopic ? selectedTopic.id : null}
            navigate={navigate}
          />
        </aside>
        <NodeDetails
          key={`${kind}:${node.id}`}
          kind={kind}
          node={node}
          descendantCount={selectedTopic ? countDescendants(topics, selectedTopic.id) : topics.length}
          subjectId={subjectId}
          topicId={selectedTopic ? selectedTopic.id : null}
          navigate={navigate}
          onRename={(name) => saveSelected({ name })}
          onSaveNotes={saveSelected}
          onDirtyChange={setNotesDirty}
          onAddTopic={handleAddTopic}
          onDelete={handleDelete}
          suggestionScope={{
            subjectId,
            topicId: selectedTopic ? selectedTopic.id : null,
            hasSubtopics: selectedTopic ? countDescendants(topics, selectedTopic.id) > 0 : false,
          }}
          onOpenProfile={() => navigate("/profile")}
          onGenerateQuiz={() => {
            const params = new URLSearchParams({ subjectId });
            if (selectedTopic) params.set("topicId", selectedTopic.id);
            navigate(`/quizzes/new?${params.toString()}`);
          }}
        />
      </div>
    </div>
  );
}
