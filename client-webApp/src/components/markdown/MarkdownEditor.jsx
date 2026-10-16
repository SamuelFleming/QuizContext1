import { useId, useState } from "react";
import MarkdownPreview from "./MarkdownPreview.jsx";

// Textarea with a Write/Preview toggle and a character count against maxLength.
export default function MarkdownEditor({ label, value, onChange, maxLength, rows = 8 }) {
  const id = useId();
  const [mode, setMode] = useState("write");
  const over = maxLength && value.length > maxLength;

  return (
    <div className="md-editor">
      <div className="md-editor-head">
        <label htmlFor={id} className="md-editor-label">
          {label}
        </label>
        <div className="md-tabs" role="group" aria-label={`${label} view`}>
          <button
            type="button"
            className={mode === "write" ? "md-tab active" : "md-tab"}
            aria-pressed={mode === "write"}
            onClick={() => setMode("write")}
          >
            Write
          </button>
          <button
            type="button"
            className={mode === "preview" ? "md-tab active" : "md-tab"}
            aria-pressed={mode === "preview"}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>
      {mode === "write" ? (
        <textarea
          id={id}
          className="md-textarea"
          value={value}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={over || undefined}
        />
      ) : (
        <div className="md-preview">
          <MarkdownPreview source={value} />
        </div>
      )}
      {maxLength ? (
        <p className={over ? "md-count error-text" : "md-count usage-meta"}>
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </p>
      ) : null}
    </div>
  );
}
