# Blackbox Test Cases - Complaint Management, Reports, Web Push, and Dashboard

Test cases for Groups 4, 6, 7, 8, 9 - derived from source code analysis.

---

## Group 4: Complaint Management

### 4.1 Complaint List View

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-001 | View complaint list with data | Complaints exist in system | 1. Navigate to `/dashboard/manage/complaints` | Page title "Daftar Komplain", description "Monitor pengaduan kerusakan dan keluhan sarana dari penghuni indekos", complaints displayed as cards |
| COMP-002 | View empty complaint list | No complaints in system | 1. Navigate to `/dashboard/manage/complaints` | Empty state displayed, no cards shown |
| COMP-003 | Complaint card displays all fields | Complaint with image exists | 1. View complaint card | Shows: KMP-{id}, status badge, room number badge, tenant name, description, image icon (if image exists), "Dilaporkan pada:" date |
| COMP-004 | Complaint card without image | Complaint without image exists | 1. View complaint card | No image displayed, no image icon shown in description |
| COMP-005 | Resolved complaint card styling | Complaint with status "resolved" | 1. View resolved complaint | Card has opacity-65 styling, green left border, "Selesai" badge |
| COMP-006 | In-progress complaint card styling | Complaint with status "in_progress" | 1. View in-progress complaint | Card has yellow left border, "Proses" badge |
| COMP-007 | Open complaint card styling | Complaint with status "open" | 1. View open complaint | Card has red left border, "Terbuka" badge |
| COMP-008 | Resolved complaint shows notes | Complaint resolved with notes | 1. View resolved complaint | Green-bordered section shows "Catatan Penyelesaian:" and resolveNotes text |
| COMP-009 | Resolved complaint shows handler | Complaint resolved by user | 1. View resolved complaint | Shows "Ditangani oleh: {resolvedByUserName}" |
| COMP-010 | Processed complaint shows date | Complaint with processedAt set | 1. View processed complaint | Shows "Diproses: {processedAt}" date |
| COMP-011 | Resolved complaint shows date | Complaint with resolvedAt set | 1. View resolved complaint | Shows "Selesai: {resolvedAt}" date |

### 4.2 Complaint Statistics

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-012 | Stats show correct totals | Multiple complaints with various statuses | 1. View stats bar | Shows: "Total Komplain", "Terbuka" (open count), "Proses" (in_progress count), "Selesai" (resolved count) |
| COMP-013 | Stats reflect filtered data | Filter applied, complaints exist | 1. Apply filter 2. View stats | Stats update to reflect filtered results only |

### 4.3 Complaint Filtering

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-014 | Filter by status "Terbuka" | Complaints with various statuses | 1. Click filter popover 2. Select "Terbuka" 3. Apply | Only complaints with status "open" displayed |
| COMP-015 | Filter by status "Proses" | Complaints with various statuses | 1. Click filter popover 2. Select "Proses" 3. Apply | Only complaints with status "in_progress" displayed |
| COMP-016 | Filter by status "Selesai" | Complaints with various statuses | 1. Click filter popover 2. Select "Selesai" 3. Apply | Only complaints with status "resolved" displayed |
| COMP-017 | Search by description | Complaints exist | 1. Enter search text in "Cari isi komplain/penghuni..." field 2. Submit | Only complaints with matching description shown |
| COMP-018 | Search by tenant name | Complaints exist | 1. Enter tenant name in search field 2. Submit | Only complaints from matching tenant shown |
| COMP-019 | Filter by date range | Complaints across dates | 1. Select date range in FilterToolbar 2. Apply | Only complaints within date range shown |
| COMP-020 | Combined filters | Complaints exist | 1. Set status filter 2. Set search query 3. Apply | Results match all filter criteria |

### 4.4 Complaint Actions - Process

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-021 | Process button visible for open complaint | Complaint with status "open", user has edit permission | 1. View open complaint card | Button "Tandai Proses" visible with warning (yellow) styling |
| COMP-022 | Process button not visible for non-open | Complaint with status "in_progress" or "resolved" | 1. View non-open complaint card | "Tandai Proses" button not shown |
| COMP-023 | Process complaint successfully | Complaint status "open", user logged in | 1. Click "Tandai Proses" 2. Confirm in modal 3. Submit | Toast shows "Komplain sedang diproses! (ID: {id})", status changes to "in_progress" |
| COMP-024 | Process non-existent complaint | Invalid complaint ID | 1. Submit process action with invalid ID | Error message "Komplain tidak ditemukan." |
| COMP-025 | Process already processed complaint | Complaint status "in_progress" | 1. Attempt to process | Error message "Hanya komplain dengan status 'Terbuka' yang dapat diproses." |

