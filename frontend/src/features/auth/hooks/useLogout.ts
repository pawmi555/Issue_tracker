import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import { logout } from "../../../api/auth";
import { useAuthStore } from "../../../stores/auth.store";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: logout,

    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
};
