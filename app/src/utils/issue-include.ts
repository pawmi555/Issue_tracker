const ALLOWED_INCLUDES = ["assignee", "reporter", "comments"] as const;

export const buildIssueInclude = (includes: string[]) => {
  const prismaInclude: Record<string, boolean> = {};

  for (const include of includes) {
    if (ALLOWED_INCLUDES.includes(include as any)) {
      prismaInclude[include] = true;
    }
  }

  return prismaInclude;
};