### 4.5 Complaint Actions - Resolve

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-026 | Resolve button visible for non-resolved | Complaint with status "open" or "in_progress", user has edit permission | 1. View non-resolved complaint card | Button "Tandai Selesai" visible with success (green) styling |
| COMP-027 | Resolve button not visible for resolved | Complaint with status "resolved" | 1. View resolved complaint card | Shows checkmark icon with "Selesai" text instead of button |
| COMP-028 | Resolve complaint with notes | Complaint non-resolved, user logged in | 1. Click "Tandai Selesai" 2. Enter resolve notes in modal 3. Submit | Toast shows "Berhasil menyelesaikan komplain! (ID: {id})", status changes to "resolved", notes saved |
| COMP-029 | Resolve complaint without notes | Complaint non-resolved, user logged in | 1. Click "Tandai Selesai" 2. Leave notes empty 3. Submit | Complaint resolved, resolveNotes is null |
| COMP-030 | Resolve non-existent complaint | Invalid complaint ID | 1. Submit resolve action with invalid ID | Error message "Komplain tidak ditemukan." |
| COMP-031 | Resolve already resolved complaint | Complaint status "resolved" | 1. Attempt to resolve | Error message "Hanya komplain dengan status 'Terbuka' atau 'Proses' yang dapat diselesaikan." |

### 4.6 Complaint PDF Download

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-032 | Download complaint report PDF | Complaints exist | 1. Click "PDF" button with download icon | PDF downloaded with filename including query params, contains complaint data |
| COMP-033 | Download filtered complaint report | Filters applied | 1. Apply filters 2. Click "PDF" button | PDF reflects current filter state in URL params |

---

## Group 6: Transaction/Invoice Reports

### 6.1 Transaction List View

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-001 | View transaction list with data | Invoices exist | 1. Navigate to `/dashboard/report/transactions` | Page title "Laporan Transaksi", description "Rekapitulasi tagihan dan riwayat pembayaran sewa bulanan penghuni", table with invoices displayed |
| TXN-002 | View empty transaction list | No invoices | 1. Navigate to `/dashboard/report/transactions` | Empty state or empty table shown |
| TXN-003 | Transaction table columns | Invoices exist | 1. View table | Columns: "No. Invoice", "Penghuni", "Kamar", "Nominal", "Jatuh Tempo", "Status", "Ref. Gateway", "Aksi" |
| TXN-004 | Invoice display fields | Invoice exists | 1. View invoice row | Shows: invoiceNumber, tenantName, roomNumber (badge), amount (formatted currency), dueDate, status badge, duitkuReference or "-" |
| TXN-005 | Status badge styling - unpaid | Invoice with status "unpaid" | 1. View invoice row | Badge shows "Belum Bayar" with warning (yellow) styling |
| TXN-006 | Status badge styling - paid | Invoice with status "paid" | 1. View invoice row | Badge shows "Lunas" with success (green) styling |
| TXN-007 | Status badge styling - overdue | Invoice with status "overdue" | 1. View invoice row | Badge shows "Terlambat" with error (red) styling |

### 6.2 Transaction Statistics

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-008 | Stats show correct totals | Multiple invoices with various statuses | 1. View stats bar | Shows: "Total Pemasukan" (formatted currency + "{count} invoice terbayar"), "Sudah Terbayar" (count + percentage), "Pembayaran Tertunggak" (count + total unpaid amount) |
| TXN-009 | Stats calculation accuracy | Known invoice data | 1. Calculate manually 2. Compare with stats | Stats match: total revenue = sum of paid invoices, paid rate = paid/total * 100 |
| TXN-010 | Stats with no data | No invoices in period | 1. View stats | Total Pemasukan shows currency format with 0, percentages show 0% |

