import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().min(1, "title is required").max(255),

  description: z.string().max(5000).optional(),

  priorityId: z.number().int().positive(),

  statusId: z.number().int().positive(),

  assigneeId: z.number().int().positive().optional(),

  dueDate: z.coerce.date().optional(),
});
