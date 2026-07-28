import { useState } from "react";

import { Alert, Dialog, DialogContent, DialogTitle } from "@mui/material";

import { getApiError } from "../../../utils/getApiError";

import type { Project } from "../types/project.types";
import type { ProjectFormValues } from "../schemas/project.schema";

import { useUpdateProject } from "../hooks/useUpdateProject";
import ProjectForm from "./ProjectForm";

type EditProjectDialogProps = {
  project: Project;
  open: boolean;
  onClose: () => void;
};

export default function EditProjectDialog({
  project,
  open,
  onClose,
}: EditProjectDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateMutation = useUpdateProject();

  const handleSubmit = async (values: ProjectFormValues) => {
    setErrorMessage(null);

    try {
      await updateMutation.mutateAsync({
        projectId: project.id,
        request: {
          name: values.name,
          description: values.description,
        },
      });

      onClose();
    } catch (error) {
      setErrorMessage(getApiError(error).message);
    }
  };

  const handleClose = () => {
    if (updateMutation.isPending) {
      return;
    }

    setErrorMessage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Projectを編集</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <ProjectForm
          defaultValues={{
            name: project.name,
            description: project.description ?? "",
          }}
          submitLabel="更新"
          isPending={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
