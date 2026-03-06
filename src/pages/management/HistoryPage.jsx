import { useState, useEffect } from 'react';
import { roundService, orderService } from '../../services/storage';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
}

function generatePrintHTML(round, orders) {
  const total = orders.reduce((s, o) => s + o.totalPrice, 0);
  const rows = orders.map((o, i) => `
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:8px 12px;text-align:center">${i + 1}</td>
      <td style="padding:8px 12px">${o.customerName}</td>
      <td style="padding:8px 12px;text-align:center">${o.itemCount} ຢ່າງ</td>
      <td style="padding:8px 12px;text-align:right;font-weight:600">${o.totalPrice.toLocaleString()} LAK</td>
      <td style="padding:8px 12px;text-align:center;color:#6b7280">${o.addedBy}</td>
      <td style="padding:8px 12px;text-align:center;color:#6b7280;font-size:11px">${formatDate(o.createdAt)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${round.name} - ລາຍງານ</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;600;700&display=swap');
  * { font-family: 'Noto Sans Lao', sans-serif; margin:0; padding:0; box-sizing:border-box; }
  body { padding: 30px; color: #1a1a1a; }
  .header { text-align:center; margin-bottom:24px; border-bottom:2px solid #16a34a; padding-bottom:16px; }
  .header h1 { color:#15803d; font-size:22px; font-weight:700; }
  .header p { color:#6b7280; font-size:13px; margin-top:4px; }
  .summary { display:flex; gap:20px; margin-bottom:20px; }
  .summary-box { background:#f0fff4; border:1px solid #bbf7d0; border-radius:8px; padding:12px 20px; flex:1; text-align:center; }
  .summary-box .num { font-size:20px; font-weight:700; color:#16a34a; }
  .summary-box .lbl { font-size:11px; color:#6b7280; margin-top:2px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead { background:#16a34a; color:white; }
  thead th { padding:10px 12px; text-align:left; font-weight:600; }
  tbody tr:nth-child(even) { background:#f9fafb; }
  .total-row { background:#f0fff4 !important; font-weight:700; }
  .footer { margin-top:20px; text-align:center; font-size:11px; color:#9ca3af; }
  @media print { body { padding:15px; } }
</style>
</head>
<body>
<div class="header">
  <h1>📋 ${round.name}</h1>
  <p>ລາຍງານຄຳສັ່ງຊື້ | ເປີດ: ${formatDate(round.openAt)} ${round.closeAt ? '| ປິດ: ' + formatDate(round.closeAt) : ''}</p>
  <p style="margin-top:4px;font-size:11px">ພິມພ໌ເມື່ອ: ${formatDate(new Date().toISOString())}</p>
</div>
<div class="summary">
  <div class="summary-box"><div class="num">${orders.length}</div><div class="lbl">ຈຳນວນລາຍການ</div></div>
  <div class="summary-box"><div class="num">${total.toLocaleString()}</div><div class="lbl">ຍອດລວມ (LAK)</div></div>
</div>
<table>
  <thead>
    <tr>
      <th style="text-align:center">#</th>
      <th>ຊື່ລູກຄ້າ</th>
      <th style="text-align:center">ຈຳນວນ</th>
      <th style="text-align:right">ຍອດ LAK</th>
      <th style="text-align:center">Admin</th>
      <th style="text-align:center">ວັນທີ</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    <tr class="total-row">
      <td colspan="3" style="padding:10px 12px;text-align:right">ຍອດລວມທັງໝົດ</td>
      <td style="padding:10px 12px;text-align:right">${total.toLocaleString()} LAK</td>
      <td colspan="2"></td>
    </tr>
  </tbody>
</table>
<div class="footer">Order Manager System — ສ້າງໂດຍອັດຕະໂນມັດ</div>
</body>
</html>`;
}

function HistoryDetailView({ round, onBack }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setOrders(orderService.getByRound(round.id)); }, [round.id]);

  const filtered = orders.filter(o => o.customerName.toLowerCase().includes(search.toLowerCase()));
  const totalPrice = filtered.reduce((s, o) => s + o.totalPrice, 0);

  const handleExport = () => {
    // create a hidden container with the HTML and convert to PDF using jsPDF
    const html = generatePrintHTML(round, orders);
    const container = document.createElement('div');
    container.style.display = 'none';
    container.innerHTML = html;
    document.body.appendChild(container);

    const doc = new jsPDF('p', 'pt', 'a4');
    // wait for fonts to load so Lao font is applied
    document.fonts.ready.then(() => {
      doc.html(container, {
        callback: (doc) => {
          doc.save(`${round.name}.pdf`);
          document.body.removeChild(container);
        },
        x: 10,
        y: 10,
        html2canvas: { scale: 0.5 }
      });
    });
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-green-200 text-green-600 hover:bg-green-50 shadow-sm">←</button>
        <div className="flex-1">
          <h2 className="font-display font-bold text-green-800 text-base">{round.name}</h2>
          <p className="text-xs text-green-500">{formatDate(round.openAt)} — {formatDate(round.closeAt)}</p>
        </div>
        <button onClick={handleExport} className="btn-primary text-sm px-3 py-2 flex items-center gap-1">
          <span>📤</span> ດາວໂຫລດ PDF
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-green-700">{filtered.length}</p>
            <p className="text-xs text-green-500">ລາຍການທັງໝົດ</p>
          </div>
          <div className="w-px h-10 bg-green-200" />
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-green-700">{totalPrice.toLocaleString()}</p>
            <p className="text-xs text-green-500">ຍອດລວມ (LAK)</p>
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <input className="input-field pl-10" placeholder="ຄົ້ນຫາຊື່ລູກຄ້າ..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-3 py-3 text-left text-xs">#</th>
                <th className="px-3 py-3 text-left text-xs">ລູກຄ້າ</th>
                <th className="px-3 py-3 text-center text-xs">ຈຳນວນ</th>
                <th className="px-3 py-3 text-right text-xs">ຍອດ LAK</th>
                <th className="px-3 py-3 text-center text-xs">Admin</th>
                <th className="px-3 py-3 text-center text-xs">ວັນທີ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-green-400">ບໍ່ພົບລາຍການ</td></tr>
              ) : filtered.map((order, idx) => (
                <tr key={order.id} className="table-row">
                  <td className="px-3 py-3 text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-3 py-3 font-semibold text-green-800 text-xs">{order.customerName}</td>
                  <td className="px-3 py-3 text-center text-xs">{order.itemCount}</td>
                  <td className="px-3 py-3 text-right font-semibold text-green-700 text-xs">{order.totalPrice.toLocaleString()}</td>
                  <td className="px-3 py-3 text-center text-xs text-gray-500">{order.addedBy}</td>
                  <td className="px-3 py-3 text-center text-xs text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [rounds, setRounds] = useState([]);
  const [selectedRound, setSelectedRound] = useState(null);

  useEffect(() => { setRounds(roundService.getAll()); }, []);

  if (selectedRound) return <HistoryDetailView round={selectedRound} onBack={() => setSelectedRound(null)} />;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-green-800">🕐 History</h2>
        <p className="text-green-500 text-xs">ເບິ່ງປະຫວັດຮອບຄຳສັ່ງຊື້ທັງໝົດ</p>
      </div>

      {rounds.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center text-green-400">ຍັງບໍ່ມີປະຫວັດຮອບຄຳສັ່ງຊື້</div>
      )}

      {rounds.map(round => {
        const summary = orderService.getSummary(round.id);
        return (
          <div key={round.id} className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={round.status === 'open' ? 'badge-open' : 'badge-closed'}>
                    {round.status === 'open' ? '🟢 ເປີດຢູ່' : '⚫ ປິດແລ້ວ'}
                  </span>
                </div>
                <h3 className="font-bold text-green-800">{round.name}</h3>
                <p className="text-xs text-green-500 mt-0.5">{formatDate(round.openAt)} {round.closeAt ? '→ ' + formatDate(round.closeAt) : ''}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-700">{summary.count} ລາຍການ</p>
                <p className="text-xs text-green-500">{summary.totalPrice.toLocaleString()} LAK</p>
              </div>
            </div>
            <button onClick={() => setSelectedRound(round)} className="btn-secondary w-full text-sm py-2">
              ເບິ່ງປະຫວັດ →
            </button>
          </div>
        );
      })}
    </div>
  );
}
