import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, TextField } from "@mui/material";
import { useForm, useWatch } from "react-hook-form";

import {
  projectFormSchema,
  type ProjectFormValues,
} from "../schemas/project.schema";

type ProjectFormProps = {
  defaultValues?: ProjectFormValues;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  onCancel: () => void;
};

const initialValues: ProjectFormValues = {
  name: "",
  description: "",
};

export default function ProjectForm({
  defaultValues = initialValues,
  submitLabel,
  isPending,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const name =
    useWatch({
      control,
      name: "name",
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
        label="プロジェクト名"
        fullWidth
        required
        autoFocus
        error={Boolean(errors.name)}
        helperText={errors.name?.message ?? `${name.length} / 100文字`}
        slotProps={{
          htmlInput: {
            maxLength: 100,
          },
        }}
        {...register("name")}
      />

      <TextField
        label="説明"
        fullWidth
        multiline
        minRows={4}
        error={Boolean(errors.description)}
        helperText={
          errors.description?.message ?? `${description.length} / 1000文字`
        }
        slotProps={{
          htmlInput: {
            maxLength: 1000,
          },
        }}
        {...register("description")}
      />

      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: "flex-end",
        }}
      >
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
