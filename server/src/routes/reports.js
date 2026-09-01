import { Router } from "express";
import crypto from "node:crypto";
import { db } from "../db.js";
import { REGIONS } from "../config.js";

function buildReportRoutes({ table, prefix, fields }) {
  const router = Router();

  const listStmt = db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`);
  const insertColumns = ["id", "week", "region", ...fields.map((f) => f.key), "created_at"];
  const insertStmt = db.prepare(
    `INSERT INTO ${table} (${insertColumns.join(", ")}) VALUES (${insertColumns
      .map((c) => `@${c}`)
      .join(", ")})`
  );
  const deleteStmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);

  router.get("/", (req, res) => {
    res.json(listStmt.all());
  });

  router.post("/", (req, res) => {
    const body = req.body || {};

    if (!body.week || typeof body.week !== "string") {
      return res.status(400).json({ error: "Field 'week' wajib diisi." });
    }
    if (!body.region || !REGIONS.includes(body.region)) {
      return res.status(400).json({ error: "Field 'region' tidak valid." });
    }

    const row = {
      id: `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      week: body.week,
      region: body.region,
      created_at: new Date().toISOString(),
    };

    for (const f of fields) {
      if (f.type === "number") {
        const n = Number(body[f.key]);
        row[f.key] = Number.isFinite(n) && n >= 0 ? Math.round(n) : 0;
      } else {
        row[f.key] = typeof body[f.key] === "string" ? body[f.key].slice(0, 500) : "";
      }
    }

    insertStmt.run(row);
    res.status(201).json(row);
  });

  router.delete("/:id", (req, res) => {
    const result = deleteStmt.run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Laporan tidak ditemukan." });
    }
    res.status(204).end();
  });

  return router;
}

export const fabrikasiRouter = buildReportRoutes({
  table: "fabrikasi_reports",
  prefix: "f",
  fields: [
    { key: "produksi", type: "number" },
    { key: "pengiriman", type: "number" },
    { key: "pelapor", type: "text" },
    { key: "catatan", type: "text" },
  ],
});

export const instalasiRouter = buildReportRoutes({
  table: "instalasi_reports",
  prefix: "i",
  fields: [
    { key: "tiang", type: "number" },
    { key: "pelapor", type: "text" },
    { key: "catatan", type: "text" },
  ],
});
