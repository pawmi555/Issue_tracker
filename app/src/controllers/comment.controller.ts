import { Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import {
  createCommentsService,
  getCommentsService,
  updateCommentService,
  deleteCommentService,
} from "../services/comment.service.js";
import {
  createCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from "../validators/comment.validators.js";

export const createComment = async (req: AuthRequest, res: Response) => {
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

export const getComments = async (req: AuthRequest, res: Response) => {
  const issueId = Number(req.params.id);
  const query = getCommentsSchema.parse(req.query);

  const result = await getCommentsService({
    issueId,
    userId: req.user!.id,
    query,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  const commentId = Number(req.params.id);

  const data = updateCommentSchema.parse(req.body);

  const comment = await updateCommentService({
    commentId,
    userId: req.user!.id,
    data,
  });

  res.status(200).json({
    success: true,
    data: comment,
  });
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const commentId = Number(req.params.id);

  await deleteCommentService({
    commentId,
    userId: req.user!.id,
  });

  res.sendStatus(204);
};
