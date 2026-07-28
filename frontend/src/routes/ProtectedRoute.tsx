import { Navigate, Outlet, useLocation } from "react-router";

import FullScreenLoading from "../components/common/FullScreenLoading";
import { useAuthStore } from "../stores/auth.store";

export default function ProtectedRoute() {
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <FullScreenLoading />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <Outlet />;
}
