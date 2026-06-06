import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import {
  createCommentsService,
  getCommentsService,
} from "../services/comment.service.js";
import {
  createCommentSchema,
  getCommentsSchema,
} from "../validators/comment.validators.js";

export const createCommentController = async (
  req: AuthRequest,
  res: Response,
) => {
  const issueId = Number(req.params.id);
  const data = createCommentSchema.parse(req.body);
  const comment = await createCommentsService({
    issueId,
    userId: req.user!.id,
    content: data.content,
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
};

export const getCommentsController = async (
  req: AuthRequest,
  res: Response,
) => {
  const issueId = Number(req.params.id);
  const query = getCommentsSchema.parse(req.query);

  const comments = await getCommentsService({
    issueId,
    userId: req.user!.id,
    query,
  });

  res.status(200).json({
    success: true,
    ...comments,
  });
};
