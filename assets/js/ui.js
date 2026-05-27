/* ========================================
   UI.JS — Modal + Form Interactions (Step 10)
   จัดการ New Ticket Modal: open, close, validate, submit
======================================== */

const UI = (function () {
  'use strict';

  $(document).ready(function () {
    initModal();
  });

  /* ─────────────────────────────────────────
     INIT MODAL
     ผูก event ทั้งหมดที่เกี่ยวกับ modal
  ───────────────────────────────────────── */
  function initModal() {
    if ($('#newTicketModal').length === 0) return;   /* ไม่มี modal ในหน้านี้ → ออก */

    /* เปิด — คลิกปุ่ม New Ticket */
    $(document).on('click', '#newTicketBtn', openModal);

    /* ปิด — 3 วิธี: ปุ่ม X, ปุ่ม Cancel, คลิก backdrop */
    $(document).on('click', '#modalClose, #modalCancel', closeModal);
    $('#modalBackdrop').on('click', closeModal);

    /* ปิด — กด ESC */
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    /* Submit */
    $(document).on('click', '#submitTicketBtn', function () {
      if (validateForm()) {    /* ผ่าน validation → submit */
        submitTicket();
      }
    });

    /* Clear error แบบ realtime เมื่อ user แก้ข้อความ */
    $(document).on('input', '#ticketSubject',   function () { clearFieldError(this, 'subjectError');   });
    $(document).on('input', '#ticketRequester', function () { clearFieldError(this, 'requesterError'); });
  }

  /* ─────────────────────────────────────────
     OPEN MODAL
  ───────────────────────────────────────── */
  function openModal() {
    $('#newTicketModal, #modalBackdrop').addClass('is-open');
    $('body').addClass('modal-open');   /* ป้องกัน scroll ใต้ modal */

    /* Backdrop fade in */
    gsap.fromTo('#modalBackdrop',
      { opacity: 0 },
      { opacity: 1, duration: 0.25 }
    );

    /* Modal zoom-in + slide up — back.out ทำให้เด้งเล็กน้อย (premium feel) */
    gsap.fromTo('#newTicketModal',
      { opacity: 0, scale: 0.92, y: 24 },
      { opacity: 1, scale: 1,    y: 0, duration: 0.35, ease: 'back.out(1.5)', clearProps: 'all' }
    );

    /* Focus input แรก หลัง animation เสร็จ */
    setTimeout(function () { $('#ticketSubject').focus(); }, 200);
  }

  /* ─────────────────────────────────────────
     CLOSE MODAL
  ───────────────────────────────────────── */
  function closeModal() {
    if (!$('#newTicketModal').hasClass('is-open')) return;   /* modal ไม่ได้เปิดอยู่ → ข้าม */

    /* Animate out */
    gsap.to('#modalBackdrop', { opacity: 0, duration: 0.2 });
    gsap.to('#newTicketModal', {
      opacity: 0,
      scale: 0.95,
      y: 12,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: function () {
        $('#newTicketModal, #modalBackdrop').removeClass('is-open');
        $('body').removeClass('modal-open');
        resetForm();   /* ล้าง form หลัง modal ปิด */
      },
    });
  }

  /* ─────────────────────────────────────────
     FORM VALIDATION
     คืนค่า true = ผ่านทุก field, false = มี error
  ───────────────────────────────────────── */
  function validateForm() {
    let isValid = true;

    /* Subject — required */
    const subject = $('#ticketSubject').val().trim();
    if (!subject) {
      showFieldError('#ticketSubject', 'subjectError', 'Subject is required.');
      isValid = false;
    }

    /* Requester — required */
    const requester = $('#ticketRequester').val().trim();
    if (!requester) {
      showFieldError('#ticketRequester', 'requesterError', 'Requester name is required.');
      isValid = false;
    }

    return isValid;
  }

  /* ─── แสดง error + shake input ─── */
  function showFieldError(inputSelector, errorId, message) {
    $(inputSelector).addClass('is-error');
    $(`#${errorId}`).text(message);

    /* error message เลื่อนลงมาเล็กน้อย */
    gsap.fromTo(`#${errorId}`,
      { opacity: 0, y: -4 },
      { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
    );

    /* input สั่น (shake) บอกว่ากรอกผิด */
    gsap.fromTo(inputSelector,
      { x: -8 },
      { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)', clearProps: 'all' }
    );
  }

  /* ─── ล้าง error ─── */
  function clearFieldError(inputEl, errorId) {
    $(inputEl).removeClass('is-error');
    $(`#${errorId}`).text('');
  }

  /* ─────────────────────────────────────────
     SUBMIT TICKET
     Simulate API call ด้วย setTimeout (demo)
  ───────────────────────────────────────── */
  function submitTicket() {
    const $btn    = $('#submitTicketBtn');
    const subject = $('#ticketSubject').val().trim();

    /* Loading state — ปิดปุ่ม + แสดง spinner */
    $btn.prop('disabled', true).html(
      '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...'
    );

    /* Simulate network delay 1.2 วินาที */
    setTimeout(function () {
      closeModal();

      /* Success toast — ใช้ NotificationSystem จาก Step 7 */
      if (typeof NotificationSystem !== 'undefined') {
        NotificationSystem.showToast(
          'success',
          'Ticket Created!',
          `"${subject}" has been submitted successfully.`
        );
      }

      /* คืน button กลับปกติ */
      $btn.prop('disabled', false).html(
        '<i class="fa-solid fa-paper-plane"></i> Submit Ticket'
      );
    }, 1200);
  }

  /* ─────────────────────────────────────────
     RESET FORM
     ล้างทุก field + error messages
  ───────────────────────────────────────── */
  function resetForm() {
    const formEl = document.getElementById('newTicketForm');
    if (formEl) formEl.reset();               /* reset ค่า field ทั้งหมดของ form */
    $('.form-error').text('');                /* ล้าง error text */
    $('.form-input, .form-textarea').removeClass('is-error');
  }

  return {};   /* ไม่ต้อง expose method — ทุกอย่างทำงาน internally */
})();
