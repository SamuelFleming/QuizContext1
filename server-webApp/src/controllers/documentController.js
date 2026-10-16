import * as documentService from "../services/documentService.js";
import { sendData } from "../utils/responses.js";

export async function extract(req, res, next) {
  try {
    sendData(res, await documentService.extract(req.file));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    sendData(res, await documentService.createDocument(req.userId, req.body), 201);
  } catch (err) {
    next(err);
  }
}

export async function listForSubject(req, res, next) {
  try {
    sendData(
      res,
      await documentService.listDocuments(req.userId, req.params.subjectId, req.query.topicId),
    );
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    sendData(
      res,
      await documentService.updateDocument(req.userId, req.params.documentId, req.body),
    );
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    sendData(res, await documentService.deleteDocument(req.userId, req.params.documentId));
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    sendData(res, await documentService.getDocument(req.userId, req.params.documentId));
  } catch (err) {
    next(err);
  }
}
