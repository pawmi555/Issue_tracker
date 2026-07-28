import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateComment } from "../../../api/comment";

import type { Comment } from "../types/comment.types";

import { commentKeys } from "../queryKeys/commentKeys";

type UpdateCommentContext = {
  issueId: number;
};

export const useUpdateComment = ({ issueId }: UpdateCommentContext) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComment,

    onSuccess: (updatedComment: Comment) => {
      queryClient.setQueriesData(
        {
          queryKey: commentKeys.issueLists(issueId),
        },
        (
          oldData:
            | {
                success: true;
                data: Comment[];
                meta: {
                  page: number;
                  limit: number;
                  total: number;
                  totalPages: number;
                };
              }
            | undefined,
        ) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            data: oldData.data.map((comment) =>
              comment.id === updatedComment.id ? updatedComment : comment,
            ),
          };
        },
      );
    },
  });
};
