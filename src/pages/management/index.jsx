import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ManagementLayout from '../../components/ManagementLayout';
import ListOrderPage from './ListOrderPage';
import HistoryPage from './HistoryPage';
import AddOrderPage from './AddOrderPage';

export default function ManagementPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-honeydew">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-3">🍃</div>
        <p className="text-green-600">ກຳລັງໂຫຼດ...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <ManagementLayout>
      <Routes>
        <Route path="/" element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<ListOrderPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="add" element={<AddOrderPage />} />
      </Routes>
    </ManagementLayout>
  );
}
