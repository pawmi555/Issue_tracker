import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import { useForm } from "react-hook-form";

import { getApiError } from "../../../utils/getApiError";

import { useUpdateComment } from "../hooks/useUpdateComment";

import {
  commentSchema,
  type CommentFormValues,
} from "../schemas/comment.schema";

import type { Comment } from "../types/comment.types";

type EditCommentDialogProps = {
  comment: Comment | null;
  issueId: number;
  open: boolean;
  onClose: () => void;
};

export default function EditCommentDialog({
  comment,
  issueId,
  open,
  onClose,
}: EditCommentDialogProps) {
  const updateMutation = useUpdateComment({
    issueId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (!comment) {
      return;
    }

    reset({
      content: comment.content,
    });
  }, [comment, reset]);

  const onSubmit = async (values: CommentFormValues) => {
    if (!comment) {
      return;
    }

    await updateMutation.mutateAsync({
      commentId: comment.id,
      request: {
        content: values.content,
      },
    });

    onClose();
  };

  const apiError = updateMutation.isError
    ? getApiError(updateMutation.error)
    : null;

  return (
    <Dialog
      open={open}
      onClose={updateMutation.isPending ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>コメントを編集</DialogTitle>

      <DialogContent>
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError.message}
          </Alert>
        )}

        <TextField
          label="コメント"
          fullWidth
          multiline
          minRows={4}
          disabled={updateMutation.isPending}
          error={Boolean(errors.content)}
          helperText={errors.content?.message}
          sx={{ mt: 1 }}
          slotProps={{
            htmlInput: {
              maxLength: 1000,
            },
          }}
          {...register("content")}
        />
      </DialogContent>

      <DialogActions>
        <Button
          type="button"
          onClick={onClose}
          disabled={updateMutation.isPending}
        >
          キャンセル
        </Button>

        <Button
          type="button"
          variant="contained"
          disabled={isSubmitting || updateMutation.isPending}
          onClick={() => {
            void handleSubmit(onSubmit)();
          }}
        >
          {updateMutation.isPending ? "更新中..." : "更新"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
