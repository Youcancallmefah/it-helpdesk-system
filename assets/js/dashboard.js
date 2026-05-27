/* ========================================
   DASHBOARD.JS — Dashboard Page Logic
======================================== */

(function () {
  'use strict';

  $(document).ready(function () {
    /* เช็คว่าอยู่หน้า dashboard จริง */
    if ($('#teamGrid').length === 0) return;

    loadDashboardStats();                   /* โหลดตัวเลขจาก mock-tickets.json */
    loadSupportTeam();                      /* โหลด team จาก API */

    /* ปุ่ม Refresh — โหลดใหม่ */
    $('#refreshTeam').on('click', function () {
      loadSupportTeam();
    });
  });

  /* ─────────────────────────────────────────
     โหลดสถิติจาก mock-tickets.json
     นับ ticket แต่ละสถานะแล้ว animate ตัวเลขจริง
  ───────────────────────────────────────── */
  async function loadDashboardStats() {
    try {
      const tickets = await $.getJSON('assets/data/mock-tickets.json');
      /* นับจำนวนแต่ละสถานะ */
      const total    = tickets.length;
      const open     = tickets.filter(function (t) { return t.status === 'open'; }).length;
      const resolved = tickets.filter(function (t) { return t.status === 'resolved'; }).length;

      /* Animate ตัวเลขจริงเข้า stat cards */
      animateCounter('#counterTotal',    total);
      animateCounter('#counterOpen',     open);
      animateCounter('#counterResolved', resolved);

    } catch (err) {
      console.warn('Dashboard stats: using default values', err);
    }
  }

  /* ─────────────────────────────────────────
     Animate ตัวเลขจาก 0 → target ด้วย GSAP
  ───────────────────────────────────────── */
  function animateCounter(selector, target) {
    const $el = $(selector);
    if (!$el.length) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      onUpdate: function () {
        $el.text(Math.round(obj.val).toLocaleString('en-US'));
      },
    });
  }

  /* ─────────────────────────────────────────
     โหลด Support Team จาก DummyJSON API
  ───────────────────────────────────────── */
  async function loadSupportTeam() {
    /* 1. แสดง Skeleton ก่อนทันที */
    showTeamSkeleton();
    spinRefreshIcon(true);                  /* หมุน icon ขณะโหลด */

    try {
      /* 2. เรียก API (await = รอจนกว่าจะได้ข้อมูล) */
      const users = await API.getSupportTeam(6);

      /* 3. ได้ข้อมูลแล้ว → render cards */
      renderTeamCards(users);

    } catch (error) {
      /* 4. ถ้าล้มเหลว → แสดง error state */
      console.error('Failed to load team:', error);
      showTeamError(error.message);

    } finally {
      /* finally ทำงานทุกกรณี (สำเร็จ หรือ ล้มเหลว) */
      spinRefreshIcon(false);
    }
  }

  /* ─────────────────────────────────────────
     แสดง Skeleton Cards (6 ใบ)
  ───────────────────────────────────────── */
  function showTeamSkeleton() {
    const skeletons = Array.from({ length: 6 }, () => `
      <div class="skeleton-card" style="flex-direction:column;align-items:center;padding:20px;gap:10px;">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-lines" style="align-items:center;width:100%">
          <div class="skeleton skeleton-line skeleton-line--md"></div>
          <div class="skeleton skeleton-line skeleton-line--sm"></div>
        </div>
        <div class="skeleton skeleton-line skeleton-line--xs" style="height:28px;border-radius:999px;width:70px"></div>
      </div>
    `).join('');
    /* Array.from({ length: 6 }) = สร้าง array 6 ช่อง เพื่อวนสร้าง skeleton */

    $('#teamGrid').html(skeletons);
  }

  /* ─────────────────────────────────────────
     Render Team Cards จาก API data
  ───────────────────────────────────────── */
  function renderTeamCards(users) {
    const cards = users.map(function (user) {
      const name       = `${user.firstName} ${user.lastName}`;  /* รวมชื่อ */
      const dept       = user.company?.department || 'IT Support';
      const ticketCount = Math.floor(Math.random() * 45) + 8;   /* random สำหรับ demo */

      return `
        <div class="team-card" data-aos="zoom-in">
          <div class="team-card__avatar-wrap">
            <img
              class="team-card__avatar"
              src="${user.image}"
              alt="${name}"
              loading="lazy"
              onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff'"
            />
            <!-- onerror = fallback ถ้ารูปโหลดไม่ได้ → ใช้ initials แทน -->
            <span class="team-card__status"></span>
          </div>
          <div class="team-card__name">${name}</div>
          <div class="team-card__dept">${dept}</div>
          <div class="team-card__stats">
            <span class="team-card__count">${ticketCount}</span>
            <span class="team-card__label">tickets</span>
          </div>
        </div>
      `;
    });

    $('#teamGrid').html(cards.join(''));

    /* GSAP: cards fade-in ทยอยกัน */
    gsap.fromTo('.team-card',
      { opacity: 0, scale: 0.9 },           /* เริ่มจาก: เล็ก + โปร่ง */
      {
        opacity: 1,
        scale: 1,                            /* ไปที่: ขนาดปกติ */
        duration: 0.4,
        stagger: 0.08,                       /* ทยอย 80ms */
        ease: 'back.out(1.2)',               /* เด้งเล็กน้อย premium feel */
        clearProps: 'all',
      }
    );
  }

  /* ─────────────────────────────────────────
     แสดง Error State + ปุ่ม Retry
  ───────────────────────────────────────── */
  function showTeamError(message) {
    $('#teamGrid').html(`
      <div class="error-state" style="grid-column: 1 / -1;">
        <!-- grid-column: 1/-1 ทำให้ error ยืดเต็มแถว -->
        <div class="error-state__icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3>Failed to load team data</h3>
        <p>${message || 'Something went wrong. Please try again.'}</p>
        <button class="btn btn-secondary btn-sm" id="retryTeam">
          <i class="fa-solid fa-rotate-right"></i>
          Try Again
        </button>
      </div>
    `);

    /* ผูก retry button */
    $('#retryTeam').on('click', function () {
      loadSupportTeam();                    /* เรียกโหลดใหม่ */
    });
  }

  /* ─────────────────────────────────────────
     หมุน Refresh Icon ขณะโหลด
  ───────────────────────────────────────── */
  function spinRefreshIcon(isLoading) {
    const $icon = $('#refreshIcon');
    if (isLoading) {
      $icon.css('animation', 'spin 1s linear infinite');
    } else {
      $icon.css('animation', '');
    }
  }
})();