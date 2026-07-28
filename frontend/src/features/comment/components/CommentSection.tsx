import { useState } from "react";

import { Alert, Divider, Paper, Stack, Typography } from "@mui/material";

import { getApiError } from "../../../utils/getApiError";

import { useComments } from "../hooks/useComments";
import { useDeleteComment } from "../hooks/useDeleteComment";

import type { Comment } from "../types/comment.types";

import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import EditCommentDialog from "./EditCommentDialog";

type CommentSectionProps = {
  issueId: number;
  currentUserId: number;
  canCreate: boolean;
  canManageComments: boolean;
};

const COMMENT_LIMIT = 20;

export default function CommentSection({
  issueId,
  currentUserId,
  canCreate,
  canManageComments,
}: CommentSectionProps) {
  const [page, setPage] = useState(1);

  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const commentsQuery = useComments({
    issueId,
    page,
    limit: COMMENT_LIMIT,
  });

  const deleteMutation = useDeleteComment();

  const handleDelete = async (comment: Comment) => {
    const confirmed = window.confirm("このコメントを削除しますか？");

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync({
        commentId: comment.id,
        issueId,
      });

      const currentItemCount = commentsQuery.data?.data.length ?? 0;

      if (currentItemCount === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      }
    } catch (error) {
      setDeleteError(getApiError(error).message);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h5" component="h2">
          コメント
        </Typography>

        {canCreate ? (
          <CommentForm issueId={issueId} />
        ) : (
          <Alert severity="info">コメントを投稿する権限がありません。</Alert>
        )}

        <Divider />

        {deleteError && <Alert severity="error">{deleteError}</Alert>}

        {commentsQuery.isPending && (
          <Typography color="text.secondary">
            コメントを読み込んでいます...
          </Typography>
        )}

        {commentsQuery.isFetching && !commentsQuery.isPending && (
          <Typography color="text.secondary" variant="body2">
            コメントを更新中...
          </Typography>
        )}

        {commentsQuery.isError && (
          <Alert severity="error">
            {getApiError(commentsQuery.error).message}
          </Alert>
        )}

        {commentsQuery.data && (
          <CommentList
            comments={commentsQuery.data.data}
            page={commentsQuery.data.meta.page}
            totalPages={commentsQuery.data.meta.totalPages}
            currentUserId={currentUserId}
            canManageComments={canManageComments}
            isDeleting={deleteMutation.isPending}
            isFetching={commentsQuery.isFetching}
            onPageChange={setPage}
            onEdit={setEditingComment}
            onDelete={(comment) => {
              void handleDelete(comment);
            }}
          />
        )}
      </Stack>

      <EditCommentDialog
        comment={editingComment}
        issueId={issueId}
        open={editingComment !== null}
        onClose={() => {
          setEditingComment(null);
        }}
      />
    </Paper>
  );
}
