import { useCallback, useEffect, useState } from "react";
import { confirmLeave } from "../utils/leaveGuard.js";

// Minimal history-based navigation; there is no router library.
export function useNavigation() {
  const [path, setPath] = useState(window.location.pathname);

  const navigate = useCallback((next) => {
    const url = new URL(next, window.location.origin);
    const target = `${url.pathname}${url.search}`;
    if (target !== `${window.location.pathname}${window.location.search}` && !confirmLeave()) return;
    if (target !== `${window.location.pathname}${window.location.search}`) {
      window.history.pushState({}, "", target);
    }
    setPath(url.pathname);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return { path, navigate };
}
