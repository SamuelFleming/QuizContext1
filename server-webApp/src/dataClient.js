export async function fetchDatabaseDiagnostic() {
  const dataApiBaseUrl = process.env.DATA_API_BASE_URL || "http://localhost:4007";
  try {
    const response = await fetch(`${dataApiBaseUrl}/diagnostics/database`, {
      headers: {
        "X-Internal-Api-Key": process.env.INTERNAL_API_KEY || "",
      },
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
