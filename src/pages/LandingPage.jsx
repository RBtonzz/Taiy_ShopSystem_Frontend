import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-honeydew flex flex-col" style={{ background: 'linear-gradient(135deg, #F0FFF0 0%, #DCFFE4 50%, #A8E6CF33 100%)' }}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #27AE60, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3D9970, transparent)' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-5 py-10 max-w-lg mx-auto w-full">
        {/* Header Shop Info */}
        <div className="text-center mb-5 mt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #27AE60, #3D9970)' }}>
            <span className="text-4xl">🍃</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-green-800 mb-2">
            Saengmani Shop
          </h1>
          <p className="text-green-600 text-base leading-relaxed px-4">
            ລະບົບຈັດການຄຳສັ່ງຊື້ຂອງລູກຄ້າ<br />
            <span className="text-sm text-green-500">ໄວ, ງ່າຍ ແລະ ຖືກຕ້ອງ</span>
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-5">
          {['📋 ບັນທຶກຄຳສັ່ງຊື້', '📊 ສະຫຼຸບຍອດ', '📤 Export PDF'].map(f => (
            <span key={f} className="bg-white/70 text-green-700 text-xs px-3 py-1.5 rounded-full border border-green-200 font-medium shadow-sm">
              {f}
            </span>
          ))}
        </div>

        {/* Login System Card */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">🔐</span>
            </div>
            <h2 className="font-display text-lg font-bold text-green-800">
              Login System
            </h2>
          </div>
          <p className="text-green-600 text-sm leading-relaxed text-center mb-5">
            ລະບົບເຂົ້າສູ່ລະບົບເພື່ອຄວບຄຸມສິດການນຳໃຊ້
        
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            <span>🚀</span> ເຂົ້າສູ່ລະບົບ Login
          </button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '⚡', label: 'ໄວ', desc: 'ຕື່ມຄຳສັ່ງຊື້ທັນທີ' },
            { icon: '📦', label: 'ແຍກຮອບ', desc: 'ຈັດການຫຼາຍຮອບ' },
            { icon: '💰', label: 'ລວມຍອດ', desc: 'ຄຳນວນອັດຕະໂນມັດ' },
          ].map(item => (
            <div key={item.label} className="glass-card rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-bold text-green-800">{item.label}</div>
              <div className="text-xs text-green-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
