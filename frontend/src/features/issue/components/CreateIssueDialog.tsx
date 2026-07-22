import { useState } from "react";

import { Alert, Dialog, DialogContent, DialogTitle } from "@mui/material";

import { getApiError } from "../../../utils/getApiError";

import type { ProjectMember } from "../../project/types/project.types";
import type { IssueFormValues } from "../schemas/issue.schema";

import { useCreateIssue } from "../hooks/useCreateIssue";
import { toIsoDateOrUndefined } from "../utils/issueDate";

import IssueForm from "./IssueForm";

type CreateIssueDialogProps = {
  projectId: number;
  members: ProjectMember[];
  open: boolean;
  onClose: () => void;
};

export default function CreateIssueDialog({
  projectId,
  members,
  open,
  onClose,
}: CreateIssueDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateIssue();

  const handleSubmit = async (values: IssueFormValues) => {
    setErrorMessage(null);

    try {
      await createMutation.mutateAsync({
        projectId,
        request: {
          title: values.title,
          description: values.description || undefined,
          priorityId: values.priorityId,
          assigneeId: values.assigneeId,
          dueDate: toIsoDateOrUndefined(values.dueDate),
        },
      });

      onClose();
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  const handleClose = () => {
    if (createMutation.isPending) {
      return;
    }

    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Issueを作成</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <IssueForm
          members={members}
          submitLabel="作成"
          isPending={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
