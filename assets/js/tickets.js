
/* ========================================
   TICKETS.JS — Ticket Management Page
======================================== */

(function () {
  'use strict';

  /* ===== State (ข้อมูลปัจจุบันของหน้านี้) ===== */
  const state = {
    tickets: [],            /* ข้อมูลทั้งหมดจาก JSON */
    filtered: [],           /* ข้อมูลหลังผ่าน filter */
    page: 1,                /* หน้าปัจจุบัน */
    perPage: 10,            /* จำนวนแถวต่อหน้า */
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sortCol: 'date',        /* column ที่ sort อยู่ */
    sortDir: 'desc',        /* asc หรือ desc */
    selected: new Set(),    /* เก็บ id ของแถวที่ checkbox ถูกเลือก */
  };

  /* ===== Priority/Status config (ลำดับสำหรับ sort) ===== */
  const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
  const STATUS_ORDER = { open: 0, 'in-progress': 1, resolved: 2, closed: 3 };

  /* ===== Init ===== */
  $(document).ready(function () {
    loadTickets();          /* โหลดข้อมูลก่อน แล้วค่อย render */
    bindEvents();           /* ผูก event listener ทั้งหมด */
  });

  /* ─────────────────────────────────────────
     โหลดข้อมูลจาก JSON file
  ───────────────────────────────────────── */
  function loadTickets() {
    $.getJSON('assets/data/mock-tickets.json')    /* jQuery โหลด JSON */
      .done(function (data) {
        state.tickets = data;                     /* เก็บข้อมูลดิบ */
        applyFilters();                           /* กรองและ render */
        updateStatBar();                          /* อัพเดทตัวเลข stat */
        animateTableIn();                         /* GSAP เปิดตาราง */
      })
      .fail(function () {
        /* ถ้าโหลดไม่ได้ แสดง error state */
        showError();
      });

    showTableSkeleton();                      /* แสดง skeleton ก่อน */

    /* setTimeout จำลองการรอ API 1.2 วินาที
       ใน production จะเป็น real API call แทน */
    setTimeout(function () {
      state.tickets = MOCK_TICKETS;
      applyFilters();
      updateStatBar();
      animateTableIn();
    }, 1200);
  }

  /* Skeleton rows ขณะรอตาราง */
  function showTableSkeleton() {
    /* แสดง 6 แถว skeleton */
    const rows = Array.from({ length: 6 }, () => `
    <div class="skeleton-row">
      <div class="skeleton skeleton-line" style="max-width:20px;height:16px;flex-shrink:0"></div>
      <div class="skeleton skeleton-line" style="max-width:80px"></div>
      <div class="skeleton skeleton-line" style="max-width:220px"></div>
      <div class="skeleton skeleton-line" style="max-width:110px"></div>
      <div class="skeleton skeleton-line" style="max-width:75px"></div>
      <div class="skeleton skeleton-line" style="max-width:80px"></div>
    </div>
  `).join('');

    /* ใส่ skeleton ในที่ที่ตาราง tbody จะอยู่ */
    $('.table-wrapper').html(`<div id="skeletonRows">${rows}</div>`);
  }

  /* ─────────────────────────────────────────
     ผูก Event Listeners ทั้งหมด
  ───────────────────────────────────────── */
  function bindEvents() {

    /* Search — debounce 300ms ไม่ให้กรองทุกตัวอักษร */
    let searchTimer;
    $('#ticketSearch').on('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.search = $('#ticketSearch').val().toLowerCase().trim();
        state.page = 1;                           /* reset กลับหน้าแรกเวลาค้นหา */
        applyFilters();
      }, 300);
    });

    /* Filter dropdowns */
    $('#statusFilter').on('change', function () {
      state.status = $(this).val();
      state.page = 1;
      applyFilters();
    });

    $('#priorityFilter').on('change', function () {
      state.priority = $(this).val();
      state.page = 1;
      applyFilters();
    });

    $('#categoryFilter').on('change', function () {
      state.category = $(this).val();
      state.page = 1;
      applyFilters();
    });

    /* Reset filters */
    $('#resetFilters, #clearSearch').on('click', function () {
      state.search = '';
      state.status = 'all';
      state.priority = 'all';
      state.category = 'all';
      state.page = 1;
      /* reset UI */
      $('#ticketSearch').val('');
      $('#statusFilter, #priorityFilter, #categoryFilter').val('all');
      applyFilters();
    });

    /* Sort headers */
    $(document).on('click', '.sortable', function () {
      const col = $(this).data('col');
      if (state.sortCol === col) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';  /* toggle */
      } else {
        state.sortCol = col;
        state.sortDir = 'asc';
      }
      applyFilters();
      updateSortUI();
    });

    /* Select All checkbox */
    $(document).on('change', '#selectAll', function () {
      const checked = $(this).is(':checked');
      const visibleIds = getPageTickets().map(t => t.id);
      if (checked) {
        visibleIds.forEach(id => state.selected.add(id));
      } else {
        visibleIds.forEach(id => state.selected.delete(id));
        state.selected.clear();
      }
      renderTable();
      updateBulkActions();
    });

    /* Individual checkboxes */
    $(document).on('change', '.row-checkbox', function () {
      const id = $(this).val();
      if ($(this).is(':checked')) {
        state.selected.add(id);
      } else {
        state.selected.delete(id);
      }
      updateBulkActions();
    });

    /* Pagination */
    $(document).on('click', '.page-btn:not(:disabled):not(.page-btn--active)', function () {
      const p = $(this).data('page');
      if (p) {
        state.page = p;
        renderTable();
        /* scroll กลับขึ้นไปที่ตาราง */
        $('html, body').animate({ scrollTop: $('.table-card').offset().top - 20 }, 300);
      }
    });
  }

  /* ─────────────────────────────────────────
     กรองและ Sort ข้อมูล → render
  ───────────────────────────────────────── */
  function applyFilters() {
    let result = [...state.tickets];              /* copy array ไม่แก้ต้นฉบับ */

    /* Filter: search */
    if (state.search) {
      result = result.filter(t =>
        t.id.toLowerCase().includes(state.search) ||
        t.subject.toLowerCase().includes(state.search) ||
        t.requester.toLowerCase().includes(state.search)
      );
    }

    /* Filter: status */
    if (state.status !== 'all') {
      result = result.filter(t => t.status === state.status);
    }

    /* Filter: priority */
    if (state.priority !== 'all') {
      result = result.filter(t => t.priority === state.priority);
    }

    /* Filter: category */
    if (state.category !== 'all') {
      result = result.filter(t => t.category.toLowerCase() === state.category);
    }

    /* Sort */
    result.sort(function (a, b) {
      let valA = a[state.sortCol];
      let valB = b[state.sortCol];

      /* priority และ status ใช้ order map */
      if (state.sortCol === 'priority') {
        valA = PRIORITY_ORDER[valA] ?? 99;
        valB = PRIORITY_ORDER[valB] ?? 99;
      } else if (state.sortCol === 'status') {
        valA = STATUS_ORDER[valA] ?? 99;
        valB = STATUS_ORDER[valB] ?? 99;
      }

      if (valA < valB) return state.sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return state.sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    state.filtered = result;
    renderTable();
  }

  /* ─────────────────────────────────────────
     Render ตาราง
  ───────────────────────────────────────── */
  function renderTable() {
    const $body = $('#ticketTableBody');
    const $empty = $('#emptyState');
    const pageTickets = getPageTickets();         /* ticket ในหน้าปัจจุบัน */

    /* อัพเดทจำนวนผลลัพธ์ */
    $('#resultCount').html(`Showing <strong>${state.filtered.length}</strong> tickets`);

    /* Empty state */
    if (state.filtered.length === 0) {
      $body.empty();
      $empty.show();
      $('#paginationBar').hide();
      return;
    }

    $empty.hide();
    $('#paginationBar').show();

    /* สร้าง HTML rows */
    const rows = pageTickets.map(function (t) {
      const isSelected = state.selected.has(t.id);
      return `
        <tr class="${isSelected ? 'is-selected' : ''}" data-id="${t.id}">
          <td>
            <input
              type="checkbox"
              class="table-checkbox row-checkbox"
              value="${t.id}"
              ${isSelected ? 'checked' : ''}
            />
          </td>
          <td><span class="ticket-id">${t.id}</span></td>
          <td>
            <span class="ticket-subject" title="${t.subject}">
              ${highlight(t.subject, state.search)}
            </span>
          </td>
          <td>
            <div class="ticket-requester">
              <div class="ticket-avatar">${t.avatar}</div>
              <span>${highlight(t.requester, state.search)}</span>
            </div>
          </td>
          <td>${renderPriority(t.priority)}</td>
          <td>${renderStatus(t.status)}</td>
          <td style="color:var(--text-secondary)">${t.category}</td>
          <td>${formatDate(t.date)}</td>
          <td>
            <div class="table-actions">
              <button class="table-action-btn" title="View">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="table-action-btn" title="Edit">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="table-action-btn table-action-btn--danger" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    $body.html(rows.join(''));
    renderPagination();
  }

  /* ─────────────────────────────────────────
     Helper: ดึง ticket ของหน้าปัจจุบัน
  ───────────────────────────────────────── */
  function getPageTickets() {
    const start = (state.page - 1) * state.perPage;  /* index เริ่มต้น */
    const end = start + state.perPage;              /* index สุดท้าย */
    return state.filtered.slice(start, end);          /* ตัดเฉพาะ chunk นี้ */
  }

  /* ─────────────────────────────────────────
     Helper: Render Priority Badge
  ───────────────────────────────────────── */
  function renderPriority(priority) {
    const icons = {
      critical: 'fa-circle-exclamation',
      high: 'fa-arrow-up',
      medium: 'fa-minus',
      low: 'fa-arrow-down',
    };
    const icon = icons[priority] || 'fa-minus';
    return `
      <span class="priority-badge priority-badge--${priority}">
        <i class="fa-solid ${icon}"></i>
        ${priority}
      </span>
    `;
  }

  /* ─────────────────────────────────────────
     Helper: Render Status Badge
  ───────────────────────────────────────── */
  function renderStatus(status) {
    const labels = {
      'open': 'Open',
      'in-progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed',
    };
    return `
      <span class="status-badge status-badge--${status}">
        ${labels[status] || status}
      </span>
    `;
  }

  /* ─────────────────────────────────────────
     Helper: Highlight คำค้นหาใน text
  ───────────────────────────────────────── */
  function highlight(text, search) {
    if (!search) return text;                         /* ไม่มีคำค้น return ปกติ */
    const regex = new RegExp(`(${escapeRegex(search)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');    /* ครอบด้วย <mark> tag */
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  /* escape special chars */
  }

  /* ─────────────────────────────────────────
     Helper: Format Date
  ───────────────────────────────────────── */
  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'   /* "May 24, 2025" */
    });
  }

  /* ─────────────────────────────────────────
     Render Pagination buttons
  ───────────────────────────────────────── */
  function renderPagination() {
    const total = state.filtered.length;
    const totalPages = Math.ceil(total / state.perPage);
    const current = state.page;
    const start = (current - 1) * state.perPage + 1;
    const end = Math.min(current * state.perPage, total);

    $('#paginationInfo').text(`${start}–${end} of ${total} tickets`);

    let html = '';

    /* ปุ่ม Previous */
    html += `<button class="page-btn" data-page="${current - 1}" ${current === 1 ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-left" style="font-size:11px"></i>
    </button>`;

    /* Page numbers */
    for (let i = 1; i <= totalPages; i++) {
      /* แสดงแค่: หน้าแรก, หน้าสุดท้าย, หน้าปัจจุบัน ±1 */
      if (
        i === 1 || i === totalPages ||
        (i >= current - 1 && i <= current + 1)
      ) {
        html += `<button class="page-btn ${i === current ? 'page-btn--active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === current - 2 || i === current + 2) {
        html += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;  /* ... */
      }
    }

    /* ปุ่ม Next */
    html += `<button class="page-btn" data-page="${current + 1}" ${current === totalPages ? 'disabled' : ''}>
      <i class="fa-solid fa-chevron-right" style="font-size:11px"></i>
    </button>`;

    $('#paginationControls').html(html);
  }

  /* ─────────────────────────────────────────
     อัพเดท Stat Bar ด้านบน
  ───────────────────────────────────────── */
  function updateStatBar() {
    const all = state.tickets;
    $('#statTotal').text(all.length);
    $('#statOpen').text(all.filter(t => t.status === 'open').length);
    $('#statProgress').text(all.filter(t => t.status === 'in-progress').length);
    $('#statResolved').text(all.filter(t => t.status === 'resolved').length);
    $('#statClosed').text(all.filter(t => t.status === 'closed').length);
  }

  /* ─────────────────────────────────────────
     อัพเดท Sort icon UI
  ───────────────────────────────────────── */
  function updateSortUI() {
    $('.sortable').removeClass('sort-asc sort-desc');
    $(`.sortable[data-col="${state.sortCol}"]`)
      .addClass(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
  }

  /* ─────────────────────────────────────────
     อัพเดท Bulk Actions bar
  ───────────────────────────────────────── */
  function updateBulkActions() {
    const count = state.selected.size;
    if (count > 0) {
      $('#bulkActions').show();
      $('#bulkCount').text(`${count} selected`);
      $('#resultCount').hide();
    } else {
      $('#bulkActions').hide();
      $('#resultCount').show();
    }
  }

  /* ─────────────────────────────────────────
     GSAP: Table fade-in เมื่อโหลดเสร็จ
  ───────────────────────────────────────── */
  function animateTableIn() {
    /* restore table HTML กลับมาก่อน */
    if ($('#skeletonRows').length > 0) {
      $('.table-wrapper').html(`
      <table class="ticket-table" id="ticketTable">
        <thead>
          <tr>
            <th class="th-check"><input type="checkbox" id="selectAll" class="table-checkbox" /></th>
            <th class="sortable" data-col="id">Ticket ID <i class="fa-solid fa-sort sort-icon"></i></th>
            <th class="sortable" data-col="subject">Subject <i class="fa-solid fa-sort sort-icon"></i></th>
            <th>Requester</th>
            <th class="sortable" data-col="priority">Priority <i class="fa-solid fa-sort sort-icon"></i></th>
            <th class="sortable" data-col="status">Status <i class="fa-solid fa-sort sort-icon"></i></th>
            <th>Category</th>
            <th class="sortable" data-col="date">Date <i class="fa-solid fa-sort sort-icon"></i></th>
            <th class="th-action">Actions</th>
          </tr>
        </thead>
        <tbody id="ticketTableBody"></tbody>
      </table>
    `);

      renderTable();                          /* render ข้อมูลลง table ที่ restore มา */
    }

    gsap.fromTo('.table-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }

  function showError() {
    $('#ticketTableBody').html(`
      <tr>
        <td colspan="9" style="text-align:center;padding:40px;color:var(--text-muted)">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:24px;display:block;margin-bottom:8px"></i>
          Failed to load tickets. Please try again.
        </td>
      </tr>
    `);
  }

})();
