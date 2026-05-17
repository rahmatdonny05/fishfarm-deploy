import { useStore, fmt, fmtNum } from "../store";

export default function Progress() {
  const { kolam, tebar, cashflow, panen, investasi } = useStore();
  const now = new Date();
  const bln = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const b3 = [0,1,2].map(i => { const d=new Date(now); d.setMonth(d.getMonth()-i); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; });

  const txB = cashflow.filter(x => x.tanggal.startsWith(bln));
  const pnB = panen.filter(x => x.tanggal.startsWith(bln));
  const tPakan = txB.filter(x => x.kategori==="Pakan").reduce((s,x) => s+x.jumlah, 0);
  const tObat = txB.filter(x => x.kategori==="Obat/Vitamin").reduce((s,x) => s+x.jumlah, 0);
  const brtB = pnB.reduce((s,x) => s+x.berat, 0);

  const allBrt = panen.reduce((s,x) => s+x.berat, 0);
  const allPend = panen.reduce((s,x) => s+x.total, 0);
  const allKlr = cashflow.filter(x => x.tipe==="pengeluaran").reduce((s,x) => s+x.jumlah, 0);
  const allMsk = cashflow.filter(x => x.tipe==="pemasukan").reduce((s,x) => s+x.jumlah, 0);
  const hpp = allBrt > 0 ? allKlr/allBrt : 0;
  const inv = investasi.reduce((s,x) => s+x.jumlah, 0);
  const roi = inv > 0 ? (((allPend-allKlr)/inv)*100).toFixed(1) : 0;

  const pkB = b3.map(b => ({ b, v: cashflow.filter(x => x.tanggal.startsWith(b) && x.kategori==="Pakan").reduce((s,x) => s+x.jumlah, 0) }));
  const maxPk = Math.max(...pkB.map(x => x.v), 1);

  const byKat = {};
  cashflow.filter(x => x.tipe==="pengeluaran").forEach(x => { byKat[x.kategori]=(byKat[x.kategori]||0)+x.jumlah; });
  const tKlr = Object.values(byKat).reduce((s,v) => s+v, 0);
  const COLORS = ["var(--b600)","var(--a400)","#7F77DD","var(--r400)","var(--g400)","var(--gr400)"];

  const upcoming = tebar.filter(t => panen.filter(p => p.kolamId===t.kolamId && p.tanggal>=t.tanggal).length===0)
    .sort((a,b) => a.estPanen.localeCompare(b.estPanen));

  return (
    <div>
      <div className="card">
        <div className="card-title">Ringkasan Bulan Ini ({bln})</div>
        <div className="grid-4">
          <div className="metric-card"><div className="metric-label">Panen Bulan Ini</div><div className="metric-value">{pnB.length}x</div></div>
          <div className="metric-card"><div className="metric-label">Total Panen</div><div className="metric-value">{fmtNum(brtB)} kg</div></div>
          <div className="metric-card red"><div className="metric-label">Biaya Pakan</div><div className="metric-value neg" style={{fontSize:14}}>{fmt(tPakan)}</div></div>
          <div className="metric-card amber"><div className="metric-label">Biaya Obat/Vit</div><div className="metric-value" style={{fontSize:14}}>{fmt(tObat)}</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Statistik Keseluruhan</div>
        <div className="grid-4">
          <div className="metric-card"><div className="metric-label">Total Semua Panen</div><div className="metric-value">{panen.length}x</div><div className="metric-sub">{fmtNum(allBrt)} kg</div></div>
          <div className="metric-card amber"><div className="metric-label">HPP Rata-rata</div><div className="metric-value" style={{fontSize:14}}>{allBrt>0?fmt(hpp)+"/kg":"N/A"}</div></div>
          <div className="metric-card green"><div className="metric-label">Total Pendapatan</div><div className="metric-value pos" style={{fontSize:14}}>{fmt(allPend)}</div></div>
          <div className={`metric-card ${+roi>=0?"green":"red"}`}><div className="metric-label">ROI</div><div className={`metric-value ${+roi>=0?"pos":"neg"}`}>{roi}%</div><div className="metric-sub">modal {fmt(inv)}</div></div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Biaya Pakan 3 Bulan Terakhir</div>
          {pkB.map(b => (
            <div key={b.b} style={{marginBottom:12}}>
              <div className="flex-between" style={{fontSize:13, marginBottom:3}}>
                <span style={{color:"var(--text3)"}}>{b.b}</span>
                <span style={{fontWeight:500}}>{fmt(b.v)}</span>
              </div>
              <div className="prog-wrap">
                <div className="prog-bar" style={{width:Math.round((b.v/maxPk)*100)+"%", background:"linear-gradient(90deg,var(--a400),var(--a800))"}} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">Komposisi Pengeluaran</div>
          {Object.keys(byKat).length === 0 ? (
            <div className="empty-state" style={{padding:"0.5rem 0"}}>Belum ada data</div>
          ) : (
            Object.entries(byKat).sort((a,b)=>b[1]-a[1]).map(([k,v],i) => (
              <div key={k} style={{marginBottom:10}}>
                <div className="flex-between" style={{fontSize:13, marginBottom:3}}>
                  <div style={{display:"flex", alignItems:"center", gap:6}}>
                    <div style={{width:10,height:10,borderRadius:2,background:COLORS[i%COLORS.length],flexShrink:0}} />
                    <span style={{color:"var(--text2)"}}>{k}</span>
                  </div>
                  <span style={{fontWeight:500}}>{tKlr>0?((v/tKlr)*100).toFixed(1)+"%":"-"}</span>
                </div>
                <div className="prog-wrap">
                  <div className="prog-bar" style={{width:tKlr>0?Math.round((v/tKlr)*100)+"%":"0%", background:COLORS[i%COLORS.length]}} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Estimasi Panen Mendatang</div>
        {upcoming.length === 0 ? (
          <div className="empty-state">Tidak ada siklus yang sedang berjalan</div>
        ) : upcoming.map(t => {
          const d = Math.floor((new Date(t.estPanen) - Date.now()) / 86400000);
          const sdh = Math.floor((Date.now() - new Date(t.tanggal)) / 86400000);
          const pct = Math.min(100, Math.round((sdh/(t.siklus*30))*100));
          return (
            <div key={t.id} style={{padding:"9px 0", borderBottom:"1px solid var(--border)"}}>
              <div className="flex-between">
                <span style={{fontSize:13, fontWeight:500}}>{t.kolamNama}</span>
                <span className={`tag ${d<=7?"tag-red":d<=30?"tag-amber":"tag-blue"}`}>
                  {d>0?`~${d} hari lagi`:"🎉 Siap panen!"}
                </span>
              </div>
              <div style={{fontSize:12, color:"var(--text3)"}}>
                Tebar: {t.tanggal} · {fmtNum(t.jumlah)} ekor · Target: {fmtNum(t.target)} kg
              </div>
              <div style={{fontSize:11, color:"var(--text3)", marginTop:3}}>Progress siklus: {pct}%</div>
              <div className="prog-wrap"><div className="prog-bar" style={{width:pct+"%"}} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
