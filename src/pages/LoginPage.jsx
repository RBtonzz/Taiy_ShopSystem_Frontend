import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Lock, User, KeyRound, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Swal.fire({ icon: 'warning', title: 'ກະລຸນາຕື່ມຂໍ້ມູນ', text: 'ກະລຸນາຕື່ມຊື່ຜູ້ໃຊ້ແລະລະຫັດຜ່ານ', confirmButtonColor: '#27AE60' });
      return;
    }
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (result.success) {
      Swal.fire({ icon: 'success', title: `ຍິນດີຕ້ອນຮັບ!`, text: `ເຂົ້າສູ່ລະບົບໃນຖານະ ${result.user.name}`, timer: 1500, showConfirmButton: false, confirmButtonColor: '#27AE60' });
      setTimeout(() => navigate('/management'), 1500);
    } else {
      Swal.fire({ icon: 'error', title: 'ເຂົ້າສູ່ລະບົບບໍ່ໄດ້', text: result.message, confirmButtonColor: '#27AE60' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10" style={{ background: 'linear-gradient(135deg, #F0FFF0 0%, #DCFFE4 50%, #A8E6CF33 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #27AE60, transparent)' }} />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3D9970, transparent)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Back button */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-green-600 mb-6 hover:text-green-800 transition-colors">
          <span>←</span> <span className="text-sm">ກັບໜ້າຫຼັກ</span>
        </button>

        <div className="glass-card rounded-3xl p-7">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-md" style={{ background: 'linear-gradient(135deg, #27AE60, #3D9970)' }}>
              <Lock className="text-white w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-green-800">ເຂົ້າສູ່ລະບົບ</h1>
            <p className="text-green-500 text-sm">Order Manager System</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-green-700 mb-1.5">
                <User className="w-4 h-4" /> ຊື່ຜູ້ໃຊ້
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="ຕື່ມຊື່ຜູ້ໃຊ້..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-green-700 mb-1.5">
                <KeyRound className="w-4 h-4" /> ລະຫັດຜ່ານ
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="ຕື່ມລະຫັດຜ່ານ..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button onClick={() => navigate('/')} className="btn-secondary flex-1 py-3">
              ຍົກເລີກ
            </button>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {loading ? 'ກຳລັງເຂົ້າສູ່ລະບົບ...' : 'ເຂົ້າສູ່ລະບົບ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
