import { useState } from "react";
import { Plus } from "lucide-react";
import { FieldLabel, SelectField, NumberField, TextField, ReportTable, ProgressBar, numberFmt } from "./ui.jsx";

export default function FabrikanTab({ reports, totals, target, regions, weekOptions, regionOptions, onAdd, onDelete, saving }) {
  const [week, setWeek] = useState("");
  const [region, setRegion] = useState("");
  const [produksi, setProduksi] = useState("");
  const [pengiriman, setPengiriman] = useState("");
  const [pelapor, setPelapor] = useState("");
  const [catatan, setCatatan] = useState("");
  const [formError, setFormError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!week || !region) {
      setFormError("Pilih minggu dan region terlebih dahulu.");
      return;
    }
    if (produksi === "" && pengiriman === "") {
      setFormError("Isi minimal jumlah produksi atau pengiriman.");
      return;
    }
    setFormError("");
    onAdd({
      week,
      region,
      produksi: produksi === "" ? 0 : Number(produksi),
      pengiriman: pengiriman === "" ? 0 : Number(pengiriman),
      pelapor: pelapor || "-",
      catatan,
    });
    setWeek("");
    setRegion("");
    setProduksi("");
    setPengiriman("");
    setPelapor("");
    setCatatan("");
  }

  const columns = [
    { key: "week", label: "Minggu" },
    { key: "region", label: "Region" },
    { key: "produksi", label: "Produksi (pcs)", render: (r) => numberFmt(r.produksi) },
    { key: "pengiriman", label: "Pengiriman (pcs)", render: (r) => numberFmt(r.pengiriman) },
    { key: "pelapor", label: "Pelapor" },
    { key: "catatan", label: "Catatan" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-blue-600" />
          Input Laporan Produksi &amp; Pengiriman
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <FieldLabel>Minggu</FieldLabel>
            <SelectField value={week} onChange={setWeek} options={weekOptions} placeholder="Pilih minggu" />
          </div>
          <div>
            <FieldLabel>Region</FieldLabel>
            <SelectField value={region} onChange={setRegion} options={regionOptions} placeholder="Pilih region" />
          </div>
          <div>
            <FieldLabel>Nama Pelapor</FieldLabel>
            <TextField value={pelapor} onChange={setPelapor} placeholder="Opsional" />
          </div>
          <div>
            <FieldLabel>Jumlah Produksi Label (pcs)</FieldLabel>
            <NumberField value={produksi} onChange={setProduksi} placeholder="0" />
          </div>
          <div>
            <FieldLabel>Jumlah Pengiriman Label (pcs)</FieldLabel>
            <NumberField value={pengiriman} onChange={setPengiriman} placeholder="0" />
          </div>
          <div>
            <FieldLabel>Catatan</FieldLabel>
            <TextField value={catatan} onChange={setCatatan} placeholder="Opsional" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Menyimpan..." : "Simpan Laporan"}
            </button>
            {formError && <span className="text-sm text-red-600">{formError}</span>}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {regions.map((r) => (
          <div key={r} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-500 mb-2">{r}</div>
            <ProgressBar actual={totals[r]?.produksi || 0} target={target[r] || 0} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Riwayat Laporan Fabrikan</h2>
        <ReportTable rows={reports} columns={columns} onDelete={onDelete} />
      </div>
    </div>
  );
}
