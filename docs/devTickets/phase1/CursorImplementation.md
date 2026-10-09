Phase 1 is complete. P1-01, P1-02, and P1-03 all passed, and the three apps are running.

App	URL
Client
http://localhost:5173
Business API
http://localhost:4000
Data API
http://localhost:4001
The connectivity page shows Business API, Data API, and Database as OK. Swagger is at /api/docs on each API.

P1-01. React/Vite plus both Express apps, health checks, { data } / { message } responses, and Swagger. An unknown route returns {"message":"Not found"}.

P1-02. server-data pings MongoDB only with X-Internal-Api-Key. A missing or wrong key returns 401. GET /diagnostics/connectivity on the business API reports all three parts. Stopping the data API marks the data API and database as failed. Pointing the data API at a closed Mongo port marks only the database as failed. The response does not include the key or the connection string.

P1-03. The page calls that business-API route and uses the Light Mint & Indigo colours from client-webApp/src/theme.css. With the data API stopped, the page shows those rows as Failed. The client does not contain the internal key.

Local .env files were created from the examples and are gitignored. .env.example still has replace-me as the key placeholder. Copy that value to the same key in both server .env files before you rely on a fresh checkout.

Nothing was committed. When you have reviewed it, commit and push, then run /plan-phase for Phase 2.

The data API process that stopped was the one shut down on purpose to confirm the connectivity page shows a failure. A replacement is running again and listening on port 4001.