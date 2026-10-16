import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT) || 4007;
const app = createApp();

connectDatabase(process.env.MONGODB_URI).catch((err) => {
  console.error("server-data could not connect to MongoDB at startup:", err.message);
});

app.listen(port, () => {
  console.log(`server-data listening on ${port}`);
});
