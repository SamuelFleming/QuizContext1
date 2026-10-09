import { useCallback } from "react";
import AuthProvider from "../context/AuthProvider.jsx";
import AppRoutes from "./AppRoutes.jsx";
import { useNavigation } from "./useNavigation.js";

export default function App() {
  const { path, navigate } = useNavigation();
  const goHome = useCallback(() => navigate("/"), [navigate]);
  const goToLogin = useCallback(() => navigate("/login"), [navigate]);

  return (
    <AuthProvider onSignedIn={goHome} onSignedOut={goToLogin}>
      <AppRoutes path={path} navigate={navigate} />
    </AuthProvider>
  );
}
