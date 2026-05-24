import { z } from "zod";

const sortFields = ["createdAt", "dueDate"] as const;

const orderFields = ["asc", "desc"] as const;

export const createIssueSchema = z.object({
  title: z.string().min(1, "title is required").max(255),

  description: z.string().max(5000).optional(),

  priorityId: z.number().int().positive(),

  statusId: z.number().int().positive(),

  assigneeId: z.number().int().positive().optional(),

  dueDate: z.coerce.date().optional(),
});

export const getIssuesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  statusId: z.coerce.number().int().positive().optional(),

  priorityId: z.coerce.number().int().positive().optional(),

  assigneeId: z.coerce.number().int().positive().optional(),

  keyword: z.string().max(100).optional(),

  sort: z.enum(sortFields).default("createdAt"),

  order: z.enum(orderFields).default("desc"),

  include: z.string().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(255).optional(),

  description: z.string().max(5000).nullable().optional(),

  statusId: z.number().int().positive().optional(),

  priorityId: z.number().int().positive().optional(),

  assigneeId: z.number().int().positive().nullable().optional(),

  dueDate: z.coerce.date().nullable().optional(),
});
