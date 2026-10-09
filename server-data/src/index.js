import "dotenv/config";
import { createApp } from "./app.js";

const port = Number(process.env.PORT) || 4001;
const app = createApp();

app.listen(port, () => {
  console.log(`server-data listening on ${port}`);
});
