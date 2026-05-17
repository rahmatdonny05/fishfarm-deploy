import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as XLSX from "xlsx";

export const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
export const fmt = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
export const fmtNum = (n) => Math.round(n).toLocaleString("id-ID");
export const today = () => new Date().toISOString().split("T")[0];

export const useStore = create(
  persist(
    (set, get) => ({
      kolam: [], tebar: [], investasi: [], cashflow: [], panen: [],

      tambahKolam: (k) => set((s) => ({ kolam: [...s.kolam, { ...k, id: uid() }] })),
      hapusKolam: (id) => set((s) => ({ kolam: s.kolam.filter((x) => x.id !== id) })),

      tebarBenih: (entry) => {
        const kolam = get().kolam.find((k) => k.id === entry.kolamId);
        const ep = new Date(entry.tanggal);
        ep.setMonth(ep.getMonth() + (entry.siklus || 3));
        const newTebar = { ...entry, id: uid(), kolamNama: kolam?.nama || "", estPanen: ep.toISOString().split("T")[0] };
        const biaya = entry.jumlah * entry.harga;
        set((s) => ({
          tebar: [...s.tebar, newTebar],
          kolam: s.kolam.map((k) => k.id === entry.kolamId ? { ...k, status: "aktif" } : k),
          cashflow: biaya > 0 ? [...s.cashflow, { id: uid(), tanggal: entry.tanggal, tipe: "pengeluaran", kategori: "Benih", kolamId: entry.kolamId, deskripsi: `Benih ${kolam?.nama} ${fmtNum(entry.jumlah)} ekor`, jumlah: biaya }] : s.cashflow,
        }));
      },

      tambahInvestasi: (inv) => set((s) => ({ investasi: [...s.investasi, { ...inv, id: uid() }] })),
      hapusInvestasi: (id) => set((s) => ({ investasi: s.investasi.filter((x) => x.id !== id) })),

      tambahCashflow: (tx) => set((s) => ({ cashflow: [...s.cashflow, { ...tx, id: uid() }] })),
      hapusCashflow: (id) => set((s) => ({ cashflow: s.cashflow.filter((x) => x.id !== id) })),

      tambahPanen: (panen) => {
        const kolam = get().kolam.find((k) => k.id === panen.kolamId);
        const total = panen.berat * panen.harga;
        const np = { ...panen, id: uid(), kolamNama: kolam?.nama || "", total };
        set((s) => ({
          panen: [...s.panen, np],
          cashflow: [...s.cashflow, { id: uid(), tanggal: panen.tanggal, tipe: "pemasukan", kategori: "Penjualan Ikan", kolamId: panen.kolamId, deskripsi: `Panen ${kolam?.nama || ""} ${panen.berat}kg`, jumlah: total }],
        }));
      },
      hapusPanen: (id) => set((s) => ({ panen: s.panen.filter((x) => x.id !== id) })),

      downloadExcel: () => {
        const { investasi, kolam, tebar, panen, cashflow } = get();
        const now = new Date();
        const bln = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const wb = XLSX.utils.book_new();

        // Style helper
        const makeSheet = (data) => XLSX.utils.aoa_to_sheet(data);

        // Sheet 1: Summary
        const allMsk = cashflow.filter((x) => x.tipe === "pemasukan").reduce((s, x) => s + x.jumlah, 0);
        const allKlr = cashflow.filter((x) => x.tipe === "pengeluaran").reduce((s, x) => s + x.jumlah, 0);
        const allBrt = panen.reduce((s, x) => s + x.berat, 0);
        const allPend = panen.reduce((s, x) => s + x.total, 0);
        const inv = investasi.reduce((s, x) => s + x.jumlah, 0);
        const hpp = allBrt > 0 ? Math.round(allKlr / allBrt) : 0;
        const roi = inv > 0 ? (((allPend - allKlr) / inv) * 100).toFixed(1) : 0;
        const byKat = {};
        cashflow.filter((x) => x.tipe === "pengeluaran").forEach((x) => { byKat[x.kategori] = (byKat[x.kategori] || 0) + x.jumlah; });

        XLSX.utils.book_append_sheet(wb, makeSheet([
          ["LAPORAN KEUANGAN BUDIDAYA IKAN"],
          [`Dicetak: ${now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`],
          [],
          ["RINGKASAN KEUANGAN"],
          ["Keterangan", "Nilai"],
          ["Total Investasi Awal", inv],
          ["Total Pemasukan", allMsk],
          ["Total Pengeluaran Operasional", allKlr],
          ["Laba Bersih", allMsk - allKlr],
          ["Total Berat Panen", `${fmtNum(allBrt)} kg`],
          ["HPP (Harga Pokok Produksi)", `Rp ${fmtNum(hpp)}/kg`],
          ["ROI", `${roi}%`],
          [],
          ["RINCIAN PENGELUARAN PER KATEGORI"],
          ["Kategori", "Jumlah (Rp)", "Persentase"],
          ...Object.entries(byKat).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v, allKlr > 0 ? `${((v / allKlr) * 100).toFixed(1)}%` : "0%"]),
        ]), "Summary & HPP");

        // Sheet 2: Investasi
        XLSX.utils.book_append_sheet(wb, makeSheet([
          ["INVESTASI AWAL"],
          [],
          ["Tanggal", "Kategori", "Deskripsi", "Jumlah (Rp)"],
          ...investasi.map((x) => [x.tanggal, x.kategori, x.deskripsi || "-", x.jumlah]),
          [],
          ["", "", "TOTAL", inv],
        ]), "Investasi Awal");

        // Sheet 3: Kolam
        XLSX.utils.book_append_sheet(wb, makeSheet([
          ["DATA KOLAM & TEBAR BENIH"],
          [],
          ["Nama Kolam", "Jenis Ikan", "Ukuran (m²)", "Status", "Tgl Tebar Terakhir", "Jumlah Benih", "Siklus (bln)", "Est. Panen", "Target (kg)"],
          ...kolam.map((k) => {
            const tb = [...tebar].filter((t) => t.kolamId === k.id).sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0];
            return [k.nama, k.jenis || "-", k.ukuran || 0, k.status, tb ? tb.tanggal : "-", tb ? tb.jumlah : 0, tb ? tb.siklus : 0, tb ? tb.estPanen : "-", tb ? tb.target : 0];
          }),
        ]), "Data Kolam");

        // Sheet 4: Cashflow
        XLSX.utils.book_append_sheet(wb, makeSheet([
          ["LAPORAN CASHFLOW"],
          [],
          ["Tanggal", "Tipe", "Kategori", "Kolam", "Deskripsi", "Pemasukan (Rp)", "Pengeluaran (Rp)"],
          ...[...cashflow].sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((x) => {
            const k = kolam.find((k) => k.id === x.kolamId);
            return [x.tanggal, x.tipe, x.kategori, k ? k.nama : "-", x.deskripsi || "-", x.tipe === "pemasukan" ? x.jumlah : "", x.tipe === "pengeluaran" ? x.jumlah : ""];
          }),
          [],
          ["", "", "", "", "TOTAL", allMsk, allKlr],
          ["", "", "", "", "SALDO BERSIH", allMsk - allKlr, ""],
        ]), "Cashflow");

        // Sheet 5: Panen
        XLSX.utils.book_append_sheet(wb, makeSheet([
          ["RIWAYAT PANEN"],
          [],
          ["Tanggal", "Kolam", "Berat (kg)", "Jumlah Ekor", "Harga/kg (Rp)", "Total (Rp)", "Pembeli"],
          ...[...panen].sort((a, b) => a.tanggal.localeCompare(b.tanggal)).map((x) => [x.tanggal, x.kolamNama || "-", x.berat, x.ekor, x.harga, x.total, x.pembeli || "-"]),
          [],
          ["", "TOTAL", allBrt, "", "", allPend, ""],
          ["", "HPP", `${fmtNum(hpp)} Rp/kg`, "", "", "", ""],
        ]), "Riwayat Panen");

        // Sheet 6: Laporan per bulan
        const bulanSet = [...new Set(cashflow.map((x) => x.tanggal.substr(0, 7)))].sort();
        const bulanRows = [
          ["LAPORAN PER BULAN"],
          [],
          ["Bulan", "Pemasukan (Rp)", "Pengeluaran (Rp)", "Laba Bersih (Rp)", "Berat Panen (kg)", "HPP/kg (Rp)", "Margin (%)"],
          ...bulanSet.map((b) => {
            const txB = cashflow.filter((x) => x.tanggal.startsWith(b));
            const msk = txB.filter((x) => x.tipe === "pemasukan").reduce((s, x) => s + x.jumlah, 0);
            const klr = txB.filter((x) => x.tipe === "pengeluaran").reduce((s, x) => s + x.jumlah, 0);
            const laba = msk - klr;
            const brt = panen.filter((x) => x.tanggal.startsWith(b)).reduce((s, x) => s + x.berat, 0);
            const hppB = brt > 0 ? Math.round(klr / brt) : 0;
            const margin = msk > 0 ? ((laba / msk) * 100).toFixed(1) : 0;
            return [b, msk, klr, laba, brt, hppB || "-", `${margin}%`];
          }),
        ];
        XLSX.utils.book_append_sheet(wb, makeSheet(bulanRows), "Laporan Per Bulan");

        XLSX.writeFile(wb, `laporan-budidaya-ikan-${bln}.xlsx`);
      },
    }),
    { name: "fishfarm-v2" }
  )
);
