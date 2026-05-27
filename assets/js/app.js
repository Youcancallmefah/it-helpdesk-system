/* ========================================
   APP.JS - Main bootstrapping
   ทำงานทุกหน้า: init sidebar, theme, etc.
======================================== */

(function () {
    // IIFE (Immediately Invoked Function Expression)
    // ครอบโค้ดทั้งหมดในฟังก์ชัน — กันตัวแปรหลุดไปชน global scope
    'use strict';
    // strict mode: ทำให้ JS เข้มงวดขึ้น จับ bug ได้เร็วขึ้น

    // ===== DOM Ready =====
    $(document).ready(function () {
        console.log('🚀 App initialized');

        initSidebar();
        initAOS();

        /* เริ่มระบบ notification (เฉพาะหน้า dashboard) */
        if (typeof NotificationSystem !== 'undefined') {
            NotificationSystem.init();
        }
    });
    /**
     * จัดการการเปิด/ปิด sidebar บนมือถือ
     */
    function initSidebar() {
        const $sidebar = $('#sidebar');               // เก็บ reference ไว้ใช้ซ้ำ ($ prefix = jQuery object)
        const $overlay = $('#sidebarOverlay');
        const $toggle = $('#sidebarToggle');

        // ----- คลิกปุ่ม toggle: เปิด/ปิด sidebar -----
        $toggle.on('click', function () {
            $sidebar.toggleClass('is-open');           // toggleClass = ถ้ามี class ก็เอาออก ถ้าไม่มีก็ใส่
            $overlay.toggleClass('is-active');
        });

        // ----- คลิก overlay: ปิด sidebar -----
        $overlay.on('click', function () {
            $sidebar.removeClass('is-open');
            $overlay.removeClass('is-active');
        });

        // ----- กด ESC: ปิด sidebar -----
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {                  // ถ้าปุ่มที่กดคือ Escape
                $sidebar.removeClass('is-open');
                $overlay.removeClass('is-active');
            }
        });

        // ----- เมื่อ resize หน้าจอกลับไป desktop: ปิด sidebar mode mobile -----
        let resizeTimer;                             // ตัวแปรเก็บ timer
        $(window).on('resize', function () {
            clearTimeout(resizeTimer);                 // ยกเลิก timer เก่าก่อน
            resizeTimer = setTimeout(function () {
                // debounce: รอให้ user หยุด resize 200ms ก่อนค่อยทำ — ลดการคำนวณซ้ำซ้อน
                if (window.innerWidth > 992) {
                    $sidebar.removeClass('is-open');
                    $overlay.removeClass('is-active');
                }
            }, 200);
        });
    }

    /**
     * เริ่มต้น AOS animation library
     */
    function initAOS() {
        if (typeof AOS !== 'undefined') {           // เช็คก่อนว่า AOS โหลดมาจริง
            AOS.init({
                duration: 600,                          // ระยะเวลา animation 600ms
                once: true,                             // animation ทำครั้งเดียว ไม่ทำซ้ำตอน scroll กลับขึ้น
                easing: 'ease-out-cubic',               // จังหวะ animation
            });
        }
    }
})();