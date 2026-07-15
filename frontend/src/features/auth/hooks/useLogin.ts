import { useMutation } from "@tanstack/react-query";

import { login } from "../../../api/auth";
import { useAuthStore } from "../../../stores/auth.store";

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,

    onSuccess: ({ user, accessToken }) => {
      setSession(user, accessToken);
    },
  });
};
