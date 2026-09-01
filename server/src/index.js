import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { fabrikasiRouter, instalasiRouter } from "./routes/reports.js";
import { REGIONS, WEEKS, PRODUKSI_TARGET, INSTALASI_TARGET } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/config", (req, res) => {
  res.json({ regions: REGIONS, weeks: WEEKS, produksiTarget: PRODUKSI_TARGET, instalasiTarget: INSTALASI_TARGET });
});

app.use("/api/reports/fabrikasi", fabrikasiRouter);
app.use("/api/reports/instalasi", instalasiRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Report Label FO server listening on port ${PORT}`);
});
