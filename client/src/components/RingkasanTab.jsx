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
import { numberFmt } from "./ui.jsx";

export default function RingkasanTab({
  regions,
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
              {regions.map((r) => (
                <tr key={r} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium text-slate-800">{r}</td>
                  <td className="px-3 py-2 text-slate-700">{numberFmt(fabrikanTotals[r]?.produksi || 0)}</td>
                  <td className="px-3 py-2 text-slate-700">{numberFmt(fabrikanTotals[r]?.pengiriman || 0)}</td>
                  <td className="px-3 py-2 text-slate-700">{numberFmt(installerTotals[r]?.tiang || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