### 6.3 Transaction Filtering

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-011 | Filter by status "Belum Bayar" | Invoices with various statuses | 1. Click filter popover 2. Select "Belum Bayar" 3. Apply | Only invoices with status "unpaid" displayed |
| TXN-012 | Filter by status "Lunas" | Invoices with various statuses | 1. Click filter popover 2. Select "Lunas" 3. Apply | Only invoices with status "paid" displayed |
| TXN-013 | Filter by status "Terlambat" | Invoices with various statuses | 1. Click filter popover 2. Select "Terlambat" 3. Apply | Only invoices with status "overdue" displayed |
| TXN-014 | Search by tenant name | Invoices exist | 1. Enter name in "Cari nama/No. Kamar..." field 2. Submit | Only invoices for matching tenant shown |
| TXN-015 | Search by room number | Invoices exist | 1. Enter room number in search field 2. Submit | Only invoices for matching room shown |
| TXN-016 | Filter by date range | Invoices across dates | 1. Select date range 2. Apply | Only invoices with dueDate in range shown |
| TXN-017 | Combined filters | Invoices exist | 1. Set status filter 2. Set search query 3. Apply | Results match all filter criteria |

### 6.4 Transaction Actions

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-018 | View Invoice button - with payment link | Invoice has duitkuReference | 1. View invoice row | "Invoice" button (green outline) shown, links to `/invoice/{id}` in new tab |
| TXN-019 | View Invoice button - without payment link | Invoice status "paid", no duitkuReference | 1. View invoice row | "Invoice" button shown, links to `/invoice/{id}` |
| TXN-020 | Action menu for unpaid invoice | Invoice unpaid, user has allowEdit permission | 1. View unpaid invoice row | Actions menu shows: "Salin" (copy payment link), "Tandai Lunas" |
| TXN-021 | Copy payment link | Invoice with paymentUrl, user has allowEdit | 1. Click "Salin" in actions menu | Payment URL copied to clipboard |
| TXN-022 | Mark as paid action | Invoice unpaid, user has allowEdit | 1. Click "Tandai Lunas" in actions menu | Toast shows "Berhasil menandai invoice sebagai lunas!", status changes to "paid" |
| TXN-023 | Generate payment link | Invoice unpaid, no duitkuReference | 1. Click generate link action | Toast shows "Link pembayaran berhasil dibuat! [Buka Pembayaran]" with link |
| TXN-024 | Action menu hidden for paid invoice | Invoice status "paid" | 1. View paid invoice row | No actions menu shown (only Invoice button) |
| TXN-025 | Action menu hidden without permission | Invoice unpaid, user without allowEdit | 1. View invoice row | No actions menu shown |

### 6.5 Transaction PDF Download

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-026 | Download transaction report PDF | Invoices exist | 1. Click "PDF" button | PDF downloaded, contains transaction data |
| TXN-027 | Download filtered transaction report | Filters applied | 1. Apply filters 2. Click "PDF" button | PDF reflects current filter state |

---

## Group 7: Notifications Report

### 7.1 Notification List View

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| NOTIF-001 | View notification list with data | Notifications exist | 1. Navigate to `/dashboard/report/notifications` | Page title "Laporan Notifikasi", description "Riwayat pengiriman notifikasi (tagihan, pengingat, komplain) via WhatsApp Chatbot", table displayed |
| NOTIF-002 | View empty notification list | No notifications | 1. Navigate to `/dashboard/report/notifications` | Empty table shown |
| NOTIF-003 | Notification table columns | Notifications exist | 1. View table | Columns: "Dibuat", "Dikirim", "Penghuni", "Invoice", "Tipe", "Status" |
| NOTIF-004 | Notification display fields | Notification exists | 1. View notification row | Shows: createdAt, sentAt or "-", tenantName, roomNumber badge, invoiceNumber, type badge, status badge |
| NOTIF-005 | Type badge - Pengingat | Notification type "reminder" | 1. View notification row | Badge shows "Pengingat" with warning styling |
| NOTIF-006 | Type badge - Pembayaran Sukses | Notification type "payment_success" | 1. View notification row | Badge shows "Pembayaran Sukses" with success styling |
| NOTIF-007 | Type badge - Verifikasi | Notification type "welcome" | 1. View notification row | Badge shows "Verifikasi" with primary styling |
| NOTIF-008 | Type badge - Verifikasi Ganti Nomor | Notification type "phone_change" | 1. View notification row | Badge shows "Verifikasi Ganti Nomor" with secondary styling |
| NOTIF-009 | Type badge - Custom | Notification type "custom" | 1. View notification row | Badge shows "Custom" with info styling |
| NOTIF-010 | Status badge - Menunggu | Notification status "pending" | 1. View notification row | Badge shows "Menunggu" with warning styling |
| NOTIF-011 | Status badge - Terkirim | Notification status "sent" | 1. View notification row | Badge shows "Terkirim" with success styling |
| NOTIF-012 | Status badge - Gagal | Notification status "failed" | 1. View notification row | Badge shows "Gagal" with error styling |

