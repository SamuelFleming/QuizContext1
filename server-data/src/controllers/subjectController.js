import { toSubject } from "../models/subject.js";
import {
  createSubject,
  deleteSubject,
  findSubject,
  listSubjects,
  subjectContentStats,
  updateSubject,
} from "../repositories/subjectRepository.js";
import { readContentFields } from "../utils/contentFields.js";
import { sendData, sendMessage } from "../utils/responses.js";

const NOT_FOUND = "Subject not found";

async function present(userId, subjects) {
  const stats = await subjectContentStats(userId, subjects);
  return subjects.map((subject) => toSubject(subject, stats.get(subject._id.toString())));
}

export async function list(req, res, next) {
  try {
    const subjects = await listSubjects(req.userId);
    sendData(res, await present(req.userId, subjects));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { error, values } = readContentFields(req.body, { requireName: true });
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    sendData(res, (await present(req.userId, [await createSubject(req.userId, values)]))[0], 201);
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const subject = await findSubject(req.userId, req.params.subjectId);
    if (!subject) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    sendData(res, (await present(req.userId, [subject]))[0]);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { error, values } = readContentFields(req.body, { requireName: false });
    if (error) {
      sendMessage(res, 400, error);
      return;
    }
    const subject = await updateSubject(req.userId, req.params.subjectId, values);
    if (!subject) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    sendData(res, (await present(req.userId, [subject]))[0]);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const subject = await deleteSubject(req.userId, req.params.subjectId);
    if (!subject) {
      sendMessage(res, 404, NOT_FOUND);
      return;
    }
    sendData(res, { id: subject._id.toString() });
  } catch (err) {
    next(err);
  }
}
