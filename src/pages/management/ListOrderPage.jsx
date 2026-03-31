import { useState, useEffect } from 'react';
import { roundService, orderService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { ClipboardList, Circle, FilePlus, Pencil, Trash2, Plus } from 'lucide-react';
import { showMaintenanceAlert } from '../../utils/maintenanceAlert';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
}
function formatPrice(n) { return n?.toLocaleString('en-US') + ' LAK'; }

function formatNumber(str) {
  const digits = String(str).replace(/[^0-9]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ---- ROUND LIST VIEW ----
function RoundListView({ onSelectRound }) {
  const [rounds, setRounds] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [roundName, setRoundName] = useState('');
  const { user } = useAuth();

  const load = async () => {
    const data = await roundService.getAll();
    setRounds(data);
    const entries = await Promise.all(
      data.map(async r => [r.id, await orderService.getSummary(r.id)])
    );
    setSummaries(Object.fromEntries(entries));
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!roundName.trim()) {
      Swal.fire({ icon: 'warning', title: 'ກະລຸນາຕື່ມຊື່ຮອບ', confirmButtonColor: '#27AE60' });
      return;
    }
    const result = await Swal.fire({
      icon: 'question',
      title: 'ສ້າງຮອບຄຳສັ່ງຊື້?',
      text: `ສ້າງຮອບ: ${roundName}`,
      showCancelButton: true,
      confirmButtonText: 'ສ້າງເລີຍ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#27AE60',
    });
    if (result.isConfirmed) {
      await roundService.create(roundName, user.username);
      setRoundName('');
      setShowCreate(false);
      await load();
      Swal.fire({ icon: 'success', title: 'ສ້າງຮອບສຳເລັດ!', timer: 1200, showConfirmButton: false });
    }
  };

  const handleClose = async (round) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'ປິດຮອບຄຳສັ່ງຊື້?',
      text: `ປິດຮອບ "${round.name}" ຈະບໍ່ສາມາດຕື່ມຄຳສັ່ງຊື້ໃໝ່ໄດ້`,
      showCancelButton: true,
      confirmButtonText: 'ປິດຮອບ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#EF4444',
    });
    if (result.isConfirmed) {
      await roundService.close(round.id);
      await load();
    }
  };

  const openRounds = rounds.filter(r => r.status === 'open');
  const closedRounds = rounds.filter(r => r.status === 'closed');

  useEffect(() => {
    showMaintenanceAlert();
  }, []);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-bold text-green-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> List Order
          </h2>
          <p className="text-green-500 text-xs">ເລືອກຮອບຄຳສັ່ງຊື້ທີ່ຕ້ອງການຈັດການ</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm px-3 py-2">
          + ສ້າງຮອບ
        </button>
      </div>

      {/* Create round form */}
      {showCreate && (
        <div className="glass-card rounded-2xl p-4 mb-5 border-2 border-green-300">
          <p className="text-sm font-bold text-green-700 mb-3 flex items-center gap-1.5">
            <FilePlus className="w-4 h-4" /> ສ້າງຮອບຄຳສັ່ງຊື້ໃໝ່
          </p>
          <input
            className="input-field mb-3"
            placeholder="ໃສ່ຊື່ຮອບເຊັ່ນ Order_ຮອບທີ3 ຫຼື ຮອບເຊົ້າ..."
            value={roundName}
            onChange={e => setRoundName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1 text-sm py-2">ຍົກເລີກ</button>
            <button onClick={handleCreate} className="btn-primary flex-1 text-sm py-2">ສ້າງຮອບ ✓</button>
          </div>
        </div>
      )}

      {/* Open rounds */}
      <div className="mb-5">
        <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Circle className="w-3 h-3 fill-green-500 text-green-500" /> ຮອບທີ່ເປີດຢູ່ ({openRounds.length})
        </p>
        {openRounds.length === 0 && (
          <div className="glass-card rounded-2xl p-5 text-center text-green-400 text-sm">
            ບໍ່ມີຮອບທີ່ເປີດຢູ່ ກົດ "ສ້າງຮອບ" ເພື່ອເລີ່ມ
          </div>
        )}
        {openRounds.map(round => {
          const summary = summaries[round.id] || { count: 0, totalPrice: 0 };
          return (
            <div key={round.id} className="glass-card rounded-2xl p-4 mb-3 border-l-4 border-green-400">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-open">ເປີດຮັບ</span>
                    <h3 className="font-bold text-green-800 text-sm">{round.name}</h3>
                  </div>
                  <p className="text-xs text-green-500">ເປີດເມື່ອ: {formatDate(round.openAt)}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {summary.count} ລາຍການ · {formatPrice(summary.totalPrice)}
                  </p>
                </div>
                <button onClick={() => handleClose(round)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-all ml-2">
                  ປິດຮອບ
                </button>
              </div>
              <button
                onClick={() => onSelectRound(round)}
                className="btn-primary w-full text-sm py-2 mt-1"
              >
                ເບິ່ງລາຍການຄຳສັ່ງຊື້ →
              </button>
            </div>
          );
        })}
      </div>

      {/* Closed rounds */}
      {closedRounds.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Circle className="w-3 h-3 fill-gray-500 text-gray-500" /> ຮອບທີ່ປິດແລ້ວ ({closedRounds.length})
          </p>
          {closedRounds.map(round => {
            const summary = summaries[round.id] || { count: 0, totalPrice: 0 };
            return (
              <div key={round.id} className="glass-card rounded-2xl p-4 mb-3 border-l-4 border-gray-300 opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-closed">ປິດແລ້ວ</span>
                      <h3 className="font-bold text-gray-700 text-sm">{round.name}</h3>
                    </div>
                    <p className="text-xs text-gray-400">{formatDate(round.openAt)} — {formatDate(round.closeAt)}</p>
                    <p className="text-xs text-gray-500 mt-1">{summary.count} ລາຍການ · {formatPrice(summary.totalPrice)}</p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectRound(round)}
                  className="btn-secondary w-full text-sm py-2 mt-1"
                >
                  ເບິ່ງລາຍການ →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- ORDER DETAIL VIEW ----
function OrderDetailView({ round, onBack }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [form, setForm] = useState({ customerName: '', itemCount: '', totalPrice: '' });
  const { user } = useAuth();

  const load = async () => setOrders(await orderService.getByRound(round.id));
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [round.id]);

  const filtered = orders.filter(o => o.customerName.toLowerCase().includes(search.toLowerCase()));
  const totalPrice = filtered.reduce((s, o) => s + o.totalPrice, 0);

  const resetForm = () => { setForm({ customerName: '', itemCount: '', totalPrice: '' }); setEditOrder(null); setShowAddForm(false); };

  const handleSave = async () => {
    if (!form.customerName.trim() || !form.itemCount || !form.totalPrice) {
      Swal.fire({ icon: 'warning', title: 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບ', confirmButtonColor: '#27AE60' }); return;
    }
    if (editOrder) {
      await orderService.update(editOrder.id, { customerName: form.customerName, itemCount: parseInt(form.itemCount.replace(/,/g, '')), totalPrice: parseInt(form.totalPrice.replace(/,/g, '')) });
      Swal.fire({ icon: 'success', title: 'ແກ້ໄຂສຳເລັດ!', timer: 1200, showConfirmButton: false });
    } else {
      await orderService.create({
        roundId: round.id,
        customerName: form.customerName.trim(),
        itemCount: parseInt(form.itemCount.replace(/,/g, '')),
        totalPrice: parseInt(form.totalPrice.replace(/,/g, '')),
        addedBy: user?.username,
      });
      Swal.fire({ icon: 'success', title: 'ເພີ່ມສຳເລັດ!', timer: 1200, showConfirmButton: false });
    }
    await load(); resetForm();
  };

  const handleEdit = (order) => {
    setEditOrder(order);
    setForm({
      customerName: order.customerName,
      itemCount: formatNumber(order.itemCount),
      totalPrice: formatNumber(order.totalPrice),
    });
    setShowAddForm(true);
  };

  const handleDelete = async (order) => {
    const result = await Swal.fire({
      icon: 'warning', title: 'ລຶບຄຳສັ່ງຊື້?', text: `ລຶບລາຍການຂອງ ${order.customerName}?`,
      showCancelButton: true, confirmButtonText: 'ລຶບເລີຍ', cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#EF4444',
    });
    if (result.isConfirmed) { await orderService.delete(order.id); await load(); }
  };

  const isOpen = round.status === 'open';

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-green-200 text-green-600 hover:bg-green-50 shadow-sm">←</button>
        <div className="flex-1">
          <h2 className="font-display font-bold text-green-800 text-base">{round.name}</h2>
          <div className="flex items-center gap-2">
            <span className={isOpen ? 'badge-open' : 'badge-closed'}>
              <Circle className={`inline w-2.5 h-2.5 mr-1 ${isOpen ? 'fill-green-500 text-green-500' : 'fill-gray-500 text-gray-500'}`} />
              {isOpen ? 'ເປີດຮັບ' : 'ປິດແລ້ວ'}
            </span>
          </div>
        </div>
        {isOpen && (
          <button onClick={() => { setShowAddForm(true); setEditOrder(null); setForm({ customerName: '', itemCount: '', totalPrice: '' }); }} className="btn-primary text-sm px-3 py-2">
            + ເພີ່ມອໍເດີ
          </button>
        )}
      </div>

      {/* Edit / Add form */}
      {showAddForm && (
        <div className="glass-card rounded-2xl p-4 mb-4 border-2 border-yellow-300">
          <p className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: editOrder ? '#D97706' : '#16A34A' }}>
            {editOrder ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editOrder ? 'ແກ້ໄຂຄຳສັ່ງຊື້' : 'ເພີ່ມອໍເດີ'}
          </p>
          <div className="space-y-3">
            <input className="input-field" placeholder="ຊື່ລູກຄ້າ" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
            <input className="input-field" type="text" placeholder="ຈຳນວນລາຍການທີ່ສັ່ງ" value={form.itemCount} onChange={e => setForm({ ...form, itemCount: formatNumber(e.target.value) })} />
            <input className="input-field" type="text" placeholder="ຍອດລວມ (LAK)" value={form.totalPrice} onChange={e => setForm({ ...form, totalPrice: formatNumber(e.target.value) })} />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={resetForm} className="btn-secondary flex-1 text-sm py-2">ຍົກເລີກ</button>
            <button onClick={handleSave} className="btn-primary flex-1 text-sm py-2">ບັນທຶກ ✓</button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <p className="text-2xl font-bold text-green-700">{filtered.reduce((sum, order) => sum + order.itemCount, 0)}</p>
            <p className="text-xs text-green-500">ລາຍການທັງໝົດ</p>
          </div>
          <div className="w-px h-10 bg-green-200" />
          <div className="text-center flex-1">
            <p className="text-lg font-bold text-green-700">{totalPrice.toLocaleString()}</p>
            <p className="text-xs text-green-500">ຍອດລວມ (LAK)</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input className="input-field pl-10" placeholder="ຄົ້ນຫາຊື່ລູກຄ້າ..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="px-3 py-3 text-left text-xs font-semibold">#</th>
                <th className="px-3 py-3 text-left text-xs font-semibold">ລູກຄ້າ</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">ຈຳນວນ</th>
                <th className="px-3 py-3 text-right text-xs font-semibold">ຍອດ LAK</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">Admin</th>
                <th className="px-3 py-3 text-center text-xs font-semibold">ວັນທີ</th>
                {isOpen && <th className="px-3 py-3 text-center text-xs font-semibold">ຈັດການ</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-green-400">ບໍ່ພົບລາຍການ</td></tr>
              ) : filtered.map((order, idx) => (
                <tr key={order.id} className="table-row">
                  <td className="px-3 py-3 text-gray-500 text-xs">{idx + 1}</td>
                  <td className="px-3 py-3 font-semibold text-green-800 text-xs">{order.customerName}</td>
                  <td className="px-3 py-3 text-center text-xs">{order.itemCount} ຢ່າງ</td>
                  <td className="px-3 py-3 text-right font-semibold text-green-700 text-xs">{order.totalPrice.toLocaleString()}</td>
                  <td className="px-3 py-3 text-center text-xs text-gray-500">{order.addedBy}</td>
                  <td className="px-3 py-3 text-center text-xs text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  {isOpen && (
                    <td className="px-3 py-3 text-center">
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => handleEdit(order)} className="flex items-center justify-center bg-yellow-50 border border-yellow-300 text-yellow-700 p-1.5 rounded-lg hover:bg-yellow-100 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(order)} className="flex items-center justify-center bg-red-50 border border-red-300 text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- MAIN PAGE ----
export default function ListOrderPage() {
  const [selectedRound, setSelectedRound] = useState(null);

  if (selectedRound) return <OrderDetailView round={selectedRound} onBack={() => setSelectedRound(null)} />;
  return <RoundListView onSelectRound={setSelectedRound} />;
}
