import { useState } from "react";
import { useStore, fmt, fmtNum, today } from "../store";

export default function Panen() {
  const { kolam, panen, tambahPanen, hapusPanen } = useStore();
  const [form, setForm] = useState({ kolamId:"", tanggal:today(), berat:"", ekor:"", harga:"", pembeli:"" });

  const submit = () => {
    if (!form.kolamId || !form.berat || !form.harga) return alert("Kolam, berat, dan harga wajib diisi");
    tambahPanen({ ...form, berat:+form.berat, ekor:+form.ekor, harga:+form.harga });
    setForm({ kolamId:"", tanggal:today(), berat:"", ekor:"", harga:"", pembeli:"" });
  };

  const tBrt = panen.reduce((s,x) => s+x.berat, 0);
  const tPend = panen.reduce((s,x) => s+x.total, 0);
  const avgH = tBrt > 0 ? tPend/tBrt : 0;
  const estimasi = form.berat && form.harga ? +form.berat * +form.harga : 0;

  return (
    <div>
      <div className="card">
        <div className="card-title">Catat Panen</div>
        <div className="form-row">
          <div className="form-group">
            <label>Kolam</label>
            <select value={form.kolamId} onChange={e => setForm({...form, kolamId:e.target.value})}>
              <option value="">-- Pilih Kolam --</option>
              {kolam.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          {[["tanggal","Tanggal Panen","date"],["berat","Berat Total (kg)","number"],["ekor","Jumlah Ekor","number"],["harga","Harga Jual/kg (Rp)","number"],["pembeli","Pembeli","text"]].map(([k,l,t]) => (
            <div className="form-group" key={k}>
              <label>{l}</label>
              <input type={t} placeholder={t==="text"?"Nama pembeli/pasar":"0"} value={form[k]} onChange={e => setForm({...form,[k]:e.target.value})} />
            </div>
          ))}
        </div>
        {estimasi > 0 && (
          <div style={{fontSize:13, color:"var(--b600)", marginBottom:8, fontWeight:500}}>
            💰 Estimasi total: {fmt(estimasi)}
          </div>
        )}
        <div className="btn-row"><button className="btn btn-primary" onClick={submit}>+ Catat Panen</button></div>
      </div>

      <div className="card">
        <div className="card-title">Riwayat Panen</div>
        <div className="grid-4" style={{marginBottom:"1rem"}}>
          <div className="metric-card"><div className="metric-label">Total Panen</div><div className="metric-value">{fmtNum(tBrt)} kg</div></div>
          <div className="metric-card"><div className="metric-label">Jumlah Panen</div><div className="metric-value">{panen.length}x</div></div>
          <div className="metric-card green"><div className="metric-label">Total Pendapatan</div><div className="metric-value pos" style={{fontSize:14}}>{fmt(tPend)}</div></div>
          <div className="metric-card amber"><div className="metric-label">Harga Rata-rata</div><div className="metric-value" style={{fontSize:14}}>{fmt(avgH)}/kg</div></div>
        </div>
        {panen.length === 0 ? <div className="empty-state">Belum ada catatan panen</div> : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Kolam</th><th>Berat (kg)</th><th>Ekor</th><th>Harga/kg</th><th>Total</th><th>Pembeli</th><th></th></tr></thead>
              <tbody>
                {[...panen].sort((a,b) => b.tanggal.localeCompare(a.tanggal)).map(x => (
                  <tr key={x.id}>
                    <td>{x.tanggal}</td>
                    <td>{x.kolamNama || "-"}</td>
                    <td>{fmtNum(x.berat)} kg</td>
                    <td>{fmtNum(x.ekor)}</td>
                    <td>{fmt(x.harga)}</td>
                    <td className="pos">{fmt(x.total)}</td>
                    <td>{x.pembeli || "-"}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => hapusPanen(x.id)}>hapus</button></td>
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
