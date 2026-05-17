import { useState } from "react";
import { useStore, fmt, fmtNum } from "../store";

export default function Laporan() {
  const { kolam, cashflow, panen } = useStore();
  const [kolamFilter, setKolamFilter] = useState("");
  const [periode, setPeriode] = useState("bulan");

  let txs = cashflow;
  let pns = panen;
  if (kolamFilter) {
    txs = txs.filter(x => x.kolamId === kolamFilter || !x.kolamId);
    pns = pns.filter(x => x.kolamId === kolamFilter);
  }

  const bulanSet = [...new Set(txs.map(x => x.tanggal.substr(0,7)))].sort();

  let groups = {};
  if (periode === "bulan") {
    bulanSet.forEach(b => { groups[b] = [b]; });
  } else {
    bulanSet.forEach(b => {
      const [y,m] = b.split("-").map(Number);
      const q = Math.ceil(m/3);
      const names = ["Jan–Mar","Apr–Jun","Jul–Sep","Okt–Des"];
      const key = `${y} — Siklus Q${q} (${names[q-1]})`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
  }

  return (
    <div>
      <div className="card">
        <div className="flex-between">
          <div className="card-title" style={{marginBottom:0}}>Filter Laporan</div>
          <div style={{display:"flex", gap:8}}>
            <select value={kolamFilter} onChange={e => setKolamFilter(e.target.value)} style={{width:"auto"}}>
              <option value="">Semua Kolam</option>
              {kolam.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
            <select value={periode} onChange={e => setPeriode(e.target.value)} style={{width:"auto"}}>
              <option value="bulan">Per Bulan</option>
              <option value="siklus">Per Siklus (3 bln)</option>
            </select>
          </div>
        </div>
      </div>

      {bulanSet.length === 0 && (
        <div className="card"><div className="empty-state">Belum ada data transaksi</div></div>
      )}

      {Object.entries(groups).reverse().map(([label, bulanArr]) => {
        const txP = txs.filter(x => bulanArr.some(b => x.tanggal.startsWith(b)));
        const pnP = pns.filter(x => bulanArr.some(b => x.tanggal.startsWith(b)));
        const msk = txP.filter(x => x.tipe==="pemasukan").reduce((s,x) => s+x.jumlah, 0);
        const klr = txP.filter(x => x.tipe==="pengeluaran").reduce((s,x) => s+x.jumlah, 0);
        const laba = msk - klr;
        const tBrt = pnP.reduce((s,x) => s+x.berat, 0);
        const hpp = tBrt > 0 ? klr/tBrt : 0;
        const margin = msk > 0 ? ((laba/msk)*100).toFixed(1) : 0;
        const byKat = {};
        txP.filter(x => x.tipe==="pengeluaran").forEach(x => { byKat[x.kategori]=(byKat[x.kategori]||0)+x.jumlah; });

        return (
          <div className="card" key={label}>
            <div className="flex-between" style={{marginBottom:"1rem"}}>
              <div className="card-title" style={{marginBottom:0}}>{label}</div>
              <span className={`tag ${laba>=0?"tag-green":"tag-red"}`}>{laba>=0?"✓ Untung":"✗ Rugi"} {margin}%</span>
            </div>
            <div className="grid-4" style={{marginBottom:"1rem"}}>
              <div className="metric-card green"><div className="metric-label">Pemasukan</div><div className="metric-value pos" style={{fontSize:13}}>{fmt(msk)}</div></div>
              <div className="metric-card red"><div className="metric-label">Pengeluaran</div><div className="metric-value neg" style={{fontSize:13}}>{fmt(klr)}</div></div>
              <div className={`metric-card ${laba>=0?"green":"red"}`}><div className="metric-label">Laba Bersih</div><div className={`metric-value ${laba>=0?"pos":"neg"}`} style={{fontSize:13}}>{fmt(laba)}</div></div>
              <div className="metric-card amber"><div className="metric-label">HPP/kg</div><div className="metric-value" style={{fontSize:13}}>{tBrt>0?fmt(hpp)+"/kg":"-"}</div></div>
            </div>

            {Object.keys(byKat).length > 0 && (
              <>
                <div className="section-label">Rincian Biaya</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6, marginBottom:"0.75rem"}}>
                  {Object.entries(byKat).sort((a,b)=>b[1]-a[1]).map(([k,v]) => (
                    <span key={k} className="tag tag-amber">{k}: {fmt(v)}</span>
                  ))}
                </div>
              </>
            )}

            {pnP.length > 0 && (
              <>
                <div className="section-label" style={{marginTop:"0.5rem"}}>Panen Periode Ini</div>
                <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                  {pnP.map(p => (
                    <span key={p.id} className="tag tag-blue">
                      {p.kolamNama} {fmtNum(p.berat)}kg @ {fmt(p.harga)}/kg = {fmt(p.total)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
