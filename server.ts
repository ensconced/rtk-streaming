import express from "express";
import { mobyDick } from "./mobyDick.ts";

const app = express();
const PORT = process.env.PORT || 5174;

app.use(express.json());

const chunks = mobyDick.split(/(?<=\s)/);

app.get("/api/slow-stream", async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  for (const chunk of chunks) {
    res.write(chunk);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  res.end("[END OF STREAM]\n");
});

app.listen(PORT, () => {
  console.log(`Express API listening on http://localhost:${PORT}`);
});
