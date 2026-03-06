// ============================================================
// STORAGE SERVICE - Mock localStorage (ຕົວຢ່າງເພື່ອເຊື່ອມຕໍ່ API)
// ເມື່ອຕ້ອງການເຊື່ອມ backend ໃຫ້ແທນທີ່ຟັງຊັນໃນ apiService.js
// ============================================================

const KEYS = {
  USERS: 'om_users',
  ROUNDS: 'om_rounds',
  ORDERS: 'om_orders',
  SESSION: 'om_session',
};

// ---- INIT MOCK DATA ----
export function initMockData() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([
      { id: 'u1', username: 'admin', password: 'admin123', name: 'Taiy', role: 'admin' },
      { id: 'u2', username: 'bo', password: 'bo123', name: 'Bo', role: 'staff' },
    ]));
  }
  if (!localStorage.getItem(KEYS.ROUNDS)) {
    const now = new Date();
    localStorage.setItem(KEYS.ROUNDS, JSON.stringify([
      {
        id: 'r1',
        name: 'Order_1',
        openAt: new Date(now.getTime() - 3600000).toISOString(),
        closeAt: null,
        status: 'open',
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
      },
      {
        id: 'r2',
        name: 'Order_2',
        openAt: new Date(now.getTime() - 7200000).toISOString(),
        closeAt: new Date(now.getTime() - 1800000).toISOString(),
        status: 'closed',
        createdBy: 'admin',
        createdAt: new Date(now.getTime() - 7200000).toISOString(),
      },
    ]));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([
      { id: 'o1', roundId: 'r1', customerName: 'MTonz', itemCount: 3, totalPrice: 85000, addedBy: 'admin', createdAt: new Date().toISOString() },
      { id: 'o2', roundId: 'r1', customerName: 'Bo', itemCount: 1, totalPrice: 25000, addedBy: 'admin', createdAt: new Date().toISOString() },
      { id: 'o3', roundId: 'r2', customerName: 'Taiy', itemCount: 5, totalPrice: 150000, addedBy: 'staff1', createdAt: new Date().toISOString() },
    ]));
  }
}

// ---- HELPERS ----
function getAll(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function setAll(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }

// ---- AUTH ----
export const authService = {
  login(username, password) {
    const users = getAll(KEYS.USERS);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' };
    const session = { userId: user.id, username: user.username, name: user.name, role: user.role };
    localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    return { success: true, user: session };
  },
  logout() { localStorage.removeItem(KEYS.SESSION); },
  getSession() {
    const s = localStorage.getItem(KEYS.SESSION);
    return s ? JSON.parse(s) : null;
  },
};

// ---- ROUNDS ----
export const roundService = {
  getAll() { return getAll(KEYS.ROUNDS).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); },
  getById(id) { return getAll(KEYS.ROUNDS).find(r => r.id === id); },
  create(name, username) {
    const rounds = getAll(KEYS.ROUNDS);
    const newRound = {
      id: generateId(),
      name,
      openAt: new Date().toISOString(),
      closeAt: null,
      status: 'open',
      createdBy: username,
      createdAt: new Date().toISOString(),
    };
    rounds.push(newRound);
    setAll(KEYS.ROUNDS, rounds);
    return newRound;
  },
  close(id) {
    const rounds = getAll(KEYS.ROUNDS);
    const idx = rounds.findIndex(r => r.id === id);
    if (idx !== -1) {
      rounds[idx].status = 'closed';
      rounds[idx].closeAt = new Date().toISOString();
      setAll(KEYS.ROUNDS, rounds);
    }
  },
  getOpenRounds() { return getAll(KEYS.ROUNDS).filter(r => r.status === 'open'); },
};

// ---- ORDERS ----
export const orderService = {
  getByRound(roundId) {
    return getAll(KEYS.ORDERS)
      .filter(o => o.roundId === roundId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  create(data) {
    const orders = getAll(KEYS.ORDERS);
    const newOrder = { id: generateId(), ...data, createdAt: new Date().toISOString() };
    orders.push(newOrder);
    setAll(KEYS.ORDERS, orders);
    return newOrder;
  },
  update(id, data) {
    const orders = getAll(KEYS.ORDERS);
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx] = { ...orders[idx], ...data, updatedAt: new Date().toISOString() };
      setAll(KEYS.ORDERS, orders);
      return orders[idx];
    }
    return null;
  },
  delete(id) {
    const orders = getAll(KEYS.ORDERS).filter(o => o.id !== id);
    setAll(KEYS.ORDERS, orders);
  },
  getSummary(roundId) {
    const orders = getAll(KEYS.ORDERS).filter(o => o.roundId === roundId);
    return {
      count: orders.length,
      totalPrice: orders.reduce((sum, o) => sum + o.totalPrice, 0),
    };
  },
};
