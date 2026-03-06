import { useState, useEffect } from 'react';
import { roundService, orderService } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function AddOrderPage() {
  const { user } = useAuth();
  const [openRounds, setOpenRounds] = useState([]);
  const [form, setForm] = useState({ customerName: '', itemCount: '', totalPrice: '', roundId: '' });
  const [lastAdded, setLastAdded] = useState([]);

  function formatNumber(str) {
  // remove non-digits then add commas
  const digits = String(str).replace(/[^0-9]/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

  useEffect(() => {
    const rounds = roundService.getOpenRounds();
    setOpenRounds(rounds);
    if (rounds.length > 0) setForm(f => ({ ...f, roundId: rounds[0].id }));
  }, []);

  const handleChange = (field, val) => {
    if (field === 'itemCount' || field === 'totalPrice') {
      val = formatNumber(val);
    }
    setForm(f => ({ ...f, [field]: val }));
  };

  const handleSubmit = async () => {
    if (!form.customerName.trim() || !form.itemCount || !form.totalPrice || !form.roundId) {
      Swal.fire({ icon: 'warning', title: 'ກະລຸນາຕື່ມຂໍ້ມູນໃຫ້ຄົບ', text: 'ຊື່ລູກຄ້າ ຈຳນວນລາຍການ ຍອດລວມ ແລະເລືອກຮອບ', confirmButtonColor: '#27AE60' });
      return;
    }
    const round = openRounds.find(r => r.id === form.roundId);
    const price = parseInt(form.totalPrice.replace(/,/g, ''));
    const items = parseInt(form.itemCount.replace(/,/g, ''));

    const result = await Swal.fire({
      icon: 'info',
      title: '✅ ກວດສອບຂໍ້ມູນ',
      html: `
        <div style="text-align:left;font-family:'Noto Sans Lao',sans-serif;font-size:15px;line-height:2">
          <p>👤 <strong>ລູກຄ້າ:</strong> ${form.customerName}</p>
          <p>📦 <strong>ຈຳນວນລາຍການ:</strong> ${items} ຢ່າງ</p>
          <p>💰 <strong>ຍອດລວມ:</strong> ${price.toLocaleString()} LAK</p>
          <p>📋 <strong>ຮອບຄຳສັ່ງຊື້:</strong> ${round?.name}</p>
          <p>👩‍💼 <strong>ບັນທຶກໂດຍ:</strong> ${user?.username}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ບັນທຶກເລີຍ ✓',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#27AE60',
      cancelButtonColor: '#9ca3af',
    });

    if (result.isConfirmed) {
      const newOrder = orderService.create({
        roundId: form.roundId,
        customerName: form.customerName.trim(),
        itemCount: items,
        totalPrice: price,
        addedBy: user?.username,
      });
      setLastAdded(prev => [{ ...newOrder, roundName: round?.name }, ...prev].slice(0, 5));
      setForm(f => ({ ...f, customerName: '', itemCount: '', totalPrice: '' }));

      await Swal.fire({
        icon: 'success',
        title: 'ບັນທຶກສຳເລັດ! 🎉',
        text: `ຕື່ມຄຳສັ່ງຊື້ຂອງ ${newOrder.customerName} ແລ້ວ`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      <div className="mb-5">
        <h2 className="font-display text-xl font-bold text-green-800">➕ Add Order</h2>
        <p className="text-green-500 text-xs">ຕື່ມຄຳສັ່ງຊື້ໃໝ່ໄວວາ</p>
      </div>

      {openRounds.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-bold text-green-700 mb-1">ບໍ່ມີຮອບຄຳສັ່ງຊື້ທີ່ເປີດຢູ່</p>
          <p className="text-sm text-green-500">ກະລຸນາໄປສ້າງຮອບຄຳສັ່ງຊື້ໃໝ່ທີ່ໜ້າ List Order ກ່ອນ</p>
        </div>
      ) : (
        <>
          <div className="glass-card rounded-2xl p-5 mb-5">
            <div className="space-y-4">
              {/* Round selector */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-1.5">📋 ຮອບຄຳສັ່ງຊື້</label>
                <select
                  className="input-field"
                  value={form.roundId}
                  onChange={e => handleChange('roundId', e.target.value)}
                >
                  {openRounds.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Customer name */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-1.5">👤 ຊື່ລູກຄ້າ</label>
                <input
                  className="input-field"
                  placeholder="ຕື່ມຊື່ລູກຄ້າ..."
                  value={form.customerName}
                  onChange={e => handleChange('customerName', e.target.value)}
                />
              </div>

              {/* Item count + price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1.5">📦 ຈຳນວນລາຍການ</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="0"
                    value={form.itemCount}
                    onChange={e => handleChange('itemCount', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1.5">💰 ຍອດລວມ (LAK)</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="0"
                    value={form.totalPrice}
                    onChange={e => handleChange('totalPrice', e.target.value)}
                  />
                </div>
              </div>

              {/* Preview bar */}
              {form.customerName && form.totalPrice && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                  <p className="text-green-600">
                    <span className="font-bold">{form.customerName}</span> · {form.itemCount || 0} ຢ່າງ · <span className="font-bold">{form.totalPrice || 0} LAK</span>
                  </p>
                </div>
              )}

              <button onClick={handleSubmit} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                <span>💾</span> ບັນທຶກຄຳສັ່ງຊື້
              </button>
            </div>
          </div>

          {/* Recent added */}
          {lastAdded.length > 0 && (
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">✅ ຕື່ມລ່າສຸດ</p>
              {lastAdded.map((o, i) => (
                <div key={i} className="glass-card rounded-xl p-3 mb-2 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800 text-sm">{o.customerName}</p>
                    <p className="text-xs text-green-500">{o.roundName} · {o.itemCount} ຢ່າງ</p>
                  </div>
                  <span className="font-bold text-green-700 text-sm">{o.totalPrice.toLocaleString()} LAK</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
