import Swal from 'sweetalert2';

// ===== เปิด/ปิดแจ้งเตือนปรับปรุงระบบ — แก้ที่นี่จุดเดียว =====
// เปิด → true  |  ปิด → false

const SHOW_MAINTENANCE_ALERT = true;
// const SHOW_MAINTENANCE_ALERT = false;

// ============================================================

export const showMaintenanceAlert = () => {
    if (!SHOW_MAINTENANCE_ALERT) return;
    Swal.fire({
        icon: 'warning',
        title: '⚠️ ແຈ້ງເຕືອນປັບປຸງລະບົບ ⚠️',
        html: `ກຳລັງຈະປິດປັບປຸງເວລາ <b>23:00PM - 02:00AM</b> ວັນທີ <b>02/04/2026</b><br/><br/>
               ລະບົບອາດຈະໃຊ້ງານບໍ່ໄດ້ໃນເວລາດັ່ງກ່າວ<br/>
               ສາມາດປ້ອນກ່ອນ ຫຼື ປ້ອນໃໝ່ໃນເວລາ <b>03:00AM ວັນທີ 3/04/2026</b> ຂື້ນໄປ<br/><br/>
               <b>&#128522; Bo huk ploy &#128522;</b>`,
        confirmButtonText: '~ ປິດແຈ້ງເຕືອນ ~',
        confirmButtonColor: '#e90bf5',
        customClass: { popup: 'swal-maintenance' },
    });
};