### 7.2 Notification Statistics

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| NOTIF-013 | Stats show correct totals | Multiple notifications with various statuses | 1. View stats bar | Shows: "Total Notifikasi" (count + "Seluruh notifikasi dalam periode"), "Terkirim" (count + "{rate}% sukses terkirim"), "Menunggu" (count), "Gagal" (count) |
| NOTIF-014 | Success rate calculation | Known notification data | 1. Calculate manually 2. Compare | Success rate = sent/total * 100 (rounded) |
| NOTIF-015 | Stats with no data | No notifications in period | 1. View stats | Total shows 0, all counts show 0 |

### 7.3 Notification Filtering

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| NOTIF-016 | Filter by type | Notifications with various types | 1. Click filter popover 2. Select type from "Tipe Notifikasi" group 3. Apply | Only notifications with selected type shown |
| NOTIF-017 | Filter by status | Notifications with various statuses | 1. Click filter popover 2. Select status from "Status Notifikasi" group 3. Apply | Only notifications with selected status shown |
| NOTIF-018 | Search by tenant name | Notifications exist | 1. Enter name in "Cari nama penghuni..." field 2. Submit | Only notifications for matching tenant shown |
| NOTIF-019 | Filter by date range | Notifications across dates | 1. Select date range 2. Apply | Only notifications with createdAt in range shown |
| NOTIF-020 | Combined filters | Notifications exist | 1. Set type filter 2. Set status filter 3. Set search query 4. Apply | Results match all filter criteria |

### 7.4 Notification PDF Download

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| NOTIF-021 | Download notification report PDF | Notifications exist | 1. Click "PDF" button | PDF downloaded, contains notification data |
| NOTIF-022 | Download filtered notification report | Filters applied | 1. Apply filters 2. Click "PDF" button | PDF reflects current filter state |

### 7.5 Info Alert

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| NOTIF-023 | View automation alert | On notifications page | 1. View page | Info alert shows: "Sistem Otomatisasi Aktif" with description about automatic invoice reminders |

---

## Group 8: Web Push Notifications

### 8.1 Push Subscription - UI

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| PUSH-001 | View notification dropdown | Logged in | 1. Click bell icon in navbar | Popover shows "Aktifkan Notifikasi" button (primary) and "Kirim Test Notifikasi" button (disabled) |
| PUSH-002 | Subscribe button initial state | Not subscribed, browser supports push | 1. View notification dropdown | Button shows "Aktifkan Notifikasi" (primary styling), test button disabled |
| PUSH-003 | Unsubscribe button state | Already subscribed | 1. View notification dropdown | Button shows "Nonaktifkan Notifikasi" (error styling), test button enabled |

### 8.2 Push Subscription - Actions

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| PUSH-004 | Subscribe to push - success | Browser supports push, not subscribed, permission granted | 1. Click "Aktifkan Notifikasi" 2. Accept browser permission prompt | Button changes to "Nonaktifkan Notifikasi" (error styling), test button enabled, subscription saved to DB |
| PUSH-005 | Subscribe to push - permission denied | Browser supports push, not subscribed | 1. Click "Aktifkan Notifikasi" 2. Deny browser permission | Toast shows "Akses notifikasi ditolak.", subscription not created |
| PUSH-006 | Subscribe to push - API error | Browser supports push, permission granted, API fails | 1. Click "Aktifkan Notifikasi" 2. Accept permission (API returns error) | Toast shows "Gagal mendaftarkan notifikasi browser.", subscription not created |
| PUSH-007 | Unsubscribe from push - success | Already subscribed | 1. Click "Nonaktifkan Notifikasi" | Button changes to "Aktifkan Notifikasi" (primary styling), test button disabled, subscription removed from DB |
| PUSH-008 | Unsubscribe from push - API error | Already subscribed, API fails | 1. Click "Nonaktifkan Notifikasi" (API returns error) | Toast shows "Gagal menghapus notifikasi browser.", subscription remains |
| PUSH-009 | Browser not supported | Browser does not support service workers or PushManager | 1. Click notification button | Toast shows "Browser tidak mendukung." |

