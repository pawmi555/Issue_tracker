import { z } from "zod";
import { PROJECT_ROLES } from "../constants/project.constants.js";

export const createProjectSchema = z.object({
  name: z.string().min(1, "name is required").max(100),
  description: z.string().max(1000).optional(),
});

export const getProjectsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const updateProjectBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export const updateProjectSchema = updateProjectBodySchema.refine(
  (data: z.infer<typeof updateProjectBodySchema>) => {
    return data.name !== undefined || data.description !== undefined;
  },
  {
    message: "At least one field is required",
  },
);

export const addMemberSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(PROJECT_ROLES),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(PROJECT_ROLES),
});
