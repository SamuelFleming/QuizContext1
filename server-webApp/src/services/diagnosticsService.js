import { fetchDatabaseDiagnostic } from "./dataApi/diagnostics.js";

export async function getConnectivity() {
  const downstream = await fetchDatabaseDiagnostic();
  return { webApp: "ok", ...downstream };
}
