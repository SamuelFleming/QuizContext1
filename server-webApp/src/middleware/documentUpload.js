import multer from "multer";
import { DOCUMENT_UPLOAD_MAX_BYTES } from "../constants/validation.js";
import { sendMessage } from "../utils/responses.js";

// One file in memory; the bytes are only read for extraction and never stored or logged.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DOCUMENT_UPLOAD_MAX_BYTES, files: 1 },
}).single("file");

export function documentUpload(req, res, next) {
  upload(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      const limitMb = DOCUMENT_UPLOAD_MAX_BYTES / (1024 * 1024);
      sendMessage(res, 413, `The file is larger than the ${limitMb} MB limit`);
      return;
    }
    if (err instanceof multer.MulterError) {
      sendMessage(res, 400, "Upload one file in the `file` field");
      return;
    }
    next(err);
  });
}
