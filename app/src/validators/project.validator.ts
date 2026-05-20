import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "name is required").max(100),
  description: z.string().max(1000).optional(),
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
  role: z.nativeEnum(["OWNER", "MANAGER", "MEMBER", "VIEWER"]),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(["OWNER", "MANAGER", "MEMBER", "VIEWER"]),
});
