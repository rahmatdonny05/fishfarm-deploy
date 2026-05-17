import { useState } from "react";
import { useStore, fmt, today } from "../store";

const KATEGORI = ["Pembuatan Kolam","Pompa & Aerasi","Peralatan","Instalasi Listrik/Air","Bangunan/Gudang","Lain-lain"];

export default function Investasi() {
  const { investasi, tambahInvestasi, hapusInvestasi } = useStore();
  const [form, setForm] = useState({ tanggal:today(), kategori:KATEGORI[0], deskripsi:"", jumlah:"" });

  const submit = () => {
    if (!form.tanggal || !form.jumlah) return alert("Tanggal dan jumlah wajib diisi");
    tambahInvestasi({ ...form, jumlah:+form.jumlah });
    setForm({ tanggal:today(), kategori:KATEGORI[0], deskripsi:"", jumlah:"" });
  };

  const total = investasi.reduce((s,x) => s+x.jumlah, 0);
  const byKat = {};
  investasi.forEach(x => { byKat[x.kategori] = (byKat[x.kategori]||0)+x.jumlah; });

  return (
    <div>
      <div className="card">
        <div className="card-title">Catat Investasi Awal</div>
        <div className="form-row">
          <div className="form-group"><label>Tanggal</label><input type="date" value={form.tanggal} onChange={e => setForm({...form, tanggal:e.target.value})} /></div>
          <div className="form-group">
            <label>Kategori</label>
            <select value={form.kategori} onChange={e => setForm({...form, kategori:e.target.value})}>
              {KATEGORI.map(k => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Deskripsi</label><input type="text" placeholder="Detail investasi" value={form.deskripsi} onChange={e => setForm({...form, deskripsi:e.target.value})} /></div>
          <div className="form-group"><label>Jumlah (Rp)</label><input type="number" placeholder="0" value={form.jumlah} onChange={e => setForm({...form, jumlah:e.target.value})} /></div>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={submit}>+ Catat Investasi</button></div>
      </div>

      <div className="card">
        <div className="card-title">Ringkasan Investasi</div>
        <div className="grid-3" style={{marginBottom:"1rem"}}>
          <div className="metric-card red">
            <div className="metric-label">Total Modal Awal</div>
            <div className="metric-value neg" style={{fontSize:15}}>{fmt(total)}</div>
          </div>
          {Object.entries(byKat).map(([k,v]) => (
            <div className="metric-card" key={k}>
              <div className="metric-label">{k}</div>
              <div className="metric-value" style={{fontSize:14}}>{fmt(v)}</div>
              <div className="metric-sub">{total > 0 ? ((v/total)*100).toFixed(1)+"%" : "0%"}</div>
            </div>
          ))}
        </div>
        {investasi.length === 0 ? <div className="empty-state">Belum ada investasi</div> : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th>Jumlah</th><th></th></tr></thead>
              <tbody>
                {[...investasi].sort((a,b) => b.tanggal.localeCompare(a.tanggal)).map(x => (
                  <tr key={x.id}>
                    <td>{x.tanggal}</td>
                    <td><span className="tag tag-purple">{x.kategori}</span></td>
                    <td>{x.deskripsi || "-"}</td>
                    <td className="neg">{fmt(x.jumlah)}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => hapusInvestasi(x.id)}>hapus</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
