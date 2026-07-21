# Blackbox Test Cases - Research Plan

This document outlines blackbox test cases for Indekos Ungu system. Tests are grouped by feature area for delegation to subagents or manual execution.

## Scope

- **Site Routes**: Management pages, report pages, invoice pages, auth flows
- **WhatsApp Bot**: Commands, conversation flows, verification
- **Web Push Notifications**: Subscribe, unsubscribe, push delivery

## Test Approach

- Blackbox testing = input/output validation only
- No knowledge of internal implementation required
- Test from user perspective: what they see, what they input, what they expect
- Focus on: happy paths, edge cases, validation errors, permission boundaries

---

## Group 1: Authentication & Authorization

### 1.1 Login Flow

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| AUTH-001 | Login with valid credentials | User exists in system | 1. Navigate to /login 2. Enter valid username/password 3. Submit | Redirect to dashboard |
| AUTH-002 | Login with invalid credentials | None | 1. Navigate to /login 2. Enter invalid username/password 3. Submit | Error message displayed |
| AUTH-003 | Login callback handling | OAuth flow initiated | 1. Complete OAuth redirect 2. Hit /login/callback | Session created, redirect to dashboard |
| AUTH-004 | Unauthorized access blocked | Not logged in | 1. Navigate to /dashboard/* directly | Redirect to login |
| AUTH-005 | Session expiry | Logged in, session expired | 1. Wait for session to expire 2. Perform action | Redirect to login |
| AUTH-006 | Logout | Logged in | 1. Click logout | Session cleared, redirect to login |

### 1.2 Role-Based Access

**Roles**: `admin`, `staff`, `owner`, `system` (system hidden from UI)

| Role | Sidebar Menu |
|------|--------------|
| admin | Dashboard + Manajemen Akun only |
| owner | Dashboard + Laporan (Transaksi, Notifikasi, Log Chatbot, Log Audit) |
| staff | Dashboard + Manajemen (Kamar, Penghuni, Komplain) + Laporan |

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| AUTH-007 | Admin sidebar limited | Logged in as admin | 1. View sidebar | Only Dashboard + Manajemen Akun visible |
| AUTH-008 | Admin cannot access other pages | Logged in as admin | 1. Try direct URL to /dashboard/manage/rooms | Redirect or access denied |
| AUTH-009 | Owner sidebar (reports only) | Logged in as owner | 1. View sidebar | Dashboard + Laporan menu visible, no Manajemen |
| AUTH-010 | Owner cannot edit | Logged in as owner | 1. Navigate to any page | No edit/add/delete buttons (allowEdit=false) |
| AUTH-011 | Staff sidebar (operations) | Logged in as staff | 1. View sidebar | Dashboard + Manajemen (Kamar, Penghuni, Komplain) + Laporan, NO Manajemen Akun |
| AUTH-012 | Staff cannot access accounts | Logged in as staff | 1. Try direct URL to /dashboard/manage/accounts | Redirect or access denied |
| AUTH-013 | System role hidden | Any role logged in | 1. View accounts list | System role accounts not displayed |

---

## Group 2: Room Management

### 2.1 Room List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-001 | List all rooms | Rooms exist in system | 1. Navigate to /dashboard/manage/rooms | All rooms displayed with stats (Total, Terisi, Kosong, Nonaktif) |
| ROOM-002 | Filter by occupied status | Mix of room statuses | 1. Select "Terisi" filter | Only occupied rooms shown |
| ROOM-003 | Filter by vacant status | Mix of room statuses | 1. Select "Kosong" filter | Only vacant rooms shown |
| ROOM-004 | Filter by inactive status | Mix of room statuses | 1. Select "Nonaktif" filter | Only inactive rooms shown |
| ROOM-005 | Filter by room type | Multiple room types exist | 1. Select room type filter | Only matching type shown |
| ROOM-006 | Search by room number | Rooms exist | 1. Enter room number in search | Matching rooms shown |
| ROOM-007 | Search by tenant name | Occupied rooms exist | 1. Enter tenant name in search | Rooms with matching tenant shown |
| ROOM-008 | Combined filters | Various room states | 1. Apply status + type + search | Correctly filtered results |
| ROOM-009 | Empty state | No rooms in system | 1. Navigate to rooms page | Empty state message displayed |
| ROOM-010 | Stats accuracy | Known room counts | 1. View stats at top | Stats match actual counts |

### 2.2 Room CRUD

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-011 | Add new room | Logged in with edit permission | 1. Click "Tambah Kamar" 2. Fill form 3. Submit | Room created, success toast, appears in list |
| ROOM-012 | Add room with duplicate number | Room number exists | 1. Try to add room with same number | Validation error |
| ROOM-013 | Edit room details | Room exists | 1. Click edit on room 2. Modify details 3. Save | Changes saved, success toast |
| ROOM-014 | Edit occupied room | Room has active tenant | 1. Edit room details | Can modify type/price |
| ROOM-015 | Delete vacant room | Room is vacant | 1. Click delete 2. Confirm | Room removed |
| ROOM-016 | Delete occupied room | Room has active tenant | 1. Try to delete | Action blocked or warning shown |
| ROOM-017 | Deactivate room | Room is active | 1. Deactivate room | Room marked inactive |
| ROOM-018 | View room detail | Room exists | 1. Click room detail | Room info + tenant info (if occupied) displayed |

---

## Group 3: Tenant Management

### 3.1 Tenant List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-001 | List all tenants | Tenants exist | 1. Navigate to /dashboard/manage/tenants | All tenants displayed with stats (Total, Aktif, Selesai) |
| TENANT-002 | Filter by active status | Mix of tenant statuses | 1. Select "Aktif" filter | Only active tenants shown |
| TENANT-003 | Filter by completed status | Mix of tenant statuses | 1. Select "Selesai" filter | Only completed tenants shown |
| TENANT-004 | Search by name | Tenants exist | 1. Enter name in search | Matching tenants shown |
| TENANT-005 | Search by phone number | Tenants exist | 1. Enter phone in search | Matching tenants shown |
| TENANT-006 | Search by room number | Tenants with rooms exist | 1. Enter room number in search | Matching tenants shown |
| TENANT-007 | Stats accuracy | Known tenant counts | 1. View stats | Active/Completed counts correct |

### 3.2 Tenant CRUD

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-008 | Register new tenant | Vacant room exists | 1. Click "Daftar Penghuni" 2. Fill form 3. Submit | Tenant created, linked to room, success toast |
| TENANT-009 | Register to occupied room | Room already occupied | 1. Try to register to room | Room not shown in available rooms dropdown |
| TENANT-010 | Register without room | No vacant rooms | 1. Try to register | "Tidak ada kamar kosong" message |
| TENANT-011 | Edit tenant details | Tenant exists | 1. Click edit 2. Modify details 3. Save | Changes saved |
| TENANT-012 | Move tenant to different room | Tenant active, target room vacant | 1. Click "Pindah" 2. Select new room 3. Confirm | Tenant moved, old room vacant |
| TENANT-013 | Move tenant to occupied room | Tenant active, target room occupied | 1. Try to move | Target room not in available list |
| TENANT-014 | Terminate tenant | Tenant has active lease | 1. Click "Akhiri Sewa" 2. Set end date 3. Confirm | Lease ended, room marked vacant |
| TENANT-015 | View tenant detail | Tenant exists | 1. Click tenant detail | Tenant info + lease history + invoices |
| TENANT-016 | Chat with tenant | Tenant has phone number | 1. Click chat button | WhatsApp chat opened |

### 3.3 Tenant Invoice Generation

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-017 | Generate invoice for new tenant | Tenant just registered | 1. Complete registration | First invoice auto-generated (via scheduler) |
| TENANT-018 | Invoice due date calculation | Tenant registered mid-month | 1. Check invoice due date | Due date set correctly per config |

---

## Group 4: Complaint Management

### 4.1 Complaint List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-001 | List all complaints | Complaints exist | 1. Navigate to /dashboard/manage/complaints | All complaints displayed with stats (Total, Terbuka, Proses, Selesai) |
| COMP-002 | Filter by open status | Mix of complaint statuses | 1. Select "Terbuka" filter | Only open complaints shown |
| COMP-003 | Filter by in progress status | Complaints in progress exist | 1. Select "Proses" filter | Only in-progress shown |
| COMP-004 | Filter by resolved status | Resolved complaints exist | 1. Select "Selesai" filter | Only resolved shown |
| COMP-005 | Search by description | Complaints exist | 1. Enter text in search | Matching complaints shown |
| COMP-006 | Search by tenant name | Complaints exist | 1. Enter tenant name | Complaints from tenant shown |
| COMP-007 | Filter by date range | Complaints across dates | 1. Select date range | Only complaints in range shown |
| COMP-008 | Stats accuracy | Known complaint counts | 1. View stats | Open/Process/Resolved counts correct |
| COMP-009 | Sort by date | Multiple complaints | 1. View list | Newest first (default) |

### 4.2 Complaint Processing

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| COMP-010 | View complaint detail | Complaint exists | 1. Click complaint | Detail modal with all info + image if present |
| COMP-011 | Process complaint | Complaint is open | 1. Click "Proses" 2. Add note (if applicable) | Status changed to in_progress, success toast |
| COMP-012 | Resolve complaint | Complaint in progress | 1. Click "Selesai" 2. Add resolution note | Status changed to resolved |
| COMP-013 | Complaint with image | Complaint has image | 1. View complaint | Image displayed properly |
| COMP-014 | Complaint without lease | Tenant has no active lease | 1. View complaints | Complaints visible, status shown |

---

## Group 5: Account Management

### 5.1 Account List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ACCT-001 | List all accounts | Accounts exist | 1. Navigate to /dashboard/manage/accounts | All non-system accounts shown |
| ACCT-002 | Filter by role | Mix of roles | 1. Select role filter (admin/staff/owner) | Only matching role shown |
| ACCT-003 | Search by username | Accounts exist | 1. Enter username in search | Matching accounts shown |
| ACCT-004 | Search by display name | Accounts exist | 1. Enter display name | Matching accounts shown |
| ACCT-005 | System accounts hidden | System accounts exist | 1. View list | System role not visible |
| ACCT-006 | Last accessed displayed | Accounts have logged in | 1. View list | Last access time shown |

### 5.2 Account CRUD

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ACCT-007 | Create new account | Logged in with edit permission | 1. Click "Tambah Akun" 2. Fill form 3. Submit | Account created, success toast |
| ACCT-008 | Create duplicate username | Username exists | 1. Try to create same username | Validation error: "Username tidak tersedia" |
| ACCT-009 | Edit account | Account exists | 1. Click edit 2. Modify details 3. Save | Changes saved |
| ACCT-010 | Delete account | Account exists, not self | 1. Click delete 2. Confirm | Account removed |
| ACCT-011 | Delete own account | Logged in | 1. Try to delete own account | Action blocked |
| ACCT-012 | Change role | Account exists | 1. Edit role 2. Save | Role updated |

---

## Group 6: Transaction/Invoice Management

### 6.1 Transaction List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-001 | List all transactions | Invoices exist | 1. Navigate to /dashboard/report/transactions | All invoices displayed with stats (Total, Terkumpul, Belum Terkumpul) |
| TXN-002 | Filter by paid status | Mix of invoice statuses | 1. Select "Lunas" filter | Only paid invoices shown |
| TXN-003 | Filter by unpaid status | Mix of invoice statuses | 1. Select "Belum Bayar" filter | Only unpaid shown |
| TXN-004 | Filter by date range | Invoices across dates | 1. Select date range | Only invoices in range shown |
| TXN-005 | Search by tenant name | Invoices exist | 1. Enter tenant name | Matching invoices shown |
| TXN-006 | Search by room number | Invoices exist | 1. Enter room number | Matching invoices shown |
| TXN-007 | Stats accuracy | Known invoice totals | 1. View stats | Total/Collected/Uncollected correct |
| TXN-008 | Payment link displayed | Invoice has duitku reference | 1. View invoice in list | Payment link shown |
| TXN-009 | Download report PDF | Transactions exist | 1. Click download PDF | PDF generated with correct data |
| TXN-010 | Print report | Transactions exist | 1. Click print / view HTML | Print-optimized view |

### 6.2 Invoice Detail

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TXN-011 | View invoice detail | Invoice exists | 1. Navigate to /invoice/[id] | Invoice details shown |
| TXN-012 | Invoice payment link | Invoice unpaid with duitku | 1. View invoice | Payment link/button available |
| TXN-013 | Invoice without payment link | Invoice unpaid, no duitku | 1. View invoice | No payment link shown |
| TXN-014 | Download invoice PDF | Invoice exists | 1. Click download | PDF downloaded |
| TXN-015 | Invoice HTML view | Invoice exists | 1. View HTML version | Clean HTML view |
| TXN-016 | Invalid invoice ID | None | 1. Navigate to /invoice/invalid | 404 or error page |

---

## Group 7: Notifications Report

### 7.1 Notification Log

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| NOTIF-001 | List all notifications | Notifications exist | 1. Navigate to /dashboard/report/notifications | All notifications shown |
| NOTIF-002 | Filter by date range | Notifications across dates | 1. Select date range | Only notifications in range |
| NOTIF-003 | Empty state | No notifications | 1. Navigate to page | Empty state shown |
| NOTIF-004 | Download report | Notifications exist | 1. Click download | PDF generated |
| NOTIF-005 | Stats accuracy | Known notification counts | 1. View stats | Counts correct |

---

## Group 8: Web Push Notifications

### 8.1 Push Subscription

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| PUSH-001 | Subscribe to push notifications | Browser supports push, logged in | 1. Enable notifications in browser 2. Check subscription saved | Subscription saved to DB, audit log created |
| PUSH-002 | Unsubscribe from push | Already subscribed | 1. Disable notifications 2. Check unsubscription | Subscription removed from DB, audit log created |
| PUSH-003 | Receive push notification | Subscribed, push triggered | 1. Trigger notification event | Notification received on device |
| PUSH-004 | Test push from action | Logged in | 1. Trigger test push action | Push notification received |
| PUSH-005 | Expired subscription cleanup | Subscription expired (410/404) | 1. Send push to expired subscription | Subscription removed from DB |
| PUSH-006 | Multiple subscriptions per user | Same user, different devices | 1. Subscribe on multiple devices | All devices receive push |
| PUSH-007 | Push with URL | Notification has URL | 1. Receive push 2. Click notification | Redirected to correct URL |
| PUSH-008 | Push with image | Notification has image | 1. Receive push | Image displayed in notification |

### 8.2 Push Triggers

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| PUSH-009 | New complaint push to staff | Staff subscribed | 1. Submit complaint via WhatsApp | Staff receive push notification |
| PUSH-010 | Complaint status change push | Tenant subscribed (?) | 1. Process/resolve complaint | Tenant notified (if implemented) |
| PUSH-011 | Invoice reminder push | Tenant subscribed | 1. Reminder schedule triggered | Tenant receives reminder |

---

## Group 9: Dashboard Overview

### 9.1 Main Dashboard

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| DASH-001 | View dashboard stats | Data exists | 1. Navigate to /dashboard | Stats displayed correctly |
| DASH-002 | Quick stats accuracy | Known data counts | 1. View each stat | Numbers match actual counts |
| DASH-003 | Tagihan Jatuh Tempo list | Overdue invoices exist | 1. View dashboard | Overdue invoices listed |
| DASH-004 | Komplain Terbaru list | Recent complaints exist | 1. View dashboard | Recent complaints shown |
| DASH-005 | Lihat Semua link | Data exists | 1. Click "Lihat Semua" | Redirect to full list |
| DASH-006 | Empty dashboard | No data in system | 1. Navigate to dashboard | Empty states shown gracefully |

---

## Group 10: WhatsApp Bot - Verification Flow

### 10.1 New Tenant Verification

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-VER-001 | Unverified tenant receives prompt | Tenant registered, not verified | 1. Send any message | Verification prompt shown with name confirmation |
| WA-VER-002 | Confirm with "ya" | Unverified tenant | 1. Send "ya" | Verification success, can use commands |
| WA-VER-003 | Ignore non-"ya" response | Unverified tenant | 1. Send any other text | Verification prompt repeated |
| WA-VER-004 | Already verified tenant | Verified tenant | 1. Send command | Command processed directly |

---

## Group 11: WhatsApp Bot - Commands

**Command Reference** (no `!` prefix, lowercase):
- `help` - show available commands
- `tagihan` - check unpaid bills
- `riwayat` - payment history
- `info` - tenant info
- `komplain` - start complaint flow or submit with text
- `komplain <description>` - submit complaint directly
- `komplainku` - list my complaints
- `komplainku <id>` - check specific complaint status

### 11.1 Help Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-HELP-001 | Request help | Verified tenant | 1. Send "help" | List of available commands with descriptions |
| WA-HELP-002 | Help shows name | Verified tenant | 1. Send "help" | Response includes tenant's full name |

### 11.2 Tagihan Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-TAGIHAN-001 | Check bills with unpaid invoices | Active tenant with unpaid invoices | 1. Send "tagihan" | List of unpaid bills with room info, amounts, due dates, payment links |
| WA-TAGIHAN-002 | Check bills with no unpaid | Active tenant, all paid | 1. Send "tagihan" | Message: no unpaid bills or empty list |
| WA-TAGIHAN-003 | Check bills without lease | Registered tenant, no active lease | 1. Send "tagihan" | Message: "Anda tidak memiliki kontrak sewa yang aktif." |
| WA-TAGIHAN-004 | Check bills with payment link | Unpaid invoice with duitku reference | 1. Send "tagihan" | Payment link included in response |
| WA-TAGIHAN-005 | Check bills shows room info | Active lease | 1. Send "tagihan" | Room number, type, monthly price displayed |
| WA-TAGIHAN-006 | Check bills shows total | Multiple unpaid invoices | 1. Send "tagihan" | Total amount calculated |
| WA-TAGIHAN-007 | Unverified user | Unverified tenant | 1. Send "tagihan" | Verification prompt shown |

### 11.3 Riwayat Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-RIWAYAT-001 | View payment history | Tenant has paid invoices | 1. Send "riwayat" | List of paid invoices (up to 10) |
| WA-RIWAYAT-002 | No payment history | Tenant has no paid invoices | 1. Send "riwayat" | Message: "Belum ada riwayat pembayaran lunas." |
| WA-RIWAYAT-003 | History without lease | No active lease | 1. Send "riwayat" | Message: "Anda tidak memiliki riwayat pembayaran." |
| WA-RIWAYAT-004 | History shows details | Multiple paid invoices | 1. Send "riwayat" | Invoice numbers, amounts, due dates shown |

### 11.4 Info Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-INFO-001 | View tenant info | Active tenant with lease | 1. Send "info" | Name, phone, origin, room, type, price, lease dates, unpaid flag shown |
| WA-INFO-002 | Info without lease | No active lease | 1. Send "info" | Message: "Anda tidak memiliki kontrak sewa yang aktif." |

### 11.5 Komplain Command (Direct)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-KOMP-001 | Submit with inline text | Active tenant | 1. Send "komplain AC rusak" | Complaint created, confirmation with ID |
| WA-KOMP-002 | Submit with image | Active tenant | 1. Send image with caption "komplain" or just image after "komplain" | Complaint created with image |
| WA-KOMP-003 | Submit without active lease | No active lease | 1. Send "komplain test" | Message: cannot submit without lease |
| WA-KOMP-004 | Short description handled | Active tenant | 1. Send "komplain a" | Handled by flow (min 5 chars validation) |
| WA-KOMP-005 | Complaint notification sent | Staff subscribed to push | 1. Submit complaint | Staff notified via push |

### 11.6 Komplainku Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-KOMPQ-001 | List complaints | Tenant has complaints | 1. Send "komplainku" | List of up to 3 recent complaints with ID, description, date, status |
| WA-KOMPQ-002 | List with no complaints | Tenant has no complaints | 1. Send "komplainku" | Message: "Belum ada komplain yang Anda kirimkan." |
| WA-KOMPQ-003 | Check specific complaint | Tenant has complaint with known ID | 1. Send "komplainku 5" | Detailed complaint info with status, dates, resolution notes |
| WA-KOMPQ-004 | Check non-existent ID | Complaint ID doesn't belong to tenant | 1. Send "komplainku 999" | Message: "Komplain dengan ID tersebut tidak ditemukan." |
| WA-KOMPQ-005 | Check resolved complaint | Complaint is resolved | 1. Send "komplainku <id>" | Shows resolver name, resolve notes, resolved date |

### 11.7 Unknown Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-UNKNOWN-001 | Unrecognized command | Verified tenant | 1. Send "asdfghjkl" | Unknown command message shown |
| WA-UNKNOWN-002 | Case insensitivity | Verified tenant | 1. Send "TAGIHAN" or "Tagihan" | Command recognized and processed |

---

## Group 12: WhatsApp Bot - Conversation Flows

### 12.1 Complaint Flow (Interactive)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-FLOW-001 | Start complaint flow | Active tenant | 1. Send "komplain" (no text) | Prompt: "Silakan jelaskan keluhan Anda..." |
| WA-FLOW-002 | Complete flow with text | In complaint flow | 1. Send "komplain" 2. Send description text | Complaint submitted |
| WA-FLOW-003 | Complete flow with image | In complaint flow | 1. Send "komplain" 2. Send image | Complaint with image submitted |
| WA-FLOW-004 | Cancel mid-flow | In complaint flow | 1. Send "komplain" 2. Send "batal" | Flow cancelled, message: "Komplain dibatalkan." |
| WA-FLOW-005 | Session timeout | In flow, wait 5+ minutes | 1. Start flow 2. Wait 5+ min 3. Send message | New session, old flow expired |
| WA-FLOW-006 | Short description rejected | In complaint flow | 1. Send "komplain" 2. Send "test" (<5 chars) | Error: "Deskripsi terlalu pendek (min 5 karakter)" |
| WA-FLOW-007 | Image without text | In complaint flow | 1. Send "komplain" 2. Send image without caption | Complaint created with "Foto" as description |
| WA-FLOW-008 | Image with text | In complaint flow | 1. Send "komplain" 2. Send image with caption | Complaint with image + caption |

### 12.2 Session Management

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-SESSION-001 | New session created | No active session | 1. Start flow | Session created |
| WA-SESSION-002 | Existing session reused | Session active | 1. Continue in flow | Same session continues |
| WA-SESSION-003 | Session cleanup after completion | Flow completed | 1. Complete flow 2. Send new message | No active session |
| WA-SESSION-004 | Parallel sessions (different users) | Multiple users | 1. User A starts flow 2. User B starts flow | Both sessions independent |

---

## Group 13: WhatsApp Bot - Edge Cases

### 13.1 User States

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-EDGE-001 | Unregistered phone number | Phone not in DB | 1. Send any message | No response or registration prompt (behavior TBD) |
| WA-EDGE-002 | Registered but not verified | Tenant exists, isVerified=false | 1. Send any message | Verification prompt shown |

### 13.2 Input Validation

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-EDGE-003 | Empty message | Any state | 1. Send empty message | Ignored or handled gracefully |
| WA-EDGE-004 | Very long message | Any state | 1. Send very long text (>1000 chars) | Handled gracefully |
| WA-EDGE-005 | Special characters | Any state | 1. Send message with emoji, unicode | Handled correctly |
| WA-EDGE-006 | Command with extra spaces | Verified tenant | 1. Send "  tagihan  " | Trimmed and processed |

### 13.3 Media Handling

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-EDGE-007 | Image without command | Not in flow | 1. Send image without "komplain" | Ignored or clarification message |
| WA-EDGE-008 | Video sent | In complaint flow | 1. Send video instead of image | Rejected or converted (check implementation) |
| WA-EDGE-009 | Document sent | In complaint flow | 1. Send PDF/document | Rejected |
| WA-EDGE-010 | Invalid image format | In complaint flow | 1. Send unsupported image format | Handled (falls back to .jpg) |

---

## Group 14: Integration Points

### 14.1 Duitku Payment Integration

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| INT-DUITKU-001 | Payment link generated | Invoice created | 1. Check invoice | Payment link present |
| INT-DUITKU-002 | Payment callback | Payment completed in duitku | 1. Complete payment 2. Check invoice status | Status updated to paid |
| INT-DUITKU-003 | Payment link expired | Link expired | 1. Try to pay | Error or new link generated |

### 14.2 Notification Integration

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| INT-NOTIF-001 | New complaint push to staff | Staff subscribed | 1. Submit complaint 2. Check staff device | Push notification received |
| INT-NOTIF-002 | Invoice reminder | Reminder scheduled | 1. Wait for schedule 2. Check tenant notification | Reminder sent |

### 14.3 Scheduler Integration

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| INT-SCHED-001 | Monthly invoice generation | Active tenants exist | 1. Wait for monthly schedule | Invoices generated |
| INT-SCHED-002 | Rent reminder | Unpaid invoices near due | 1. Wait for reminder schedule | Reminder sent |
| INT-SCHED-003 | Overdue notification | Overdue invoices | 1. Wait for overdue schedule | Notification sent |
| INT-SCHED-004 | Monthly report | End of month | 1. Wait for schedule | Report generated/sent |

---

## Execution Notes

### Test Data Requirements

- At least 3 rooms (different types, different statuses: occupied/vacant/inactive)
- At least 5 tenants (active, completed, without lease, unverified)
- At least 3 accounts (admin, staff, owner roles)
- At least 10 invoices (paid, unpaid, with/without payment links)
- At least 5 complaints (open, in-progress, resolved)
- Test WhatsApp numbers for different user states
- Browser with push notification support

### Environment Setup

- Test database with known state
- WhatsApp bot test instance
- Mock or test duitku integration
- Staff notification channel configured (push subscriptions)
- VAPID keys configured for web push

### Reporting Template

For each test execution, record:
- Date/time
- Tester
- Environment
- Result (Pass/Fail/Blocked)
- Actual result vs expected
- Screenshots/logs if failed
- Bug ticket reference if applicable

---

## Delegation Groups

For subagent execution, split into:

1. **AUTH + ACCT**: Authentication and account management tests (17 tests)
2. **ROOM**: Room management tests (18 tests)
3. **TENANT**: Tenant management tests (18 tests)
4. **COMP**: Complaint management tests (14 tests)
5. **TXN + NOTIF**: Transaction and notification report tests (21 tests)
6. **PUSH**: Web push notification tests (11 tests)
7. **WA-VER + WA-CMDS**: WhatsApp verification + commands tests (33 tests)
8. **WA-FLOW + WA-EDGE**: WhatsApp flows + edge cases tests (16 tests)
9. **INTEGRATION**: Duitku, notification, scheduler integration tests (9 tests)
10. **DASHBOARD**: Dashboard overview tests (6 tests)

**Total: ~163 test cases**
