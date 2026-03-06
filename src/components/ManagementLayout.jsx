import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const navItems = [
  { path: '/management/orders', icon: '📋', label: 'List Order' },
  { path: '/management/history', icon: '🕐', label: 'History' },
  { path: '/management/add', icon: '➕', label: 'Add Order' },
];

export default function ManagementLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      icon: 'question',
      title: 'ອອກຈາກລະບົບ?',
      text: 'ທ່ານຕ້ອງການອອກຈາກລະບົບຫຼືບໍ່?',
      showCancelButton: true,
      confirmButtonText: 'ອອກຈາກລະບົບ',
      cancelButtonText: 'ຍົກເລີກ',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#27AE60',
    }).then(result => {
      if (result.isConfirmed) {
        logout();
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #F0FFF0 0%, #DCFFE4 100%)' }}>
      {/* Top Bar */}
      <div className="glass-card sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-green-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #27AE60, #3D9970)' }}>
            <span className="text-white text-sm">🍃</span>
          </div>
          <div>
            <p className="font-display font-bold text-green-800 text-sm leading-none">Order Manager</p>
            <p className="text-green-500 text-xs">👤 {user?.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
        >
          <span>🚪</span> Logout
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-green-200 px-4 py-2">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? 'active' : ''} min-w-[72px]`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
