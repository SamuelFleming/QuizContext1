import path from "node:path";
import mammoth from "mammoth";
import { parseOffice } from "officeparser";
import { PDFParse } from "pdf-parse";
import {
  DOCUMENT_CONTENT_MAX,
  DOCUMENT_FILE_NAME_MAX,
  DOCUMENT_TITLE_MAX,
} from "../constants/validation.js";
import { createHttpError } from "../utils/httpError.js";

const TEXT_TYPES = {
  ".md": "text/markdown",
  ".markdown": "text/markdown",
  ".txt": "text/plain",
  ".py": "text/x-python",
};
const ALLOWED = "Markdown (.md), text (.txt), PDF (.pdf), Word (.docx), PowerPoint (.pptx), Python (.py), or Jupyter (.ipynb)";
const WORD_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const NOTEBOOK_MIME = "application/x-ipynb+json";

// Multer decodes multipart file names as latin1; browsers send UTF-8.
function decodeFileName(name) {
  const decoded = Buffer.from(name || "", "latin1").toString("utf8");
  return decoded.slice(0, DOCUMENT_FILE_NAME_MAX);
}

function normalise(text) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function decodeUtf8(buffer) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    throw createHttpError(422, "The file is not valid UTF-8 text");
  }
}

async function extractPdf(buffer) {
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw createHttpError(422, "The file is not a valid PDF");
  }
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText({ pageJoiner: "" });
    return result.text;
  } catch {
    throw createHttpError(422, "This PDF could not be read. It may be damaged or password-protected");
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function extractDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw createHttpError(422, "This Word file could not be read");
  }
}

function blockText(nodes) {
  return (nodes || [])
    .map((node) => {
      if (typeof node?.text === "string" && node.text.trim()) return node.text.trim();
      return blockText(node?.children);
    })
    .filter(Boolean)
    .join("\n");
}

async function extractPptx(buffer) {
  let ast;
  try {
    ast = await parseOffice(buffer, {
      ignoreSlideMasters: true,
      ignoreComments: true,
      ocr: false,
    });
  } catch {
    throw createHttpError(422, "This PowerPoint file could not be read");
  }

  const slides = (ast.content || []).filter((node) => node.type === "slide");
  const blocks = [];
  slides.forEach((slide, index) => {
    const body = blockText(slide.children);
    const notes = (slide.notes || [])
      .map((note) => blockText(note.children) || (typeof note.text === "string" ? note.text.trim() : ""))
      .filter(Boolean);
    if (!body && notes.length === 0) return;
    const lines = [`Slide ${index + 1}`];
    if (body) lines.push(body);
    if (notes.length) lines.push("Notes", notes.join("\n"));
    blocks.push(lines.join("\n"));
  });
  if (!blocks.length) {
    throw createHttpError(
      422,
      "No extractable text was found in these slides. Image-only slides are not supported (no OCR)",
    );
  }
  return blocks.join("\n\n");
}

function cellSource(source) {
  if (Array.isArray(source)) return source.join("");
  return typeof source === "string" ? source : "";
}

function extractNotebook(buffer) {
  const text = decodeUtf8(buffer);
  let notebook;
  try {
    notebook = JSON.parse(text);
  } catch {
    throw createHttpError(422, "This notebook file could not be read");
  }
  if (!notebook || typeof notebook !== "object" || !Array.isArray(notebook.cells)) {
    throw createHttpError(422, "This file is not a Jupyter notebook");
  }

  const blocks = [];
  for (const cell of notebook.cells) {
    const kind = cell?.cell_type;
    if (kind !== "code" && kind !== "markdown") continue;
    const source = normalise(cellSource(cell.source)).trim();
    if (!source) continue;
    blocks.push(`${kind === "code" ? "Code" : "Markdown"}\n${source}`);
  }
  if (!blocks.length) {
    throw createHttpError(422, "No cell source text was found in this notebook");
  }
  return blocks.join("\n\n");
}

// Returns extracted text for the user to review. Nothing is persisted here.
export async function extractDocument(file) {
  if (!file?.buffer) {
    throw createHttpError(400, "Choose a file to upload");
  }
  const originalFileName = decodeFileName(file.originalname);
  const ext = path.extname(originalFileName).toLowerCase();

  let mimeType;
  let raw;
  if (TEXT_TYPES[ext]) {
    mimeType = TEXT_TYPES[ext];
    raw = decodeUtf8(file.buffer);
  } else if (ext === ".pdf") {
    mimeType = "application/pdf";
    raw = await extractPdf(file.buffer);
  } else if (ext === ".docx") {
    mimeType = WORD_MIME;
    raw = await extractDocx(file.buffer);
  } else if (ext === ".pptx") {
    mimeType = PPTX_MIME;
    raw = await extractPptx(file.buffer);
  } else if (ext === ".ipynb") {
    mimeType = NOTEBOOK_MIME;
    raw = extractNotebook(file.buffer);
  } else {
    throw createHttpError(415, `Unsupported file type. Upload ${ALLOWED}`);
  }

  const content = normalise(raw).trim();
  if (!content) {
    throw createHttpError(
      422,
      ext === ".pdf"
        ? "No extractable text was found in this PDF. Scanned or image-only PDFs are not supported (no OCR)"
        : "The file is empty",
    );
  }
  if (content.length > DOCUMENT_CONTENT_MAX) {
    throw createHttpError(
      422,
      `The extracted text is longer than ${DOCUMENT_CONTENT_MAX.toLocaleString("en")} characters. Split the file and upload the parts`,
    );
  }

  const baseName = path.basename(originalFileName, path.extname(originalFileName)).trim();
  return {
    title: (baseName || "Untitled document").slice(0, DOCUMENT_TITLE_MAX),
    content,
    originalFileName,
    mimeType,
    sizeBytes: file.size,
  };
}
