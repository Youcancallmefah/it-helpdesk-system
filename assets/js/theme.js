/* ========================================
   THEME.JS — Dark Mode System (Step 9)
   จัดการ light/dark mode ทั้งระบบ
   ทำงานทุกหน้า (index + tickets)
======================================== */

const ThemeSystem = (function () {
  'use strict';

  const STORAGE_KEY = 'helpdesk-theme';  /* key ที่ใช้เก็บใน localStorage */

  /* ─────────────────────────────────────────
     INIT — เรียกครั้งเดียวตอนเปิดหน้า
  ───────────────────────────────────────── */
  function init() {
    const theme = getSavedTheme();   /* อ่านจาก localStorage หรือ OS */
    applyTheme(theme);               /* set data-theme attribute */
    bindToggleBtn();                 /* ผูก event ปุ่ม toggle */
    listenOSChange();                /* ฟัง OS เปลี่ยน theme */

    /* อัปเดตสี Chart.js หลัง charts.js โหลดเสร็จ
       ใช้ setTimeout เพราะ charts.js รันหลัง theme.js เล็กน้อย */
    setTimeout(function () {
      updateCharts(getCurrentTheme());
    }, 300);
  }

  /* ─────────────────────────────────────────
     GET SAVED THEME
     ลำดับ priority: localStorage → OS → default (light)
  ───────────────────────────────────────── */
  function getSavedTheme() {
    /* 1. เช็ค localStorage ก่อน (ผู้ใช้เคยเลือกเอง) */
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;

    /* 2. ถ้าไม่มี → ดู OS preference
       prefers-color-scheme = media query บอก theme ของ OS */
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    /* 3. default = light */
    return 'light';
  }

  /* ─────────────────────────────────────────
     GET CURRENT THEME (อ่านจาก HTML attribute)
  ───────────────────────────────────────── */
  function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  /* ─────────────────────────────────────────
     APPLY THEME
     set data-theme บน <html> → CSS variables override ทันที
  ───────────────────────────────────────── */
  function applyTheme(theme) {
    /* document.documentElement = <html> element */
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleIcon(theme);       /* เปลี่ยน icon ปุ่ม */
    updateCharts(theme);           /* อัปเดตสี Chart.js */
    updateMetaTheme(theme);        /* อัปเดต browser UI color (mobile) */
  }

  /* ─────────────────────────────────────────
     TOGGLE — สลับ light ↔ dark แล้ว save
  ───────────────────────────────────────── */
  function toggle() {
    const current = getCurrentTheme();
    const next    = current === 'dark' ? 'light' : 'dark';

    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);   /* จำไว้ใน localStorage */
  }

  /* ─────────────────────────────────────────
     BIND TOGGLE BUTTON
  ───────────────────────────────────────── */
  function bindToggleBtn() {
    $('#themeToggle').on('click', function () {
      toggle();

      /* GSAP micro-animation: หมุน icon เมื่อ toggle */
      gsap.fromTo('#themeToggle i',
        { rotate: -30, scale: 0.7 },
        { rotate: 0,   scale: 1, duration: 0.4, ease: 'back.out(2)', clearProps: 'all' }
      );
    });
  }

  /* ─────────────────────────────────────────
     UPDATE TOGGLE ICON (sun ↔ moon)
  ───────────────────────────────────────── */
  function updateToggleIcon(theme) {
    const $icon = $('#themeToggle i');
    if (theme === 'dark') {
      $icon.removeClass('fa-moon').addClass('fa-sun');     /* dark mode → แสดง sun (สลับกลับ) */
    } else {
      $icon.removeClass('fa-sun').addClass('fa-moon');     /* light mode → แสดง moon (สลับไป dark) */
    }
  }

  /* ─────────────────────────────────────────
     UPDATE CHART.JS COLORS
     Chart.js ไม่รู้เรื่อง CSS variables
     → ต้อง set สีด้วย JS เอง
  ───────────────────────────────────────── */
  function updateCharts(theme) {
    if (typeof Chart === 'undefined') return;   /* Chart.js ยังไม่โหลด → ออก */

    /* อ่านค่าสีจาก CSS variable ที่ถูก set ไปแล้ว */
    const style     = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--text-secondary').trim();
    const gridColor = style.getPropertyValue('--border-color').trim();
    /* getComputedStyle = อ่านค่า CSS จริงที่ browser คำนวณแล้ว รวม override จาก [data-theme] */

    /* อัปเดต global defaults สำหรับ chart ใหม่ที่จะสร้างหลังจากนี้ */
    Chart.defaults.color       = textColor;
    Chart.defaults.borderColor = gridColor;

    /* อัปเดต chart ที่มีอยู่แล้วในหน้า */
    Object.values(Chart.instances).forEach(function (chart) {
      /* อัปเดต scale (แกน X, Y) */
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach(function (scale) {
          if (scale.grid)  scale.grid.color  = gridColor;
          if (scale.ticks) scale.ticks.color = textColor;
        });
      }

      /* อัปเดต legend text */
      if (chart.options.plugins && chart.options.plugins.legend) {
        if (chart.options.plugins.legend.labels) {
          chart.options.plugins.legend.labels.color = textColor;
        }
      }

      /* 'none' = apply ทันที ไม่มี transition animation (เพราะ theme เปลี่ยนแล้ว) */
      chart.update('none');
    });
  }

  /* ─────────────────────────────────────────
     UPDATE META THEME COLOR
     เปลี่ยนสี browser toolbar บนมือถือ
  ───────────────────────────────────────── */
  function updateMetaTheme(theme) {
    let $meta = $('meta[name="theme-color"]');
    if ($meta.length === 0) {
      /* ถ้ายังไม่มี meta tag → สร้างใหม่ */
      $meta = $('<meta name="theme-color">').appendTo('head');
    }
    $meta.attr('content', theme === 'dark' ? '#1e293b' : '#ffffff');
  }

  /* ─────────────────────────────────────────
     LISTEN OS CHANGE
     ถ้าผู้ใช้เปลี่ยน OS theme (เช่น กด auto dark ใน Mac)
     → อัปเดตตาม (เฉพาะกรณีที่ผู้ใช้ไม่เคย override เอง)
  ───────────────────────────────────────── */
  function listenOSChange() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      /* ถ้ามีค่าใน localStorage = ผู้ใช้เลือกเอง → ไม่ override */
      if (localStorage.getItem(STORAGE_KEY)) return;

      applyTheme(e.matches ? 'dark' : 'light');
    });
  }

  /* เปิดเผย public methods */
  return { init, toggle, applyTheme };
})();

/* ─────────────────────────────────────────
   Auto-init เมื่อ DOM พร้อม
   ทำงานทั้งหน้า index.html และ tickets.html
───────────────────────────────────────── */
$(document).ready(function () {
  ThemeSystem.init();
});
