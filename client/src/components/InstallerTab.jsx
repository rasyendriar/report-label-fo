import { useState } from "react";
import { Plus } from "lucide-react";
import { FieldLabel, SelectField, NumberField, TextField, ReportTable, ProgressBar, numberFmt } from "./ui.jsx";

export default function InstallerTab({ reports, totals, target, regions, weekOptions, regionOptions, onAdd, onDelete, saving }) {
  const [week, setWeek] = useState("");
  const [region, setRegion] = useState("");
  const [tiang, setTiang] = useState("");
  const [pelapor, setPelapor] = useState("");
  const [catatan, setCatatan] = useState("");
  const [formError, setFormError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!week || !region) {
      setFormError("Pilih minggu dan region terlebih dahulu.");
      return;
    }
    if (tiang === "") {
      setFormError("Isi jumlah tiang yang sudah diinstalasi.");
      return;
    }
    setFormError("");
    onAdd({
      week,
      region,
      tiang: Number(tiang),
      pelapor: pelapor || "-",
      catatan,
    });
    setWeek("");
    setRegion("");
    setTiang("");
    setPelapor("");
    setCatatan("");
  }

  const columns = [
    { key: "week", label: "Minggu" },
    { key: "region", label: "Region" },
    { key: "tiang", label: "Tiang Terinstal", render: (r) => numberFmt(r.tiang) },
    { key: "pelapor", label: "Pelapor" },
    { key: "catatan", label: "Catatan" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-blue-900" />
          Input Laporan Instalasi Tiang
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
            <FieldLabel>Jumlah Tiang Terinstal (titik)</FieldLabel>
            <NumberField value={tiang} onChange={setTiang} placeholder="0" />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel>Catatan</FieldLabel>
            <TextField value={catatan} onChange={setCatatan} placeholder="Opsional, mis. kendala di lapangan" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
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
            <ProgressBar actual={totals[r]?.tiang || 0} target={target[r] || 0} />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 -mt-3">
        Target instalasi per region diasumsikan sama dengan target produksi label (1 label = 1 titik tiang).
      </p>

      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Riwayat Laporan Installer</h2>
        <ReportTable rows={reports} columns={columns} onDelete={onDelete} />
      </div>
    </div>
  );
}
