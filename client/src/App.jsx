import { useState, useEffect, useMemo, useCallback } from "react";
import { Factory, HardHat, BarChart3, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "./api.js";
import FabrikanTab from "./components/FabrikanTab.jsx";
import InstallerTab from "./components/InstallerTab.jsx";
import RingkasanTab from "./components/RingkasanTab.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("fabrikan");
  const [config, setConfig] = useState(null);
  const [fabrikanReports, setFabrikanReports] = useState([]);
  const [installerReports, setInstallerReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, fabrikan, installer] = await Promise.all([
        api.getConfig(),
        api.listFabrikasi(),
        api.listInstalasi(),
      ]);
      setConfig(cfg);
      setFabrikanReports(fabrikan);
      setInstallerReports(installer);
    } catch (e) {
      setError("Gagal memuat data laporan. Periksa koneksi ke server dan coba muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function addFabrikanReport(entry) {
    setSaving(true);
    setError(null);
    try {
      const created = await api.addFabrikasi(entry);
      setFabrikanReports((prev) => [created, ...prev]);
      setToast("Laporan fabrikasi tersimpan.");
    } catch (e) {
      setError(e.message || "Gagal menyimpan laporan fabrikasi. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFabrikanReport(id) {
    setError(null);
    try {
      await api.deleteFabrikasi(id);
      setFabrikanReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e.message || "Gagal menghapus laporan fabrikasi.");
    }
  }

  async function addInstallerReport(entry) {
    setSaving(true);
    setError(null);
    try {
      const created = await api.addInstalasi(entry);
      setInstallerReports((prev) => [created, ...prev]);
      setToast("Laporan instalasi tersimpan.");
    } catch (e) {
      setError(e.message || "Gagal menyimpan laporan instalasi. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteInstallerReport(id) {
    setError(null);
    try {
      await api.deleteInstalasi(id);
      setInstallerReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e.message || "Gagal menghapus laporan instalasi.");
    }
  }

  const regions = config?.regions || [];
  const produksiTarget = config?.produksiTarget || {};
  const instalasiTarget = config?.instalasiTarget || {};

  const fabrikanTotals = useMemo(() => {
    const totals = {};
    regions.forEach((r) => (totals[r] = { produksi: 0, pengiriman: 0 }));
    fabrikanReports.forEach((r) => {
      if (!totals[r.region]) return;
      totals[r.region].produksi += Number(r.produksi) || 0;
      totals[r.region].pengiriman += Number(r.pengiriman) || 0;
    });
    return totals;
  }, [fabrikanReports, regions]);

  const installerTotals = useMemo(() => {
    const totals = {};
    regions.forEach((r) => (totals[r] = { tiang: 0 }));
    installerReports.forEach((r) => {
      if (!totals[r.region]) return;
      totals[r.region].tiang += Number(r.tiang) || 0;
    });
    return totals;
  }, [installerReports, regions]);

  const produksiChartData = regions.map((r) => ({
    region: r,
    Target: produksiTarget[r] || 0,
    Realisasi: fabrikanTotals[r]?.produksi || 0,
  }));

  const instalasiChartData = regions.map((r) => ({
    region: r,
    Target: instalasiTarget[r] || 0,
    Realisasi: installerTotals[r]?.tiang || 0,
  }));

  const totalProduksiTarget = Object.values(produksiTarget).reduce((a, b) => a + b, 0);
  const totalProduksiActual = regions.reduce((a, r) => a + (fabrikanTotals[r]?.produksi || 0), 0);
  const totalPengirimanActual = regions.reduce((a, r) => a + (fabrikanTotals[r]?.pengiriman || 0), 0);
  const totalInstalasiTarget = Object.values(instalasiTarget).reduce((a, b) => a + b, 0);
  const totalInstalasiActual = regions.reduce((a, r) => a + (installerTotals[r]?.tiang || 0), 0);

  const weekOptions = (config?.weeks || []).map((w) => ({ value: w.id, label: `${w.id} (${w.range})` }));
  const regionOptions = regions.map((r) => ({ value: r, label: r }));

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
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
            Dashboard Pelaporan Label Tiang FO
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fabrikasi &amp; Instalasi Label QR Code &middot; Tahun 2026 &middot; W1&ndash;W14
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Data laporan tersimpan di server dan dapat dilihat oleh semua pengguna dashboard ini.
          </p>
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("fabrikan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "fabrikan" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Factory size={16} />
            Fabrikan
          </button>
          <button
            onClick={() => setActiveTab("installer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "installer" ? "bg-blue-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <HardHat size={16} />
            Installer
          </button>
          <button
            onClick={() => setActiveTab("ringkasan")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "ringkasan" ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"
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
            target={produksiTarget}
            regions={regions}
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
            target={instalasiTarget}
            regions={regions}
            weekOptions={weekOptions}
            regionOptions={regionOptions}
            onAdd={addInstallerReport}
            onDelete={deleteInstallerReport}
            saving={saving}
          />
        )}

        {activeTab === "ringkasan" && (
          <RingkasanTab
            regions={regions}
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
