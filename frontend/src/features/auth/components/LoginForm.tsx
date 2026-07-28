import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

import { useLogin } from "../hooks/useLogin";
import { getApiError } from "../../../utils/getApiError";

type LoginFormProps = {
  onSuccess: () => void;
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiErrorMessage(null);

    try {
      await loginMutation.mutateAsync(values);
      onSuccess();
    } catch (error) {
      const apiError = getApiError(error);

      if (apiError.code === "INVALID_CREDENTIALS") {
        setApiErrorMessage("メールアドレスまたはパスワードが正しくありません");
        return;
      }

      setApiErrorMessage(apiError.message);
    }
  };

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {apiErrorMessage && <Alert severity="error">{apiErrorMessage}</Alert>}

      <TextField
        label="メールアドレス"
        type="email"
        autoComplete="email"
        fullWidth
        error={Boolean(errors.email)}
        helperText={errors.email?.message}
        {...register("email")}
      />

      <TextField
        label="パスワード"
        type="password"
        autoComplete="current-password"
        fullWidth
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isSubmitting || loginMutation.isPending}
      >
        {loginMutation.isPending ? "ログイン中..." : "ログイン"}
      </Button>
    </Stack>
  );
}
