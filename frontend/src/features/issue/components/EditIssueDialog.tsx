import { useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

import { useForm, type SubmitHandler } from "react-hook-form";

import { getApiError } from "../../../utils/getApiError";

import type { ProjectMember } from "../../project/types/project.types";
import type { Issue } from "../types/issue.types";

import { ISSUE_PRIORITIES } from "../constants/issue.constants";
import { useUpdateIssue } from "../hooks/useUpdateIssue";
import { getNextIssueStatus } from "../utils/issueStatus";
import { toDateTimeLocalValue, toIsoDateOrUndefined } from "../utils/issueDate";

type EditIssueFormValues = {
  title: string;
  description: string;
  priorityId: number;
  assigneeId: number | "";
  dueDate: string;
};

type EditIssueDialogProps = {
  issue: Issue;
  members: ProjectMember[];
  open: boolean;
  onClose: () => void;
};

export default function EditIssueDialog({
  issue,
  members,
  open,
  onClose,
}: EditIssueDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateIssue();

  const nextStatus = getNextIssueStatus(issue.status.name);

  const { register, handleSubmit } = useForm<EditIssueFormValues>({
    defaultValues: {
      title: issue.title,
      description: issue.description ?? "",
      priorityId: issue.priority.id,
      assigneeId: issue.assignee?.id ?? "",
      dueDate: toDateTimeLocalValue(issue.dueDate),
    },
  });

  const onSubmit: SubmitHandler<EditIssueFormValues> = async (values) => {
    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync({
        issueId: issue.id,
        request: {
          title: values.title,
          description: values.description || null,
          priorityId: Number(values.priorityId),
          assigneeId:
            values.assigneeId === "" ? null : Number(values.assigneeId),
          dueDate: toIsoDateOrUndefined(values.dueDate) ?? null,
        },
      });

      onClose();
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  const handleStatusUpdate = async () => {
    if (!nextStatus) {
      return;
    }

    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync({
        issueId: issue.id,
        request: {
          statusId: nextStatus.id,
        },
      });

      onClose();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError.code === "ISSUE_INVALID_TRANSITION") {
        setErrorMessage("許可されていない状態遷移です。");
        return;
      }

      if (apiError.code === "ISSUE_CLOSED") {
        setErrorMessage("CLOSEDのIssueは更新できません。");
        return;
      }

      setErrorMessage(apiError.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Issueを編集</DialogTitle>

      <DialogContent>
        <Stack
          component="form"
          id="edit-issue-form"
          spacing={3}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="タイトル"
            required
            {...register("title", {
              required: "タイトルを入力してください",
              maxLength: {
                value: 255,
                message: "タイトルは255文字以内で入力してください",
              },
            })}
          />

          <TextField
            label="説明"
            multiline
            minRows={5}
            {...register("description")}
          />

          <TextField
            label="優先度"
            select
            {...register("priorityId", {
              valueAsNumber: true,
            })}
          >
            {ISSUE_PRIORITIES.map((priority) => (
              <MenuItem key={priority.id} value={priority.id}>
                {priority.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="担当者"
            select
            defaultValue={issue.assignee?.id ?? ""}
            {...register("assigneeId")}
          >
            <MenuItem value="">未割り当て</MenuItem>

            {members.map((member) => (
              <MenuItem key={member.user.id} value={member.user.id}>
                {member.user.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="期限"
            type="datetime-local"
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            {...register("dueDate")}
          />

          {nextStatus && (
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                void handleStatusUpdate();
              }}
              disabled={updateMutation.isPending}
            >
              ステータスを 「{nextStatus.label}」へ進める
            </Button>
          )}

          {!nextStatus && (
            <Alert severity="info">
              CLOSEDのため、次のステータスはありません。
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={updateMutation.isPending}>
          キャンセル
        </Button>

        <Button
          type="submit"
          form="edit-issue-form"
          variant="contained"
          disabled={updateMutation.isPending || issue.status.name === "CLOSED"}
        >
          更新
        </Button>
      </DialogActions>
    </Dialog>
  );
}
