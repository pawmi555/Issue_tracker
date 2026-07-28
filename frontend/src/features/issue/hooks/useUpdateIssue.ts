import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateIssue } from "../../../api/issue";

import { issueKeys } from "../queryKeys/issueKeys";

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIssue,

    onSuccess: async (issue) => {
      await Promise.all([
        /**
         * 更新APIのレスポンスにはproject・assignee・reporterなどが
         * 含まれないため、詳細APIを再取得する。
         */
        queryClient.invalidateQueries({
          queryKey: issueKeys.detail(issue.id),
        }),

        /**
         * 一覧にもタイトル・担当者・期限などの変更を反映する。
         */
        queryClient.invalidateQueries({
          queryKey: issueKeys.lists(),
        }),
      ]);
    },
  });
};
