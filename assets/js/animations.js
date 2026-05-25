/* ========================================
   ANIMATIONS.JS - GSAP animations
======================================== */

(function () {
  'use strict';

  $(document).ready(function () {
    animateCounters();        // เรียกฟังก์ชันนับตัวเลข
    animateStatCards();       // เรียกฟังก์ชัน fade-in cards
  });

  /**
   * Animate ตัวเลข นับขึ้นจาก 0 → ค่าเป้าหมาย
   * อ่านค่าเป้าหมายจาก data-counter attribute
   */
  function animateCounters() {
    $('[data-counter]').each(function () {
      // each = วนลูปทุก element ที่มี data-counter

      const $el = $(this);                              // element ปัจจุบัน
      const target = parseFloat($el.attr('data-counter')); // ค่าเป้าหมาย (เช่น 1247)
      const isDecimal = target % 1 !== 0;               // เช็คว่ามีจุดทศนิยมไหม (2.4 → true)

      // สร้าง object หลอกที่มี property value = 0 เริ่มต้น
      const counter = { value: 0 };

      // GSAP animate property value ของ object
      gsap.to(counter, {
        value: target,                                  // เป้าหมาย
        duration: 2,                                    // 2 วินาที
        ease: 'power2.out',                             // จังหวะ ออกแรงเร็ว → ช้าลง (เป็นธรรมชาติ)
        onUpdate: function () {
          // ฟังก์ชันที่ทำงานทุก frame ระหว่าง animation

          if (isDecimal) {
            $el.text(counter.value.toFixed(1));         // ทศนิยม 1 ตำแหน่ง: "2.4"
          } else {
            // แสดงเป็นจำนวนเต็ม + ใส่ comma คั่นพันหลัก: 1,247
            $el.text(Math.floor(counter.value).toLocaleString('en-US'));
            // toLocaleString = ฟังก์ชันใส่ , ให้ตัวเลขอัตโนมัติ (1247 → 1,247)
          }
        },
      });
    });
  }

  /**
   * Fade-in stat cards แบบ stagger (ทยอยขึ้นทีละใบ)
   * ใช้ GSAP timeline เพื่อความ smooth กว่า AOS
   */
  function animateStatCards() {
    if (typeof gsap === 'undefined') return;            // กัน error ถ้า GSAP ยังไม่โหลด

    gsap.from('.stat-card', {
      // .from = animate "จาก" state นี้ ไปยัง state จริง
      y: 40,                                            // เริ่มจากด้านล่าง 40px
      opacity: 0,                                       // เริ่มจากโปร่ง
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.12,                                    // หน่วงระหว่างแต่ละ card 120ms — เป็น "ทยอย" effect
      clearProps: 'all',                                // ลบ style ที่ GSAP ใส่ออก หลัง animation จบ
    });
  }
})();