/* ========================================
   ANIMATIONS.JS — GSAP Animation System
   ทุก animation ของ app ผ่านที่นี่
======================================== */

(function () {
  'use strict';

  $(document).ready(function () {
    animatePageEnter();      /* 1. หน้าโหลด → animate ทีละส่วน */
    animateCounters();       /* 2. นับตัวเลข stat cards */
    animateStatCards();      /* 3. fade-in stat cards */
    initStatCardTilt();      /* 4. 3D tilt เมื่อ hover stat card */
    initRipple();            /* 5. ripple effect เมื่อคลิกปุ่ม */
    initPageExit();          /* 6. fade-out ก่อนเปลี่ยนหน้า */
  });

  /* ─────────────────────────────────────────
     1. PAGE ENTER ANIMATION
     GSAP Timeline: sidebar → topbar → header
     Timeline = ลำดับ animation ที่เชื่อมต่อกัน
  ───────────────────────────────────────── */
  function animatePageEnter() {
    if (typeof gsap === 'undefined') return;   /* กัน error ถ้า GSAP ยังไม่โหลด */

    /* สร้าง timeline — defaults คือค่า default สำหรับทุก animation ใน timeline นี้ */
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', clearProps: 'all' },
    });

    tl
      /* sidebar เลื่อนเข้าจากซ้าย */
      .fromTo('#sidebar',
        { x: -40, opacity: 0 },            /* เริ่มจากซ้าย 40px + โปร่ง */
        { x: 0, opacity: 1, duration: 0.6 }
      )

      /* topbar หล่นลงมาจากบน */
      .fromTo('.topbar',
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.3'                             /* overlap 0.3s กับ animation ก่อนหน้า → ดูลื่น */
      )

      /* page header (title + subtitle) fade up */
      .fromTo('.content__header',
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.2'
      );
    /* หมายเหตุ: stat cards มี animateStatCards() จัดการอยู่แล้ว → ไม่ต้องใส่ซ้ำ */
  }

  /* ─────────────────────────────────────────
     2. COUNTER ANIMATION
     animate ตัวเลข 0 → target ใน data-counter
  ───────────────────────────────────────── */
  function animateCounters() {
    $('[data-counter]').each(function () {
      const $el     = $(this);
      const target  = parseFloat($el.attr('data-counter'));  /* ค่าเป้าหมาย เช่น 1247 */
      const isDecimal = target % 1 !== 0;                    /* 2.4 → true, 1247 → false */

      const counter = { value: 0 };   /* object หลอกที่ GSAP animate ค่าภายใน */

      gsap.to(counter, {
        value: target,
        duration: 2,
        ease: 'power2.out',            /* เร็วก่อน แล้วช้าลง = เป็นธรรมชาติ */
        onUpdate: function () {
          if (isDecimal) {
            $el.text(counter.value.toFixed(1));                         /* เช่น 2.4 */
          } else {
            $el.text(Math.floor(counter.value).toLocaleString('en-US')); /* เช่น 1,247 */
          }
        },
      });
    });
  }

  /* ─────────────────────────────────────────
     3. STAT CARDS STAGGER ANIMATION
     cards ทยอย fade-in ขึ้นทีละใบ
  ───────────────────────────────────────── */
  function animateStatCards() {
    if ($('.stat-card').length === 0) return;   /* ไม่มี stat card ใน page นี้ → ออก */

    gsap.from('.stat-card', {
      y: 40,             /* เริ่มจากด้านล่าง 40px */
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.12,     /* ทยอย 120ms ต่อใบ → ให้ดูเป็นระลอก */
      clearProps: 'all', /* ลบ inline style ที่ GSAP ใส่ออกหลัง animation จบ */
    });
  }

  /* ─────────────────────────────────────────
     4. 3D TILT EFFECT บน Stat Cards
     เมาส์เคลื่อนบน card → card เอียงตาม
     ให้ความรู้สึก depth / 3D
  ───────────────────────────────────────── */
  function initStatCardTilt() {
    /* เฉพาะ device ที่มี hover (desktop) ไม่ทำบน touchscreen */
    if (!window.matchMedia('(hover: hover)').matches) return;

    $('.stat-card')
      .on('mousemove', function (e) {
        const rect  = this.getBoundingClientRect();
        const x     = e.clientX - rect.left;    /* ตำแหน่ง X ของเมาส์ใน card */
        const y     = e.clientY - rect.top;     /* ตำแหน่ง Y */
        const cx    = rect.width  / 2;          /* จุดกึ่งกลาง X */
        const cy    = rect.height / 2;          /* จุดกึ่งกลาง Y */

        /* คำนวณมุมเอียง: เมาส์อยู่ขวา card → rotateY บวก (เอียงขวา) */
        const rotateY =  ((x - cx) / cx) * 8;  /* สูงสุด ±8 องศา */
        const rotateX = -((y - cy) / cy) * 8;

        gsap.to(this, {
          rotateX,
          rotateY,
          transformPerspective: 600,  /* ระยะ perspective ยิ่งน้อยยิ่ง dramatic */
          duration: 0.4,
          ease: 'power2.out',
        });
      })
      .on('mouseleave', function () {
        /* คืนกลับตรงๆ พร้อม elastic effect เล็กน้อย */
        gsap.to(this, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.5)',  /* เด้งกลับ = ธรรมชาติกว่า linear */
          clearProps: 'all',
        });
      });
  }

  /* ─────────────────────────────────────────
     5. RIPPLE EFFECT บนปุ่ม
     คลิกปุ่ม → คลื่นกระจายออกจากจุดที่คลิก
     คล้าย Material Design click feedback
  ───────────────────────────────────────── */
  function initRipple() {
    /* ผูก event กับ document (event delegation)
       → จับได้แม้ปุ่มที่ถูกสร้างทีหลังโดย JS */
    $(document).on('click', '.btn', function (e) {
      const $btn  = $(this);
      const rect  = this.getBoundingClientRect();

      /* ขนาด ripple = เส้นผ่านศูนย์กลางที่ใหญ่พอครอบปุ่มทั้งหมด */
      const size  = Math.max(rect.width, rect.height) * 2;
      /* ตำแหน่ง ripple = จุดที่คลิก (สัมพันธ์กับปุ่ม) */
      const x     = e.clientX - rect.left - size / 2;
      const y     = e.clientY - rect.top  - size / 2;

      /* สร้าง element ripple แล้วใส่ใน button */
      const $ripple = $('<span class="ripple-effect"></span>').css({
        width:  size,
        height: size,
        left:   x,
        top:    y,
      });

      $btn.append($ripple);

      /* ลบออกหลัง animation จบ (600ms) */
      setTimeout(function () { $ripple.remove(); }, 600);
    });
  }

  /* ─────────────────────────────────────────
     6. PAGE EXIT TRANSITION
     คลิก nav link → fade out ก่อนเปลี่ยนหน้า
     ทำให้การเปลี่ยนหน้าดูราบรื่น ไม่กระโดด
  ───────────────────────────────────────── */
  function initPageExit() {
    /* จับ click บน link ที่ไปหน้าอื่น (ไม่ใช่ # หรือ javascript:) */
    $(document).on('click', 'a[href]:not([href^="#"]):not([href^="javascript"])', function (e) {
      const href = $(this).attr('href');
      if (!href) return;

      e.preventDefault();   /* ยับยั้ง navigation ปกติก่อน */

      /* Animate fade out + เลื่อนขึ้นเล็กน้อย */
      gsap.to('.main-area', {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: function () {
          window.location.href = href;   /* ค่อยเปลี่ยน URL หลัง animation จบ */
        },
      });
    });
  }
})();
