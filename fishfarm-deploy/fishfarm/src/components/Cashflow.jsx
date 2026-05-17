import { useState } from "react";
import { useStore, fmt, today } from "../store";

const KAT_K = ["Pakan","Obat/Vitamin","Listrik/Air","Tenaga Kerja","Benih","Operasional","Lain-lain"];
const KAT_M = ["Penjualan Ikan","Subsidi/Bantuan","Lain-lain"];

export default function Cashflow() {
  const { kolam, cashflow, tambahCashflow, hapusCashflow } = useStore();
  const [form, setForm] = useState({ tanggal:today(), tipe:"pengeluaran", kategori:KAT_K[0], kolamId:"", deskripsi:"", jumlah:"" });
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTipe, setFilterTipe] = useState("");

  const kats = form.tipe === "pengeluaran" ? KAT_K : KAT_M;

  const submit = () => {
    if (!form.tanggal || !form.jumlah) return alert("Tanggal dan jumlah wajib diisi");
    tambahCashflow({ ...form, jumlah:+form.jumlah });
    setForm({ tanggal:today(), tipe:form.tipe, kategori:kats[0], kolamId:"", deskripsi:"", jumlah:"" });
  };

  const allBulan = [...new Set(cashflow.map(x => x.tanggal.substr(0,7)))].sort((a,b) => b.localeCompare(a));
  let txs = cashflow;
  if (filterBulan) txs = txs.filter(x => x.tanggal.startsWith(filterBulan));
  if (filterTipe) txs = txs.filter(x => x.tipe === filterTipe);
  txs = [...txs].sort((a,b) => b.tanggal.localeCompare(a.tanggal));

  const msk = txs.filter(x => x.tipe === "pemasukan").reduce((s,x) => s+x.jumlah, 0);
  const klr = txs.filter(x => x.tipe === "pengeluaran").reduce((s,x) => s+x.jumlah, 0);

  return (
    <div>
      <div className="card">
        <div className="card-title">Tambah Transaksi</div>
        <div className="form-row">
          <div className="form-group"><label>Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal:e.target.value})} /></div>
          <div className="form-group">
            <label>Tipe</label>
            <select value={form.tipe} onChange={e => setForm({...form, tipe:e.target.value, kategori:(e.target.value==="pengeluaran"?KAT_K:KAT_M)[0]})}>
              <option value="pengeluaran">Pengeluaran</option>
              <option value="pemasukan">Pemasukan</option>
            </select>
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <select value={form.kategori} onChange={e => setForm({...form, kategori:e.target.value})}>
              {kats.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Kolam (opsional)</label>
            <select value={form.kolamId} onChange={e => setForm({...form, kolamId:e.target.value})}>
              <option value="">-- Semua --</option>
              {kolam.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Deskripsi</label><input type="text" placeholder="Keterangan" value={form.deskripsi} onChange={e => setForm({...form, deskripsi:e.target.value})} /></div>
          <div className="form-group"><label>Jumlah (Rp)</label><input type="number" placeholder="0" value={form.jumlah} onChange={e => setForm({...form, jumlah:e.target.value})} /></div>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={submit}>+ Tambah Transaksi</button></div>
      </div>

      <div className="card">
        <div className="flex-between" style={{marginBottom:"1rem"}}>
          <div className="card-title" style={{marginBottom:0}}>Riwayat Transaksi</div>
          <div style={{display:"flex", gap:8}}>
            <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)} style={{width:"auto"}}>
              <option value="">Semua Bulan</option>
              {allBulan.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={filterTipe} onChange={e => setFilterTipe(e.target.value)} style={{width:"auto"}}>
              <option value="">Semua</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
        </div>
        <div className="grid-4" style={{marginBottom:"1rem"}}>
          <div className="metric-card green"><div className="metric-label">Pemasukan</div><div className="metric-value pos" style={{fontSize:14}}>{fmt(msk)}</div></div>
          <div className="metric-card red"><div className="metric-label">Pengeluaran</div><div className="metric-value neg" style={{fontSize:14}}>{fmt(klr)}</div></div>
          <div className={`metric-card ${msk-klr>=0?"green":"red"}`}><div className="metric-label">Saldo Bersih</div><div className={`metric-value ${msk-klr>=0?"pos":"neg"}`} style={{fontSize:14}}>{fmt(msk-klr)}</div></div>
          <div className="metric-card"><div className="metric-label">Transaksi</div><div className="metric-value">{txs.length}</div></div>
        </div>
        {txs.length === 0 ? <div className="empty-state">Belum ada transaksi</div> : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Kolam</th><th>Deskripsi</th><th>Jumlah</th><th></th></tr></thead>
              <tbody>
                {txs.map(x => {
                  const k = kolam.find(k => k.id === x.kolamId);
                  return (
                    <tr key={x.id}>
                      <td>{x.tanggal}</td>
                      <td><span className={`tag ${x.tipe==="pemasukan"?"tag-green":"tag-red"}`}>{x.tipe}</span></td>
                      <td>{x.kategori}</td>
                      <td>{k ? k.nama : "-"}</td>
                      <td>{x.deskripsi || "-"}</td>
                      <td className={x.tipe==="pemasukan"?"pos":"neg"}>{fmt(x.jumlah)}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => hapusCashflow(x.id)}>hapus</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
