import path from "node:path";
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
};
const ALLOWED = "Markdown (.md), text (.txt), or PDF (.pdf)";

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
