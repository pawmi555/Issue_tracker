import { Alert, Pagination, Stack } from "@mui/material";

import type { Comment } from "../types/comment.types";

import CommentItem from "./CommentItem";

type CommentListProps = {
  comments: Comment[];
  page: number;
  totalPages: number;
  currentUserId: number;
  canManageComments: boolean;
  isDeleting: boolean;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
};

export default function CommentList({
  comments,
  page,
  totalPages,
  currentUserId,
  canManageComments,
  isDeleting,
  isFetching,
  onPageChange,
  onEdit,
  onDelete,
}: CommentListProps) {
  if (comments.length === 0) {
    return <Alert severity="info">コメントはまだありません。</Alert>;
  }

  return (
    <Stack spacing={2}>
      {comments.map((comment) => {
        const isAuthor = comment.user.id === currentUserId;

        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            canEdit={isAuthor || canManageComments}
            canDelete={isAuthor || canManageComments}
            isDeleting={isDeleting}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page}
          disabled={isFetching}
          onChange={(_, nextPage) => {
            onPageChange(nextPage);
          }}
          sx={{
            alignSelf: "center",
          }}
        />
      )}
    </Stack>
  );
}
