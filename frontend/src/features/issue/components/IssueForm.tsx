import { zodResolver } from "@hookform/resolvers/zod";

import { Button, MenuItem, Stack, TextField } from "@mui/material";

import { useForm, useWatch } from "react-hook-form";

import { ISSUE_PRIORITIES } from "../constants/issue.constants";

import {
  issueFormSchema,
  type IssueFormInput,
  type IssueFormValues,
} from "../schemas/issue.schema";

import type { ProjectMember } from "../../project/types/project.types";

import { getAssignableProjectMembers } from "../../project/utils/projectPermissions";

type IssueFormProps = {
  members: ProjectMember[];
  defaultValues?: IssueFormInput;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
};

const initialValues: IssueFormInput = {
  title: "",
  description: "",
  priorityId: "",
  assigneeId: "",
  dueDate: "",
};

export default function IssueForm({
  members,
  defaultValues = initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: IssueFormProps) {
  const assignableMembers = getAssignableProjectMembers(members);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormInput, unknown, IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues,
  });

  const title =
    useWatch({
      control,
      name: "title",
    }) ?? "";

  const description =
    useWatch({
      control,
      name: "description",
    }) ?? "";

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <TextField
        label="タイトル"
        required
        fullWidth
        autoFocus
        slotProps={{
          htmlInput: {
            maxLength: 255,
          },
        }}
        error={Boolean(errors.title)}
        helperText={errors.title?.message ?? `${title.length} / 255文字`}
        {...register("title")}
      />

      <TextField
        label="説明"
        fullWidth
        multiline
        minRows={5}
        slotProps={{
          htmlInput: {
            maxLength: 5000,
          },
        }}
        error={Boolean(errors.description)}
        helperText={
          errors.description?.message ?? `${description.length} / 5000文字`
        }
        {...register("description")}
      />

      <TextField
        label="優先度"
        select
        required
        fullWidth
        error={Boolean(errors.priorityId)}
        helperText={errors.priorityId?.message}
        {...register("priorityId")}
      >
        <MenuItem value="">
          <em>選択してください</em>
        </MenuItem>

        {ISSUE_PRIORITIES.map((priority) => (
          <MenuItem key={priority.id} value={priority.id}>
            {priority.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="担当者"
        select
        fullWidth
        error={Boolean(errors.assigneeId)}
        helperText={errors.assigneeId?.message}
        {...register("assigneeId")}
      >
        <MenuItem value="">未割り当て</MenuItem>

        {assignableMembers.map((member) => (
          <MenuItem key={member.user.id} value={member.user.id}>
            {member.user.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="期限"
        type="datetime-local"
        fullWidth
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        error={Boolean(errors.dueDate)}
        helperText={errors.dueDate?.message}
        {...register("dueDate")}
      />

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Button type="button" onClick={onCancel} disabled={isPending}>
          キャンセル
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={isPending || isSubmitting}
        >
          {isPending ? "処理中..." : submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