### 8.3 Push Test

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| PUSH-010 | Send test notification - success | Subscribed to push | 1. Click "Kirim Test Notifikasi" | Push notification received with title "Test Notifikasi" and body "Notifikasi berhasil dikirim! 🎉" |
| PUSH-011 | Test notification audit log | Subscribed, test sent | 1. Send test notification 2. Check audit logs | Audit log created with action "CREATE", table "notifications", detail "Test push notification sent" |
| PUSH-012 | Test button disabled when not subscribed | Not subscribed | 1. View notification dropdown | "Kirim Test Notifikasi" button is disabled |

### 8.4 Push Service Worker

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| PUSH-013 | Service worker registration | Browser supports service worker | 1. Load page 2. Check navigator.serviceWorker | Service worker registered at "/sw.js" |
| PUSH-014 | Push subscription persistence | Subscribed, page reloaded | 1. Reload page 2. View notification dropdown | Button shows "Nonaktifkan Notifikasi", test button enabled (subscription persisted) |

---

## Group 9: Dashboard Overview

### 9.1 Dashboard Stats

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| DASH-001 | View dashboard stats | Data exists | 1. Navigate to `/dashboard` | Stats displayed showing: room occupancy, tenant count, unpaid invoice summary |
| DASH-002 | Stats - occupied rooms | Rooms with active leases | 1. View stats | Shows occupied room count |
| DASH-003 | Stats - vacant rooms | Active rooms without leases | 1. View stats | Shows vacant room count (isActive && !lease) |
| DASH-004 | Stats - active tenants | Tenants with active leases | 1. View stats | Shows active tenant count |
| DASH-005 | Stats - leases ending this month | Leases ending in current month | 1. View stats | Shows count of leases ending in current month/year |
| DASH-006 | Empty dashboard - no data | No rooms/tenants/invoices | 1. Navigate to `/dashboard` | Stats show 0 values gracefully |

### 9.2 Tagihan Mendekati Jatuh Tempo

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| DASH-007 | View pending bills section | Unpaid invoices exist | 1. View dashboard | Card shows "Tagihan Mendekati Jatuh Tempo" with table of up to 5 unpaid invoices |
| DASH-008 | Pending bills table columns | Unpaid invoices exist | 1. View table | Columns: "Penghuni", "Kamar", "Nominal", "Jatuh Tempo", "Status" |
| DASH-009 | Pending bills row data | Unpaid invoice exists | 1. View row | Shows: tenant name, room number badge, formatted amount, due date, status badge |
| DASH-010 | Status badge calculation | Invoice with different due dates | 1. View status column | Shows relative status (e.g., days until due or days overdue) |
| DASH-011 | Lihat Semua link - non-admin | User role not "admin" | 1. View section | "Lihat Semua" button links to `/dashboard/report/transactions` |
| DASH-012 | No Lihat Semua link - admin | User role "admin" | 1. View section | "Lihat Semua" button not shown |
| DASH-013 | Empty pending bills | No unpaid invoices | 1. View section | Empty table or message shown |

### 9.3 Komplain Terbaru

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| DASH-014 | View recent complaints section | Complaints exist | 1. View dashboard | Card shows "Komplain Terbaru" with list of recent complaints |
| DASH-015 | Recent complaint item | Complaint exists | 1. View complaint item | Shows: description (bold), room number badge, tenant name, created date, status badge |
| DASH-016 | Recent complaint status badge | Complaint with various statuses | 1. View status badge | Badge shows "Terbuka" (red), "Proses" (yellow), or "Selesai" (green) based on status |
| DASH-017 | Kelola/Lihat Komplain link - staff | User role "staff" | 1. View section | Button shows "Kelola Komplain", links to `/dashboard/manage/complaints` |
| DASH-018 | Lihat Komplain link - owner | User role "owner" | 1. View section | Button shows "Lihat Komplain", links to `/dashboard/manage/complaints` |
| DASH-019 | No link - admin | User role "admin" | 1. View section | Button not shown |
| DASH-020 | Empty recent complaints | No complaints | 1. View section | Empty list or message shown |

### 9.4 Dashboard Layout

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| DASH-021 | Dashboard page title | Logged in | 1. Navigate to `/dashboard` | Title "Dashboard", description "Ringkasan operasional dan kondisi indekos saat ini" |
| DASH-022 | Two-column layout on desktop | Desktop viewport | 1. View dashboard | Grid shows 2 columns: pending bills on left, recent complaints on right |
| DASH-023 | Single-column layout on mobile | Mobile viewport | 1. View dashboard (narrow) | Grid shows 1 column, sections stacked vertically |
