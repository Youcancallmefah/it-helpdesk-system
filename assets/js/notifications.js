/* ========================================
   NOTIFICATIONS.JS — Realtime UI Simulation
   จัดการ Toast + Notification Panel + Realtime updates
======================================== */

const NotificationSystem = (function () {
  'use strict';

  /* ─────────────────────────────────────────
     Constants (ค่าคงที่ปรับได้)
  ───────────────────────────────────────── */
  const TOAST_DURATION    = 4000;   /* toast หายหลัง 4 วินาที */
  const REALTIME_INTERVAL = 8000;   /* event ใหม่ทุก 8 วินาที */
  const STATS_INTERVAL    = 15000;  /* stat card อัปเดตทุก 15 วินาที */

  /* ─────────────────────────────────────────
     Pool of fake events สำหรับ simulation
  ───────────────────────────────────────── */
  const FAKE_EVENTS = [
    { type: 'success', title: 'Ticket Resolved',  message: 'Ticket #1042 has been resolved by Sarah K.',    icon: 'fa-circle-check',        activity: 'Ticket #1042 resolved',       activityIcon: 'fa-circle-check',  activityColor: '#22c55e' },
    { type: 'info',    title: 'New Ticket',        message: 'Alex M. submitted a new hardware request.',     icon: 'fa-ticket',              activity: 'New ticket #1058 submitted',  activityIcon: 'fa-ticket',        activityColor: '#6366f1' },
    { type: 'warning', title: 'SLA Warning',       message: 'Ticket #1039 is approaching SLA deadline.',     icon: 'fa-triangle-exclamation',activity: 'SLA warning on #1039',        activityIcon: 'fa-clock',         activityColor: '#f59e0b' },
    { type: 'success', title: 'User Created',      message: 'New user account created for Mike Johnson.',    icon: 'fa-user-plus',           activity: 'New user Mike Johnson added', activityIcon: 'fa-user-plus',     activityColor: '#22c55e' },
    { type: 'info',    title: 'Ticket Assigned',   message: 'Ticket #1055 assigned to David L.',            icon: 'fa-user-check',          activity: 'Ticket #1055 assigned',       activityIcon: 'fa-user-check',    activityColor: '#6366f1' },
    { type: 'danger',  title: 'System Alert',      message: 'High CPU usage detected on server NODE-04.',   icon: 'fa-server',              activity: 'Alert: NODE-04 high CPU',     activityIcon: 'fa-server',        activityColor: '#ef4444' },
    { type: 'success', title: 'Backup Complete',   message: 'Weekly backup completed successfully.',         icon: 'fa-database',            activity: 'Weekly backup completed',     activityIcon: 'fa-database',      activityColor: '#22c55e' },
    { type: 'info',    title: 'Software Update',   message: 'Antivirus definitions updated on 24 devices.', icon: 'fa-shield-halved',       activity: '24 devices updated',          activityIcon: 'fa-shield-halved', activityColor: '#6366f1' },
  ];

  let toastIdCounter = 0;   /* ID ไม่ซ้ำสำหรับแต่ละ toast */
  let eventIndex     = 0;   /* วนผ่าน FAKE_EVENTS ตามลำดับ */
  let unreadCount    = 0;   /* จำนวน unread notification */

  /* ─────────────────────────────────────────
     INIT — เรียกครั้งเดียวตอนเริ่มระบบ
  ───────────────────────────────────────── */
  function init() {
    if ($('#notificationBtn').length === 0) return; /* ไม่ใช่หน้า dashboard → ออก */

    bindNotificationPanel();    /* ผูก event ปุ่ม bell + overlay */
    startRealtimeSimulation();  /* เริ่ม setInterval สร้าง toast ใหม่ */
    startStatsSimulation();     /* เริ่ม setInterval อัปเดต stat cards */

    console.log('🔔 NotificationSystem initialized');
  }

  /* ─────────────────────────────────────────
     SHOW TOAST — แสดงข้อความชั่วคราว มุมขวาบน
  ───────────────────────────────────────── */
  function showToast(type, title, message) {
    const id = `toast-${++toastIdCounter}`;   /* ID ไม่ซ้ำกัน */
    const icons = {
      success: 'fa-circle-check',
      danger:  'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info:    'fa-circle-info',
    };

    const html = `
      <div class="toast toast--${type}" id="${id}" style="--toast-duration:${TOAST_DURATION}ms" role="alert">
        <div class="toast__icon">
          <i class="fa-solid ${icons[type] || icons.info}"></i>
        </div>
        <div class="toast__body">
          <div class="toast__title">${title}</div>
          <div class="toast__message">${message}</div>
        </div>
        <button class="toast__close" data-id="${id}" aria-label="Close">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;

    const $toast = $(html);
    $('#toastContainer').prepend($toast);   /* ใส่ไว้บนสุด */

    /* Animate เข้า — เลื่อนจากขวา */
    gsap.fromTo(`#${id}`,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', clearProps: 'all' }
    );

    /* ผูกปุ่ม close */
    $toast.find('.toast__close').on('click', function () {
      dismissToast($(this).data('id'));
    });

    /* Auto-dismiss หลัง TOAST_DURATION ms */
    setTimeout(function () {
      dismissToast(id);
    }, TOAST_DURATION + 200);   /* +200ms รอ progress bar หมดก่อน */
  }

  /* ─────────────────────────────────────────
     DISMISS TOAST — เลื่อนออกแล้วลบ
  ───────────────────────────────────────── */
  function dismissToast(id) {
    const $t = $(`#${id}`);
    if ($t.length === 0) return;   /* ถ้าไม่มีแล้ว → ข้าม */

    gsap.to(`#${id}`, {
      opacity: 0,
      x: 60,                      /* เลื่อนออกไปขวา */
      duration: 0.25,
      ease: 'power2.in',
      onComplete: function () { $t.remove(); },
    });
  }

  /* ─────────────────────────────────────────
     NOTIFICATION PANEL — เปิด/ปิด panel ขวา
  ───────────────────────────────────────── */
  function bindNotificationPanel() {
    /* คลิก bell → toggle panel */
    $('#notificationBtn').on('click', function (e) {
      e.stopPropagation();   /* ไม่ให้ event ลอยขึ้นไปปิด panel ทันที */
      const isOpen = $('#notificationPanel').hasClass('is-open');
      if (isOpen) {
        closePanel();
      } else {
        openPanel();
      }
    });

    /* คลิก overlay → ปิด panel */
    $('#notificationOverlay').on('click', function () {
      closePanel();
    });

    /* ปุ่ม Mark all read */
    $('#markAllRead').on('click', function () {
      $('#notificationList .notif-item').removeClass('is-unread');   /* เอา highlight ออก */
      unreadCount = 0;
      updateBadge();
    });
  }

  function openPanel() {
    $('#notificationPanel').addClass('is-open');
    $('#notificationOverlay').addClass('is-active');
  }

  function closePanel() {
    $('#notificationPanel').removeClass('is-open');
    $('#notificationOverlay').removeClass('is-active');
  }

  /* ─────────────────────────────────────────
     ADD NOTIFICATION ITEM ใน panel
  ───────────────────────────────────────── */
  function addNotificationItem(event) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const html = `
      <div class="notif-item is-unread">
        <div class="notif-item__icon notif-item__icon--${event.type}">
          <i class="fa-solid ${event.icon}"></i>
        </div>
        <div class="notif-item__body">
          <div class="notif-item__text">
            <strong>${event.title}</strong> — ${event.message}
          </div>
          <div class="notif-item__time">${timeStr}</div>
        </div>
      </div>
    `;

    $('#notificationList').prepend(html);   /* ใส่ไว้บนสุดของ list */

    /* เกิน 10 รายการ → ลบอันล่างสุดออก (ประหยัด DOM) */
    const $items = $('#notificationList .notif-item');
    if ($items.length > 10) {
      $items.last().remove();
    }

    unreadCount++;
    updateBadge();
  }

  /* ─────────────────────────────────────────
     UPDATE BADGE (ตัวเลขบน bell icon)
  ───────────────────────────────────────── */
  function updateBadge() {
    const $badge = $('#notificationBadge');
    if (unreadCount > 0) {
      $badge.text(unreadCount > 99 ? '99+' : unreadCount).show();
    } else {
      $badge.hide();
    }
  }

  /* ─────────────────────────────────────────
     REALTIME SIMULATION — สร้าง event ใหม่ทุก 8 วินาที
  ───────────────────────────────────────── */
  function startRealtimeSimulation() {
    setInterval(function () {
      const event = FAKE_EVENTS[eventIndex % FAKE_EVENTS.length];   /* วนซ้ำ pool */
      eventIndex++;

      showToast(event.type, event.title, event.message);   /* toast มุมขวาบน */
      addNotificationItem(event);                           /* เพิ่มใน panel */
      addActivityItem(event);                               /* เพิ่มใน activity feed */

    }, REALTIME_INTERVAL);
  }

  /* ─────────────────────────────────────────
     ADD ACTIVITY ITEM ใน feed (หน้า dashboard)
  ───────────────────────────────────────── */
  function addActivityItem(event) {
    const $feed = $('#activityFeed');
    if ($feed.length === 0) return;   /* ไม่มี feed → ออก */

    const html = `
      <div class="activity-item">
        <div class="activity-item__icon" style="background:${event.activityColor}20;color:${event.activityColor}">
          <i class="fa-solid ${event.activityIcon}"></i>
        </div>
        <div class="activity-item__body">
          <div class="activity-item__text">${event.activity}</div>
          <div class="activity-item__time">Just now</div>
        </div>
      </div>
    `;

    const $item = $(html);
    $feed.prepend($item);   /* ใส่ไว้บนสุด */

    /* Animate เข้า — เลื่อนจากซ้าย */
    gsap.fromTo($item[0],
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
    );

    /* เกิน 8 รายการ → ลบอันล่างสุดพร้อม animation */
    const $allItems = $feed.find('.activity-item');
    if ($allItems.length > 8) {
      gsap.to($allItems.last()[0], {
        opacity: 0,
        height: 0,
        marginBottom: 0,
        duration: 0.3,
        onComplete: function () { $allItems.last().remove(); },
      });
    }
  }

  /* ─────────────────────────────────────────
     STATS SIMULATION — อัปเดต stat cards ทุก 15 วินาที
  ───────────────────────────────────────── */
  function startStatsSimulation() {
    setInterval(function () {
      /* สุ่มค่าใหม่ในช่วงที่สมจริงกับข้อมูลจริงใน mock-tickets.json
         Total=15, Open=4, Resolved=5 → สุ่มใกล้เคียงค่าจริง */
      updateStatCard('#counterTotal',    12, 18);
      updateStatCard('#counterOpen',      2,  7);
      updateStatCard('#counterResolved',  3,  8);
    }, STATS_INTERVAL);
  }

  /* ─────────────────────────────────────────
     UPDATE STAT CARD — animate ตัวเลขใหม่
  ───────────────────────────────────────── */
  function updateStatCard(selector, min, max) {
    const $el = $(selector);
    if ($el.length === 0) return;

    const newVal  = Math.floor(Math.random() * (max - min + 1)) + min;
    const current = parseInt($el.text().replace(/,/g, ''), 10) || 0;
    const obj     = { val: current };   /* object ที่ GSAP จะ animate ค่าภายใน */

    gsap.to(obj, {
      val: newVal,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: function () {
        $el.text(Math.round(obj.val).toLocaleString());
      },
    });
  }

  /* เปิดเผยเฉพาะ public methods */
  return { init, showToast };
})();
