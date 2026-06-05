import { Request, Response } from "express";
import { AuthRequest } from "../types/auth-request.js";
import { createCommentService } from "../services/comment.service.js";
import { createCommentSchema } from "../validators/comment.validators.js";

export const createCommentController = async (
  req: AuthRequest,
  res: Response,
) => {
  const issueId = Number(req.params.id);

  const data = createCommentSchema.parse(req.body);

  const comment = await createCommentService({
    issueId,
    userId: req.user!.id,
    content: data.content,
  });

  res.status(201).json({
    success: true,
    data: comment,
  });
};
