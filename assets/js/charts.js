/* ========================================
   CHARTS.JS - Chart.js configuration
   จัดการทุก chart ในระบบ
======================================== */

(function () {
    'use strict';

    // ===== Global Chart Defaults (ตั้งค่าเริ่มต้นทุก chart) =====
    Chart.defaults.font.family = "'Inter', sans-serif";   /* font เดียวกับ UI */
    Chart.defaults.color = '#94a3b8';                     /* สีตัวอักษรบน axis */
    Chart.defaults.borderColor = '#e2e8f0';               /* สีเส้น grid */
    Chart.defaults.plugins.legend.display = false;        /* ปิด default legend ใช้ custom แทน */

    // ===== Mock Data (ข้อมูลจำลอง) =====
    const CHART_DATA = {
        trend: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            created: [45, 62, 38, 71, 55, 29, 48],           /* tickets สร้างใหม่แต่ละวัน */
            resolved: [38, 55, 42, 63, 48, 25, 41],           /* tickets แก้ไขแต่ละวัน */
        },
        status: {
            labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
            values: [284, 163, 621, 179],
            colors: ['#6366f1', '#f59e0b', '#10b981', '#94a3b8'],
        },
        dept: {
            labels: ['IT Support', 'Network', 'Hardware', 'Software', 'Security', 'Other'],
            values: [312, 189, 234, 156, 98, 78],
        },
    };

    // ===== Activities Mock Data =====
    const ACTIVITIES = [
        { type: 'create', icon: 'fa-plus', text: '<strong>TKT-1089</strong> New ticket created by Sarah', time: '2 min ago' },
        { type: 'resolve', icon: 'fa-check', text: '<strong>TKT-1087</strong> Resolved by Mike Johnson', time: '15 min ago' },
        { type: 'update', icon: 'fa-pen', text: '<strong>TKT-1085</strong> Priority changed to Critical', time: '28 min ago' },
        { type: 'assign', icon: 'fa-user-check', text: '<strong>TKT-1083</strong> Assigned to David Lee', time: '1 hr ago' },
        { type: 'create', icon: 'fa-plus', text: '<strong>TKT-1081</strong> Network outage reported', time: '2 hr ago' },
        { type: 'resolve', icon: 'fa-check', text: '<strong>TKT-1079</strong> Printer issue fixed', time: '3 hr ago' },
    ];

    // ===== เริ่มต้นเมื่อ DOM พร้อม =====
    $(document).ready(function () {
        if ($('#trendChart').length === 0) return;           /* ออกถ้าไม่ได้อยู่หน้า dashboard */

        initTrendChart();
        initStatusChart();
        initDeptChart();
        renderActivityFeed();
        initChartTabs();
    });

    /* ─────────────────────────────────────────
       LINE CHART — Ticket Trends
    ───────────────────────────────────────── */
    function initTrendChart() {
        const ctx = document.getElementById('trendChart').getContext('2d');
        /* getContext('2d') = รับ drawing context ของ canvas (ต้องใช้ก่อนวาดทุกครั้ง) */

        // สร้าง gradient สีฟ้าม่วงสำหรับ fill ใต้เส้น
        const gradientCreated = ctx.createLinearGradient(0, 0, 0, 240);   /* gradient แนวตั้ง */
        gradientCreated.addColorStop(0, 'rgba(99, 102, 241, 0.3)');        /* บน: สีหลัก 30% */
        gradientCreated.addColorStop(1, 'rgba(99, 102, 241, 0)');          /* ล่าง: โปร่งใส */

        const gradientResolved = ctx.createLinearGradient(0, 0, 0, 240);
        gradientResolved.addColorStop(0, 'rgba(16, 185, 129, 0.2)');       /* บน: เขียว 20% */
        gradientResolved.addColorStop(1, 'rgba(16, 185, 129, 0)');

        window.trendChartInstance = new Chart(ctx, {
            type: 'line',

            data: {
                labels: CHART_DATA.trend.labels,
                datasets: [
                    {
                        label: 'Created',
                        data: CHART_DATA.trend.created,
                        borderColor: '#6366f1',                     /* สีเส้น */
                        backgroundColor: gradientCreated,            /* gradient fill */
                        borderWidth: 2.5,
                        fill: true,                                  /* เติมสีใต้เส้น */
                        tension: 0.4,                                /* ความโค้งเส้น (0=ตรง, 1=โค้งมาก) */
                        pointRadius: 4,                              /* ขนาดจุดข้อมูล */
                        pointBackgroundColor: '#6366f1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,                         /* hover แล้วจุดใหญ่ขึ้น */
                    },
                    {
                        label: 'Resolved',
                        data: CHART_DATA.trend.resolved,
                        borderColor: '#10b981',
                        backgroundColor: gradientResolved,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,
                    },
                ],
            },

            options: {
                responsive: true,                               /* ปรับขนาดตาม container */
                maintainAspectRatio: false,                     /* ไม่ lock ratio ให้เราคุม height เอง */

                animation: {
                    duration: 1200,                               /* animation นาน 1.2 วินาที */
                    easing: 'easeInOutQuart',                     /* จังหวะ smooth */
                },

                plugins: {
                    tooltip: {
                        backgroundColor: '#1e293b',                 /* tooltip สีดำ */
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        padding: 12,
                        borderColor: '#334155',
                        borderWidth: 1,
                        displayColors: true,
                        callbacks: {
                            label: function (context) {
                                return ` ${context.dataset.label}: ${context.parsed.y} tickets`;
                                /* custom tooltip text */
                            },
                        },
                    },
                },

                scales: {
                    x: {
                        grid: { display: false },                   /* ซ่อน vertical grid line */
                        border: { display: false },
                        ticks: { font: { size: 12 } },
                    },
                    y: {
                        grid: {
                            color: '#f1f5f9',                         /* grid line สีอ่อนมาก */
                            drawBorder: false,
                        },
                        border: { display: false },
                        ticks: {
                            font: { size: 12 },
                            stepSize: 20,                             /* ขั้น grid ทุก 20 */
                        },
                        beginAtZero: true,
                    },
                },

                interaction: {
                    mode: 'index',                                /* hover แล้ว tooltip แสดงทั้ง 2 dataset */
                    intersect: false,
                },
            },
        });
    }

    /* ─────────────────────────────────────────
       DOUGHNUT CHART — Ticket Status
    ───────────────────────────────────────── */
    function initStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');

        window.statusChartInstance = new Chart(ctx, {
            type: 'doughnut',

            data: {
                labels: CHART_DATA.status.labels,
                datasets: [{
                    data: CHART_DATA.status.values,
                    backgroundColor: CHART_DATA.status.colors,
                    borderWidth: 0,                               /* ไม่มีเส้นขอบระหว่าง segment */
                    hoverOffset: 8,                               /* hover แล้ว segment ขยายออก */
                }],
            },

            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                cutout: '70%',
                layout: {
                    padding: 10,          /* เพิ่มพื้นที่รอบวงกลม เผื่อ segment ขยายตอน hover */
                },                                /* รูกลางกว้าง 70% = doughnut บาง */
                animation: {
                    animateRotate: true,                          /* หมุนเข้ามาตอน load */
                    duration: 1200,
                },
                plugins: {
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        padding: 12,
                        callbacks: {
                            label: function (ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((ctx.raw / total) * 100).toFixed(1);
                                return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
                            },
                        },
                    },
                },
            },
        });

        renderStatusLegend();                               /* วาด custom legend */
    }

    /* วาด legend ใต้ doughnut chart */
    function renderStatusLegend() {
        const data = CHART_DATA.status;
        const total = data.values.reduce((a, b) => a + b, 0);   /* รวมทั้งหมด */
        const $legend = $('#statusLegend');
        $legend.empty();                                    /* ล้างก่อนเขียนใหม่ */

        data.labels.forEach(function (label, i) {
            const pct = ((data.values[i] / total) * 100).toFixed(1);
            $legend.append(`
        <div class="chart-legend__item">
          <div class="chart-legend__label">
            <span class="chart-legend__dot" style="background:${data.colors[i]}"></span>
            ${label}
          </div>
          <div>
            <span class="chart-legend__value">${data.values[i].toLocaleString()}</span>
            <span class="chart-legend__pct">${pct}%</span>
          </div>
        </div>
      `);
        });
    }

    /* ─────────────────────────────────────────
       BAR CHART — Tickets by Department
    ───────────────────────────────────────── */
    function initDeptChart() {
        const ctx = document.getElementById('deptChart').getContext('2d');

        window.deptChartInstance = new Chart(ctx, {
            type: 'bar',

            data: {
                labels: CHART_DATA.dept.labels,
                datasets: [{
                    label: 'Tickets',
                    data: CHART_DATA.dept.values,
                    backgroundColor: [                            /* แต่ละ bar สีต่างกัน */
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(148, 163, 184, 0.8)',
                    ],
                    borderRadius: 8,                              /* bar มุมโค้ง — ดู modern */
                    borderSkipped: false,                         /* โค้งทุกมุม รวมฐาน */
                    maxBarThickness: 44,                          /* bar ไม่กว้างเกิน 44px */
                }],
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    delay: function (context) {
                        return context.dataIndex * 80;              /* แต่ละ bar ขึ้นทยอยกัน 80ms */
                    },
                    duration: 800,
                    easing: 'easeOutQuart',
                },
                plugins: {
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        padding: 12,
                        callbacks: {
                            label: function (ctx) {
                                return ` ${ctx.parsed.y} tickets this month`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 12 } },
                    },
                    y: {
                        grid: { color: '#f1f5f9' },
                        border: { display: false },
                        ticks: { font: { size: 12 } },
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    /* ─────────────────────────────────────────
       ACTIVITY FEED — Render รายการ
    ───────────────────────────────────────── */
    function renderActivityFeed() {
        const $feed = $('#activityFeed');

        ACTIVITIES.forEach(function (item, index) {
            const $item = $(`
      <div class="activity-item">
        <div class="activity-item__icon activity-item__icon--${item.type}">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div class="activity-item__body">
          <div class="activity-item__text">${item.text}</div>
          <div class="activity-item__time">
            <i class="fa-regular fa-clock"></i> ${item.time}
          </div>
        </div>
      </div>
    `);
            /* ลบ style="opacity:0" ออก — ให้ GSAP จัดการเอง */

            $feed.append($item);

            /* ✅ ใช้ fromTo แทน — กำหนด start และ end ชัดเจนในตัวเดียว */
            gsap.fromTo(
                $item[0],
                {
                    opacity: 0,         /* เริ่มจาก: โปร่งใส */
                    x: -20,             /* เริ่มจาก: ซ้าย 20px */
                },
                {
                    opacity: 1,         /* ไปที่: มองเห็น */
                    x: 0,               /* ไปที่: ตำแหน่งปกติ */
                    duration: 0.4,
                    delay: 0.8 + index * 0.08,
                    ease: 'power2.out',
                    clearProps: 'all',  /* ลบ inline style ที่ GSAP ใส่ออก หลัง animation จบ */
                    /* clearProps สำคัญมาก! ถ้าไม่ใส่ GSAP จะทิ้ง transform ค้างไว้ */
                }
            );
        });
    }
    /* ─────────────────────────────────────────
       CHART TABS — เปลี่ยน period (7D/30D/90D)
    ───────────────────────────────────────── */
    function initChartTabs() {
        $(document).on('click', '.chart-tab', function () {
            const $btn = $(this);

            // เปลี่ยน active state
            $btn.siblings().removeClass('chart-tab--active');
            $btn.addClass('chart-tab--active');

            const period = parseInt($btn.data('period'));     /* อ่านค่า data-period */
            updateTrendChart(period);
        });
    }

    /* สร้าง data ใหม่เมื่อเปลี่ยน tab */
    function updateTrendChart(days) {
        if (!window.trendChartInstance) return;

        // สร้าง labels ใหม่ตาม period
        const labels = [];
        const created = [];
        const resolved = [];

        for (let i = days; i > 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            created.push(Math.floor(Math.random() * 60) + 20);    /* random data สำหรับ demo */
            resolved.push(Math.floor(Math.random() * 55) + 15);
        }

        // อัพเดท chart data
        window.trendChartInstance.data.labels = labels;
        window.trendChartInstance.data.datasets[0].data = created;
        window.trendChartInstance.data.datasets[1].data = resolved;
        window.trendChartInstance.update('active');              /* update พร้อม animation */
    }
})();