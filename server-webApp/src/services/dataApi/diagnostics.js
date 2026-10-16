import { dataApiUrl, internalHeaders } from "./client.js";

export async function fetchDatabaseDiagnostic() {
  try {
    const response = await fetch(dataApiUrl("/diagnostics/database"), {
      headers: internalHeaders(),
    });
    if (!response.ok) {
      return { dataApi: "failed", database: "failed" };
    }
    const body = await response.json();
    return {
      dataApi: "ok",
      database: body?.data?.database === "ok" ? "ok" : "failed",
    };
  } catch {
    return { dataApi: "failed", database: "failed" };
  }
}
