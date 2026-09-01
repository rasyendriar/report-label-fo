import { useState, useEffect, useMemo } from "react";
import {
  Factory,
  HardHat,
  BarChart3,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const REGIONS = ["JABODETABEK", "JAWA BARAT", "JAWA TENGAH", "JAWA TIMUR"];

const WEEKS = [
  { id: "W1", range: "31 Agu\u20136 Sep" },
  { id: "W2", range: "7\u201313 Sep" },
  { id: "W3", range: "14\u201320 Sep" },
  { id: "W4", range: "21\u201327 Sep" },
  { id: "W5", range: "28 Sep\u20134 Okt" },
  { id: "W6", range: "5\u201311 Okt" },
  { id: "W7", range: "12\u201318 Okt" },
  { id: "W8", range: "19\u201325 Okt" },
  { id: "W9", range: "26 Okt\u20131 Nov" },
  { id: "W10", range: "2\u20138 Nov" },
  { id: "W11", range: "9\u201315 Nov" },
  { id: "W12", range: "16\u201322 Nov" },
  { id: "W13", range: "23\u201329 Nov" },
  { id: "W14", range: "30 Nov\u20136 Des" },
];

// Target produksi label per region (dari rencana timeline ideal 2026)
const PRODUKSI_TARGET = {
  JABODETABEK: 6461,
  "JAWA BARAT": 12150,
  "JAWA TENGAH": 15387,
  "JAWA TIMUR": 7902,
};
// Asumsi: 1 label = 1 titik tiang, jadi target instalasi memakai angka yang sama
const INSTALASI_TARGET = PRODUKSI_TARGET;

const numberFmt = (n) => new Intl.NumberFormat("id-ID").format(n || 0);

function StorageBanner() {
  return (
    <p className="text-xs text-slate-500 mt-2">
      Data laporan tersimpan bersama dan dapat dilihat oleh semua pengguna dashboard ini.
    </p>
  );
}

function FieldLabel({ children }) {
  return <label className="block text-sm font-medium text-slate-700 mb-1">{children}</label>;
}

function SelectField({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function NumberField({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );
}

function TextField({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  );
}

function ReportTable({ rows, columns, onDelete }) {
  if (rows.length === 0) {
    return (
      <div className="text-sm text-slate-500 border border-dashed border-slate-300 rounded-lg py-10 text-center">
        Belum ada laporan yang diinput.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-600 text-left">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-2 font-medium whitespace-nowrap">
                {c.label}
              </th>
            ))}
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => onDelete(r.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Hapus laporan"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressBar({ actual, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>{numberFmt(actual)} / {numberFmt(target)} pcs</span>
        <span className="font-medium text-blue-700">{pct}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("fabrikan");
  const [fabrikanReports, setFabrikanReports] = useState([]);
  const [installerReports, setInstallerReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      let f = null;
      let i = null;
      try {
        f = await window.storage.get("fabrikan-reports", true);
      } catch (e) {
        f = null;
      }
      try {
        i = await window.storage.get("installer-reports", true);
      } catch (e) {
        i = null;
      }
      setFabrikanReports(f ? JSON.parse(f.value) : []);
      setInstallerReports(i ? JSON.parse(i.value) : []);
    } catch (e) {
      setError("Gagal memuat data laporan. Coba muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }

  async function saveFabrikan(next) {
    setSaving(true);
    setError(null);
    try {
      const result = await window.storage.set("fabrikan-reports", JSON.stringify(next), true);
      if (!result) throw new Error("save failed");
      setFabrikanReports(next);
      setToast("Laporan fabrikasi tersimpan.");
    } catch (e) {
      setError("Gagal menyimpan laporan fabrikasi. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function saveInstaller(next) {
    setSaving(true);
    setError(null);
    try {
      const result = await window.storage.set("installer-reports", JSON.stringify(next), true);
      if (!result) throw new Error("save failed");
      setInstallerReports(next);
      setToast("Laporan instalasi tersimpan.");
    } catch (e) {
      setError("Gagal menyimpan laporan instalasi. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function addFabrikanReport(entry) {
    const next = [
      { ...entry, id: `f_${Date.now()}`, timestamp: new Date().toISOString() },
      ...fabrikanReports,
    ];
    saveFabrikan(next);
  }
  function deleteFabrikanReport(id) {
    saveFabrikan(fabrikanReports.filter((r) => r.id !== id));
  }
  function addInstallerReport(entry) {
    const next = [
      { ...entry, id: `i_${Date.now()}`, timestamp: new Date().toISOString() },
      ...installerReports,
    ];
    saveInstaller(next);
  }
  function deleteInstallerReport(id) {
    saveInstaller(installerReports.filter((r) => r.id !== id));
  }

  const fabrikanTotals = useMemo(() => {
    const totals = {};
    REGIONS.forEach((r) => (totals[r] = { produksi: 0, pengiriman: 0 }));
    fabrikanReports.forEach((r) => {
      if (!totals[r.region]) return;
      totals[r.region].produksi += Number(r.produksi) || 0;
      totals[r.region].pengiriman += Number(r.pengiriman) || 0;
    });
    return totals;
  }, [fabrikanReports]);

  const installerTotals = useMemo(() => {
    const totals = {};
    REGIONS.forEach((r) => (totals[r] = { tiang: 0 }));
    installerReports.forEach((r) => {
      if (!totals[r.region]) return;
      totals[r.region].tiang += Number(r.tiang) || 0;
    });
    return totals;
  }, [installerReports]);

  const produksiChartData = REGIONS.map((r) => ({
    region: r,
    Target: PRODUKSI_TARGET[r],
    Realisasi: fabrikanTotals[r].produksi,
  }));

  const instalasiChartData = REGIONS.map((r) => ({
    region: r,
    Target: INSTALASI_TARGET[r],
    Realisasi: installerTotals[r].tiang,
  }));

  const totalProduksiTarget = Object.values(PRODUKSI_TARGET).reduce((a, b) => a + b, 0);
  const totalProduksiActual = REGIONS.reduce((a, r) => a + fabrikanTotals[r].produksi, 0);
  const totalPengirimanActual = REGIONS.reduce((a, r) => a + fabrikanTotals[r].pengiriman, 0);
  const totalInstalasiTarget = Object.values(INSTALASI_TARGET).reduce((a, b) => a + b, 0);
  const totalInstalasiActual = REGIONS.reduce((a, r) => a + installerTotals[r].tiang, 0);

  const weekOptions = WEEKS.map((w) => ({ value: w.id, label: `${w.id} (${w.range})` }));
  const regionOptions = REGIONS.map((r) => ({ value: r, label: r }));

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="animate-spin" size={18} />
          Memuat data laporan...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen w-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Pelaporan Mingguan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Instalasi Label QR Code &middot; Tahun 2026 &middot; W1&ndash;W14
          </p>
          <StorageBanner />
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("fabrikan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "fabrikan"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Factory size={16} />
            Fabrikan
          </button>
          <button
            onClick={() => setActiveTab("installer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "installer"
                ? "bg-blue-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HardHat size={16} />
            Installer
          </button>
          <button
            onClick={() => setActiveTab("ringkasan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "ringkasan"
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BarChart3 size={16} />
            Ringkasan
          </button>
        </div>

        {activeTab === "fabrikan" && (
          <FabrikanTab
            reports={fabrikanReports}
            totals={fabrikanTotals}
            weekOptions={weekOptions}
            regionOptions={regionOptions}
            onAdd={addFabrikanReport}
            onDelete={deleteFabrikanReport}
            saving={saving}
          />
        )}

        {activeTab === "installer" && (
          <InstallerTab
            reports={installerReports}
            totals={installerTotals}
            weekOptions={weekOptions}
            regionOptions={regionOptions}
            onAdd={addInstallerReport}
            onDelete={deleteInstallerReport}
            saving={saving}
          />
        )}

        {activeTab === "ringkasan" && (
          <RingkasanTab
            totalProduksiTarget={totalProduksiTarget}
            totalProduksiActual={totalProduksiActual}
            totalPengirimanActual={totalPengirimanActual}
            totalInstalasiTarget={totalInstalasiTarget}
            totalInstalasiActual={totalInstalasiActual}
            produksiChartData={produksiChartData}
            instalasiChartData={instalasiChartData}
            fabrikanTotals={fabrikanTotals}
            installerTotals={installerTotals}
          />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  );
}

function FabrikanTab({ reports, totals, weekOptions, regionOptions, onAdd, onDelete, saving }) {
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
        {REGIONS.map((r) => (
          <div key={r} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-500 mb-2">{r}</div>
            <ProgressBar actual={totals[r].produksi} target={PRODUKSI_TARGET[r]} />
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

function InstallerTab({ reports, totals, weekOptions, regionOptions, onAdd, onDelete, saving }) {
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
        {REGIONS.map((r) => (
          <div key={r} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-500 mb-2">{r}</div>
            <ProgressBar actual={totals[r].tiang} target={INSTALASI_TARGET[r]} />
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

function RingkasanTab({
  totalProduksiTarget,
  totalProduksiActual,
  totalPengirimanActual,
  totalInstalasiTarget,
  totalInstalasiActual,
  produksiChartData,
  instalasiChartData,
  fabrikanTotals,
  installerTotals,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Produksi Label</div>
          <div className="text-2xl font-bold text-slate-900">{numberFmt(totalProduksiActual)}</div>
          <div className="text-xs text-slate-400">dari target {numberFmt(totalProduksiTarget)} pcs</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Pengiriman Label</div>
          <div className="text-2xl font-bold text-slate-900">{numberFmt(totalPengirimanActual)}</div>
          <div className="text-xs text-slate-400">pcs terkirim ke lapangan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Total Tiang Terinstal</div>
          <div className="text-2xl font-bold text-slate-900">{numberFmt(totalInstalasiActual)}</div>
          <div className="text-xs text-slate-400">dari target {numberFmt(totalInstalasiTarget)} titik (asumsi)</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Produksi Label &mdash; Target vs Realisasi</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={produksiChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => numberFmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Target" fill="#BFDBFE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realisasi" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Instalasi Tiang &mdash; Target vs Realisasi</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={instalasiChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="region" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => numberFmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Target" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Realisasi" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Rekap per Region</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-left">
                <th className="px-3 py-2 font-medium">Region</th>
                <th className="px-3 py-2 font-medium">Produksi (pcs)</th>
                <th className="px-3 py-2 font-medium">Pengiriman (pcs)</th>
                <th className="px-3 py-2 font-medium">Tiang Terinstal</th>
              </tr>
            </thead>
            <tbody>
              {REGIONS.map((r) => (
                <tr key={r} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-800">{r}</td>
                  <td className="px-3 py-2 text-slate-700">{numberFmt(fabrikanTotals[r].produksi)}</td>
                  <td className="px-3 py-2 text-slate-700">{numberFmt(fabrikanTotals[r].pengiriman)}</td>
                  <td className="px-3 py-2 text-slate-700">{numberFmt(installerTotals[r].tiang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
