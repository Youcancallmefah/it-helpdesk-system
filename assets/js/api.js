/* ========================================
   API.JS — Central Data Layer
   ทุก fetch call ผ่านที่นี่ที่เดียว
   ถ้า backend เปลี่ยน แก้ที่นี่ที่เดียวจบ
======================================== */

const API = (function () {
  'use strict';

  /* ─────────────────────────────────────────
     Core Fetch — wrapper กลางพร้อม timeout + error
  ───────────────────────────────────────── */
  async function request(url, options = {}) {
    /* AbortController ใช้ยกเลิก fetch ถ้าใช้เวลานานเกิน */
    const controller = new AbortController();
    const timeoutId  = setTimeout(
      () => controller.abort(),             /* abort หลัง 8 วินาที */
      CONFIG.API.TIMEOUT_MS
    );

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,          /* ผูก controller เข้ากับ fetch */
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);              /* fetch สำเร็จ ยกเลิก timeout */

      if (!response.ok) {
        /* response.ok = true เมื่อ status 200-299 */
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();         /* แปลง response เป็น JS object */

    } catch (err) {
      clearTimeout(timeoutId);

      /* จำแนก error ให้ชัดเจน เพื่อแสดง message ที่ถูกต้อง */
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      if (!navigator.onLine) {
        throw new Error('No internet connection.');
      }
      throw err;                            /*던던 error ต่อให้ caller จัดการ */
    }
  }

  /* ─────────────────────────────────────────
     Public API Functions
     ตั้งชื่อให้บอกว่า "ได้ข้อมูลอะไร"
     ไม่ใช่ "ไปที่ URL ไหน"
  ───────────────────────────────────────── */

  /**
   * ดึงรายชื่อ Support Team จาก DummyJSON
   * @param {number} limit - จำนวน user ที่ต้องการ
   */
  async function getSupportTeam(limit = 6) {
    const url  = `${CONFIG.API.DUMMYJSON}/users?limit=${limit}&select=firstName,lastName,email,image,company`;
    const data = await request(url);
    return data.users;                      /* DummyJSON ห่อข้อมูลใน .users */
  }

  /**
   * ดึง todos สำหรับ demo (จะใช้ใน future)
   */
  async function getTodos(limit = 10) {
    const url  = `${CONFIG.API.DUMMYJSON}/todos?limit=${limit}`;
    const data = await request(url);
    return data.todos;
  }

  /* เปิดเผยเฉพาะ public methods */
  return {
    getSupportTeam,
    getTodos,
  };
})();