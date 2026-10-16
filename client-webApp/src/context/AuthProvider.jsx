import { useCallback, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, setToken } from "../services/apiClient.js";
import { getMe } from "../services/userService.js";
import { AuthContext } from "./authContext.js";

// onSignedIn / onSignedOut let the app navigate after a session change.
export default function AuthProvider({ onSignedIn, onSignedOut, children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(() => !getToken());

  useEffect(() => {
    if (authChecked) {
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        // Invalid or expired token: drop it and fall back to the login screen.
        clearToken();
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, [authChecked]);

  const signIn = useCallback(
    (result) => {
      setToken(result.token);
      setUser(result.user);
      setAuthChecked(true);
      onSignedIn?.();
    },
    [onSignedIn],
  );

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    onSignedOut?.();
  }, [onSignedOut]);

  const value = useMemo(
    () => ({ user, authChecked, signIn, signOut, updateUser: setUser }),
    [user, authChecked, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
