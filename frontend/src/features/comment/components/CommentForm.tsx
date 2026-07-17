import { zodResolver } from "@hookform/resolvers/zod";

import { Alert, Button, Stack, TextField } from "@mui/material";

import { useForm, useWatch } from "react-hook-form";

import { getApiError } from "../../../utils/getApiError";

import { useCreateComment } from "../hooks/useCreateComment";

import {
  commentSchema,
  type CommentFormValues,
} from "../schemas/comment.schema";

type CommentFormProps = {
  issueId: number;
  disabled?: boolean;
};

export default function CommentForm({
  issueId,
  disabled = false,
}: CommentFormProps) {
  const createMutation = useCreateComment();

  const {
    control,
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

  const content =
    useWatch({
      control,
      name: "content",
    }) ?? "";

  const onSubmit = async (values: CommentFormValues) => {
    await createMutation.mutateAsync({
      issueId,
      request: {
        content: values.content,
      },
    });

    reset();
  };

  const apiError = createMutation.isError
    ? getApiError(createMutation.error)
    : null;

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {apiError && <Alert severity="error">{apiError.message}</Alert>}

      <TextField
        label="コメント"
        placeholder="コメントを入力してください"
        fullWidth
        multiline
        minRows={3}
        disabled={disabled || createMutation.isPending}
        error={Boolean(errors.content)}
        helperText={errors.content?.message ?? `${content.length} / 1000文字`}
        {...register("content")}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={disabled || isSubmitting || createMutation.isPending}
        sx={{
          alignSelf: "flex-end",
        }}
      >
        {createMutation.isPending ? "投稿中..." : "コメントを投稿"}
      </Button>
    </Stack>
  );
}
