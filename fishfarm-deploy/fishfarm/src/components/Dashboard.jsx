import { useStore, fmt, fmtNum } from "../store";

export default function Dashboard() {
  const { kolam, tebar, cashflow, panen, investasi } = useStore();
  const now = new Date();
  const bln = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const txB = cashflow.filter((x) => x.tanggal.startsWith(bln));
  const msk = txB.filter((x) => x.tipe === "pemasukan").reduce((s,x) => s+x.jumlah, 0);
  const klr = txB.filter((x) => x.tipe === "pengeluaran").reduce((s,x) => s+x.jumlah, 0);
  const sal = msk - klr;
  const inv = investasi.reduce((s,x) => s+x.jumlah, 0);
  const pend = panen.reduce((s,x) => s+x.total, 0);
  const aktif = kolam.filter((k) => k.status === "aktif").length;
  const recent = [...cashflow].sort((a,b) => b.tanggal.localeCompare(a.tanggal)).slice(0,6);

  return (
    <div>
      <div className="grid-4">
        <div className="metric-card">
          <div className="metric-label">Kolam Aktif</div>
          <div className="metric-value">{aktif}</div>
          <div className="metric-sub">dari {kolam.length} total</div>
        </div>
        <div className={`metric-card ${sal >= 0 ? "green" : "red"}`}>
          <div className="metric-label">Saldo Bulan Ini</div>
          <div className={`metric-value ${sal >= 0 ? "pos" : "neg"}`} style={{fontSize:15}}>{fmt(sal)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Investasi</div>
          <div className="metric-value" style={{fontSize:15}}>{fmt(inv)}</div>
        </div>
        <div className="metric-card green">
          <div className="metric-label">Pendapatan Panen</div>
          <div className="metric-value pos" style={{fontSize:14}}>{fmt(pend)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Cashflow Bulan Ini</div>
          <div className="info-row">
            <span style={{color:"var(--text2)"}}>Pemasukan</span>
            <span className="pos">{fmt(msk)}</span>
          </div>
          <div className="info-row">
            <span style={{color:"var(--text2)"}}>Pengeluaran</span>
            <span className="neg">{fmt(klr)}</span>
          </div>
          <div className="info-row" style={{fontWeight:500}}>
            <span>Saldo Bersih</span>
            <span className={sal >= 0 ? "pos" : "neg"}>{fmt(sal)}</span>
          </div>
          <div style={{fontSize:12, color:"var(--text3)", marginTop:8}}>{txB.length} transaksi bulan ini</div>
        </div>

        <div className="card">
          <div className="card-title">Status Kolam</div>
          {kolam.length === 0 && <div className="empty-state" style={{padding:"1rem 0"}}>Belum ada kolam</div>}
          {kolam.map((k) => {
            const tb = [...tebar].filter((t) => t.kolamId === k.id).sort((a,b) => b.tanggal.localeCompare(a.tanggal))[0];
            const sc = k.status === "aktif" ? "tag-blue" : k.status === "istirahat" ? "tag-amber" : "tag-gray";
            let prog = null;
            if (tb) {
              const d = Math.floor((Date.now() - new Date(tb.tanggal)) / 86400000);
              const tgt = tb.siklus * 30;
              const pct = Math.min(100, Math.round((d/tgt)*100));
              prog = (
                <div style={{marginTop:4}}>
                  <div style={{fontSize:11, color:"var(--text3)"}}>Hari ke-{d} / ~{tgt} hari ({pct}%)</div>
                  <div className="prog-wrap"><div className="prog-bar" style={{width:pct+"%"}} /></div>
                </div>
              );
            }
            return (
              <div key={k.id} style={{padding:"7px 0", borderBottom:"1px solid var(--border)"}}>
                <div className="flex-between">
                  <span style={{fontSize:13, fontWeight:500}}>{k.nama}</span>
                  <span className={`tag ${sc}`}>{k.status}</span>
                </div>
                <div style={{fontSize:12, color:"var(--text3)"}}>{k.jenis || ""}{k.ukuran ? " · "+k.ukuran+"m²" : ""}</div>
                {prog}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Transaksi Terakhir</div>
        {recent.length === 0 ? (
          <div className="empty-state">Belum ada transaksi</div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Deskripsi</th><th>Jumlah</th></tr></thead>
              <tbody>
                {recent.map((x) => (
                  <tr key={x.id}>
                    <td>{x.tanggal}</td>
                    <td><span className={`tag ${x.tipe === "pemasukan" ? "tag-green" : "tag-red"}`}>{x.tipe}</span></td>
                    <td>{x.kategori}</td>
                    <td>{x.deskripsi || "-"}</td>
                    <td className={x.tipe === "pemasukan" ? "pos" : "neg"}>{fmt(x.jumlah)}</td>
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
