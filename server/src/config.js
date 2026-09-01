export const REGIONS = ["JABODETABEK", "JAWA BARAT", "JAWA TENGAH", "JAWA TIMUR"];

export const WEEKS = [
  { id: "W1", range: "31 Agu–6 Sep" },
  { id: "W2", range: "7–13 Sep" },
  { id: "W3", range: "14–20 Sep" },
  { id: "W4", range: "21–27 Sep" },
  { id: "W5", range: "28 Sep–4 Okt" },
  { id: "W6", range: "5–11 Okt" },
  { id: "W7", range: "12–18 Okt" },
  { id: "W8", range: "19–25 Okt" },
  { id: "W9", range: "26 Okt–1 Nov" },
  { id: "W10", range: "2–8 Nov" },
  { id: "W11", range: "9–15 Nov" },
  { id: "W12", range: "16–22 Nov" },
  { id: "W13", range: "23–29 Nov" },
  { id: "W14", range: "30 Nov–6 Des" },
];

// Target produksi label per region (dari rencana timeline ideal 2026)
export const PRODUKSI_TARGET = {
  JABODETABEK: 6461,
  "JAWA BARAT": 12150,
  "JAWA TENGAH": 15387,
  "JAWA TIMUR": 7902,
};

// Asumsi: 1 label = 1 titik tiang, jadi target instalasi memakai angka yang sama
export const INSTALASI_TARGET = { ...PRODUKSI_TARGET };
