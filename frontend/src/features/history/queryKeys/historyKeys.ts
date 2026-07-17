export const historyKeys = {
  all: ["histories"] as const,

  issues: () => [...historyKeys.all, "issues"] as const,

  issue: (issueId: number) => [...historyKeys.issues(), issueId] as const,

  issueList: ({
    issueId,
    page,
    limit,
  }: {
    issueId: number;
    page: number;
    limit: number;
  }) =>
    [
      ...historyKeys.issue(issueId),
      {
        page,
        limit,
      },
    ] as const,
};
