import { useEffect, useRef, type PropsWithChildren } from "react";

import { getMe, refresh } from "../api/auth";
import { useAuthStore } from "../stores/auth.store";

export default function AuthProvider({ children }: PropsWithChildren) {
  const initializedRef = useRef(false);

  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const finishInitialization = useAuthStore(
    (state) => state.finishInitialization,
  );

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const initializeAuth = async () => {
      try {
        const { accessToken } = await refresh();
        const user = await getMe();

        setSession(user, accessToken);
      } catch {
        clearSession();
      } finally {
        finishInitialization();
      }
    };

    void initializeAuth();
  }, [clearSession, finishInitialization, setSession]);

  return children;
}
