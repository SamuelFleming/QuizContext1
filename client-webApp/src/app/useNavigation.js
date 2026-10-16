import { useCallback, useEffect, useState } from "react";

// Minimal history-based navigation; there is no router library.
export function useNavigation() {
  const [path, setPath] = useState(window.location.pathname);

  const navigate = useCallback((next) => {
    if (next !== window.location.pathname) {
      window.history.pushState({}, "", next);
    }
    setPath(next);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return { path, navigate };
}
