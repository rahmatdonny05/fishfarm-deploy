import { useState } from "react";
import { useStore, fmtNum, today } from "../store";

export default function Kolam() {
  const { kolam, tebar, tambahKolam, hapusKolam, tebarBenih } = useStore();
  const [kForm, setKForm] = useState({ nama:"", ukuran:"", jenis:"", status:"aktif" });
  const [tbForm, setTbForm] = useState({ kolamId:"", tanggal:today(), jumlah:"", harga:"", siklus:"3", target:"" });

  const submitKolam = () => {
    if (!kForm.nama) return alert("Nama kolam wajib diisi");
    tambahKolam({ ...kForm, ukuran: +kForm.ukuran });
    setKForm({ nama:"", ukuran:"", jenis:"", status:"aktif" });
  };

  const submitTebar = () => {
    if (!tbForm.kolamId || !tbForm.tanggal || !tbForm.jumlah) return alert("Kolam, tanggal, dan jumlah benih wajib diisi");
    tebarBenih({ ...tbForm, jumlah:+tbForm.jumlah, harga:+tbForm.harga, siklus:+tbForm.siklus, target:+tbForm.target });
    setTbForm({ kolamId:"", tanggal:today(), jumlah:"", harga:"", siklus:"3", target:"" });
  };

  return (
    <div>
      <div className="card">
        <div className="card-title">Tambah Kolam</div>
        <div className="form-row">
          {[["nama","Nama Kolam","text","Kolam A"],["ukuran","Ukuran (m²)","number","100"],["jenis","Jenis Ikan","text","Lele, Nila, Mas..."]].map(([k,l,t,p]) => (
            <div className="form-group" key={k}>
              <label>{l}</label>
              <input type={t} placeholder={p} value={kForm[k]} onChange={e => setKForm({...kForm,[k]:e.target.value})} />
            </div>
          ))}
          <div className="form-group">
            <label>Status</label>
            <select value={kForm.status} onChange={e => setKForm({...kForm, status:e.target.value})}>
              <option value="aktif">Aktif</option>
              <option value="istirahat">Istirahat</option>
              <option value="persiapan">Persiapan</option>
            </select>
          </div>
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={submitKolam}>+ Tambah Kolam</button></div>
      </div>

      <div className="card">
        <div className="card-title">Tebar Benih</div>
        <div className="form-row">
          <div className="form-group">
            <label>Kolam</label>
            <select value={tbForm.kolamId} onChange={e => setTbForm({...tbForm, kolamId:e.target.value})}>
              <option value="">-- Pilih Kolam --</option>
              {kolam.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          {[["tanggal","Tanggal Tebar","date"],["jumlah","Jumlah Benih (ekor)","number"],["harga","Harga/ekor (Rp)","number"],["siklus","Siklus (bulan)","number"],["target","Target Panen (kg)","number"]].map(([k,l,t]) => (
            <div className="form-group" key={k}>
              <label>{l}</label>
              <input type={t} value={tbForm[k]} onChange={e => setTbForm({...tbForm,[k]:e.target.value})} />
            </div>
          ))}
        </div>
        <div className="btn-row"><button className="btn btn-primary" onClick={submitTebar}>+ Tebar Benih</button></div>
      </div>

      <div className="card">
        <div className="card-title">Daftar Kolam & Siklus Aktif</div>
        {kolam.length === 0 ? <div className="empty-state">Belum ada kolam</div> : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Kolam</th><th>Jenis</th><th>Ukuran</th><th>Status</th><th>Tebar Terakhir</th><th>Benih</th><th>Siklus</th><th>Est. Panen</th><th></th></tr></thead>
              <tbody>
                {kolam.map(k => {
                  const tb = [...tebar].filter(t => t.kolamId === k.id).sort((a,b) => b.tanggal.localeCompare(a.tanggal))[0];
                  const sc = k.status === "aktif" ? "tag-blue" : k.status === "istirahat" ? "tag-amber" : "tag-gray";
                  return (
                    <tr key={k.id}>
                      <td><strong>{k.nama}</strong></td>
                      <td>{k.jenis || "-"}</td>
                      <td>{k.ukuran ? k.ukuran+" m²" : "-"}</td>
                      <td><span className={`tag ${sc}`}>{k.status}</span></td>
                      <td>{tb ? tb.tanggal : "-"}</td>
                      <td>{tb ? fmtNum(tb.jumlah)+" ekor" : "-"}</td>
                      <td>{tb ? tb.siklus+" bln" : "-"}</td>
                      <td>{tb ? tb.estPanen : "-"}</td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => hapusKolam(k.id)}>hapus</button></td>
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
