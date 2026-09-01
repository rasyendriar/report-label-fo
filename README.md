# Dashboard Pelaporan Label Tiang FO

Web-app untuk reporting dan dashboard progres **fabrikasi label tiang** dan **instalasi label tiang FO**, per region dan per minggu (W1–W14, tahun 2026).

## Fitur

- **Tab Fabrikan** — input laporan mingguan jumlah produksi & pengiriman label per region, dengan progress bar terhadap target.
- **Tab Installer** — input laporan mingguan jumlah tiang yang sudah terpasang label per region, dengan progress bar terhadap target.
- **Tab Ringkasan** — dashboard agregat: total produksi/pengiriman/instalasi, grafik target vs realisasi per region, dan rekap tabel per region.
- Data laporan disimpan di server (SQLite) sehingga bisa diakses dan dilihat bersama oleh semua pengguna.

## Struktur Proyek

```
report-label-fo/
├── server/     # Express API + SQLite storage
└── client/     # React + Vite + Tailwind CSS frontend
```

## Menjalankan Secara Lokal

Prasyarat: Node.js 18+ dan npm.

```bash
# instal dependency untuk server & client
npm run install:all

# jalankan server (port 4000) dan client (port 5173) sekaligus
npm run dev
```

Buka `http://localhost:5173` di browser. Request `/api/*` dari client di-proxy ke server pada port 4000.

## Build untuk Produksi

```bash
npm run install:all
npm run build   # build client ke client/dist
npm start        # jalankan server, yang juga menyajikan client/dist
```

Server akan berjalan di `http://localhost:4000` (atau `PORT` env var jika di-set) dan menyajikan API sekaligus file statis hasil build client.

## API

| Method | Endpoint                       | Keterangan                        |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/api/config`                   | Region, minggu, dan target         |
| GET    | `/api/reports/fabrikasi`        | Daftar laporan fabrikasi           |
| POST   | `/api/reports/fabrikasi`        | Tambah laporan fabrikasi           |
| DELETE | `/api/reports/fabrikasi/:id`    | Hapus laporan fabrikasi            |
| GET    | `/api/reports/instalasi`        | Daftar laporan instalasi           |
| POST   | `/api/reports/instalasi`        | Tambah laporan instalasi           |
| DELETE | `/api/reports/instalasi/:id`    | Hapus laporan instalasi            |

Data disimpan pada file SQLite di `server/data/reports.sqlite` (dibuat otomatis saat server pertama kali dijalankan, dan tidak ikut di-commit ke git).

## Mengubah Target & Minggu

Target produksi/instalasi per region dan daftar minggu dikonfigurasi di `server/src/config.js`.
