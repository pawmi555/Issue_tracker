import { useState } from "react";

import { Alert, Dialog, DialogContent, DialogTitle } from "@mui/material";

import { getApiError } from "../../../utils/getApiError";

import type { ProjectFormValues } from "../schemas/project.schema";

import { useCreateProject } from "../hooks/useCreateProject";
import ProjectForm from "./ProjectForm";

type CreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateProjectDialog({
  open,
  onClose,
}: CreateProjectDialogProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useCreateProject();

  const handleSubmit = async (values: ProjectFormValues) => {
    setErrorMessage(null);

    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description || undefined,
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
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Projectを作成</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <ProjectForm
          submitLabel="作成"
          isPending={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}
