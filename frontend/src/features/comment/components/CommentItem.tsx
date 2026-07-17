import { Button, Paper, Stack, Typography } from "@mui/material";

import { formatDateTime } from "../../../utils/formatDateTime";

import type { Comment } from "../types/comment.types";

type CommentItemProps = {
  comment: Comment;
  canEdit: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onEdit: (comment: Comment) => void;
  onDelete: (comment: Comment) => void;
};

export default function CommentItem({
  comment,
  canEdit,
  canDelete,
  isDeleting,
  onEdit,
  onDelete,
}: CommentItemProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          sx={{
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              {comment.user.name}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
              }}
            >
              {formatDateTime(comment.createdAt)}

              {comment.updatedAt !== comment.createdAt &&
                `（更新: ${formatDateTime(comment.updatedAt)}）`}
            </Typography>
          </div>

          {(canEdit || canDelete) && (
            <Stack direction="row" spacing={1}>
              {canEdit && (
                <Button
                  size="small"
                  onClick={() => {
                    onEdit(comment);
                  }}
                >
                  編集
                </Button>
              )}

              {canDelete && (
                <Button
                  size="small"
                  color="error"
                  disabled={isDeleting}
                  onClick={() => {
                    onDelete(comment);
                  }}
                >
                  削除
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        <Typography
          sx={{
            overflowWrap: "anywhere",
            whiteSpace: "pre-wrap",
          }}
        >
          {comment.content}
        </Typography>
      </Stack>
    </Paper>
  );
}
