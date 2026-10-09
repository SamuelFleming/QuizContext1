import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

// User Markdown is rendered without raw HTML: tags show as text and unsafe link
// protocols are stripped by react-markdown's default URL transform.
export default function MarkdownPreview({ source, emptyText = "Nothing to preview." }) {
  if (!source?.trim()) {
    return <p className="usage-meta">{emptyText}</p>;
  }
  return (
    <div className="markdown">
      <Markdown remarkPlugins={[remarkGfm]}>{source}</Markdown>
    </div>
  );
}
