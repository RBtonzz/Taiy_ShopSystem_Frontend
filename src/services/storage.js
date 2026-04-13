// ============================================================
// API SERVICE - Real backend calls using axios
// ============================================================

import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://taiy-shop-server-vovw.onrender.com/api',
  timeout: 10000,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('om_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle timeout / network errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
    const isNetwork = !error.response;

    if (isTimeout || isNetwork) {
      Swal.fire({
        icon: 'error',
        title: 'ໂຫຼດຂໍ້ມູນບໍ່ໄດ້',
        html: '<p style="font-size:14px;color:#555">ບໍ່ສາມາດເຊື່ອມຕໍ່ເຊີບເວີໄດ້<br><span style="color:#EF4444">Internet Error</span><br><br>ກວດສອບ internet ແລ້ວລອງໃໝ່ອີກຄັ້ງ</p>',
        confirmButtonText: 'ລອງໃໝ່',
        confirmButtonColor: '#27AE60',
        showCancelButton: false,
      });
    }
    return Promise.reject(error);
  }
);

// ---- AUTH ----
export const authService = {
  async login(username, password) {
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('om_token', data.token);
      localStorage.setItem('om_session', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  },
  logout() {
    localStorage.removeItem('om_token');
    localStorage.removeItem('om_session');
  },
  getSession() {
    const s = localStorage.getItem('om_session');
    return s ? JSON.parse(s) : null;
  },
};

// ---- ROUNDS ----
export const roundService = {
  async getAll() {
    const { data } = await api.get('/rounds');
    return data;
  },
  async getById(id) {
    const { data } = await api.get(`/rounds/${id}`);
    return data;
  },
  async create(name, createdBy) {
    const { data } = await api.post('/rounds', { name, createdBy });
    return data;
  },
  async close(id) {
    const { data } = await api.patch(`/rounds/${id}/close`);
    return data;
  },
  async getOpenRounds() {
    const { data } = await api.get('/rounds/open');
    return data;
  },
};

// ---- ORDERS ----
export const orderService = {
  async getByRound(roundId) {
    const { data } = await api.get(`/orders/round/${roundId}`);
    return data;
  },
  async create(order) {
    const { data } = await api.post('/orders', order);
    return data;
  },
  async update(id, order) {
    const { data } = await api.put(`/orders/${id}`, order);
    return data;
  },
  async delete(id) {
    await api.delete(`/orders/${id}`);
  },
  async getSummary(roundId) {
    const { data } = await api.get(`/rounds/${roundId}/summary`);
    return data;
  },
};
