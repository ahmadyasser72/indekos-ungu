# WhatsApp Bot Blackbox Test Cases

Test cases for the WhatsApp bot based on source code analysis.

## Command Reference

| Command | Match Type | Description |
|---------|------------|-------------|
| `help` | Exact | Show available commands |
| `tagihan` | Exact | Show unpaid bills |
| `riwayat` | Exact | Show payment history |
| `info` | Exact | Show tenant information |
| `komplain` | Exact | Start complaint conversation flow |
| `komplain <text>` | Starts with "komplain " (with space) | Submit complaint directly |
| `komplainku` | Exact | List recent complaints |
| `komplainku <id>` | Pattern `komplainku <number>` | View specific complaint details |

**Note:** No `!` prefix. All commands are lowercase. Commands are processed after trimming and converting to lowercase.

---

## Group 10: Phone Number & Tenant Verification

### 10.1 Unregistered Phone Number

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-001 | Unregistered number sends message | Phone number not in database | 1. Send any message from unregistered number | Reply: template `unknown-number` |
| WA-002 | Unregistered number cooldown | Received unknown-number reply | 1. Send another message within 30 seconds | No reply (cooldown active) |
| WA-003 | Unregistered number after cooldown | 30+ seconds since last reply | 1. Wait 30+ seconds 2. Send message | Reply: template `unknown-number` |
| WA-004 | Unregistered number sends image | Phone number not in database | 1. Send image (with or without caption) | Reply: template `unknown-number` |

### 10.2 Unverified Tenant

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-005 | Unverified tenant sends any message | Tenant exists, `isVerified=false` | 1. Send any message (not "ya") | Reply: template `verification-prompt` with `{fullName}` |
| WA-006 | Unverified tenant confirms with "ya" | Tenant exists, `isVerified=false` | 1. Send "ya" (exact, lowercase) | Tenant verified, Reply: template `verification-success` with `{fullName}` |
| WA-007 | Unverified tenant sends "Ya" (capitalized) | Tenant exists, `isVerified=false` | 1. Send "Ya" (capitalized) | Reply: template `verification-prompt` (must be exact lowercase "ya") |
| WA-008 | Unverified tenant sends "ya " (with space) | Tenant exists, `isVerified=false` | 1. Send "ya " (with trailing space) | Tenant verified (text is trimmed before comparison) |
| WA-009 | Unverified tenant sends image | Tenant exists, `isVerified=false` | 1. Send image with/without caption | Reply: template `verification-prompt` |
| WA-010 | Verified tenant after verification | Just verified via "ya" | 1. Send command like "help" | Normal command response |

---

## Group 11: Core Commands

### 11.1 Help Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-011 | Help command | Verified tenant | 1. Send "help" | Reply: template `help` with `{fullName}` |
| WA-012 | Help with extra spaces | Verified tenant | 1. Send "  help  " | Reply: template `help` (trimmed) |
| WA-013 | Help uppercase | Verified tenant | 1. Send "HELP" | Reply: template `help` (lowercased) |
| WA-014 | Help with trailing text | Verified tenant | 1. Send "help me" | Reply: template `unknown-command` (exact match only) |

### 11.2 Tagihan (Bills) Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-015 | Tagihan with unpaid bills | Verified tenant, active lease, unpaid invoices | 1. Send "tagihan" | Reply: template `check-bills` with room info, invoice list, total, payment links |
| WA-016 | Tagihan no unpaid bills | Verified tenant, active lease, no unpaid invoices | 1. Send "tagihan" | Reply: template `check-bills` with empty unpaid array, total Rp 0 |
| WA-017 | Tagihan no active lease | Verified tenant, no active lease | 1. Send "tagihan" | Reply: "📍 Anda tidak memiliki kontrak sewa yang aktif." |
| WA-018 | Tagihan with payment links | Active lease, invoices with duitkuReference | 1. Send "tagihan" | Payment URLs included in invoice items, `hasPaymentLink: true` |
| WA-019 | Tagihan without payment links | Active lease, invoices without duitkuReference | 1. Send "tagihan" | No payment URLs in invoice items, `hasPaymentLink: false` |

### 11.3 Riwayat (Payment History) Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-020 | Riwayat with payment history | Verified tenant, active lease, paid invoices | 1. Send "riwayat" | Reply: template `payment-history` with list of paid invoices (max 10) |
| WA-021 | Riwayat no payments | Verified tenant, active lease, no paid invoices | 1. Send "riwayat" | Reply: "Belum ada riwayat pembayaran lunas." |
| WA-022 | Riwayat no active lease | Verified tenant, no active lease | 1. Send "riwayat" | Reply: "Anda tidak memiliki riwayat pembayaran." |

### 11.4 Info (Tenant Info) Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-023 | Info with active lease | Verified tenant, active lease | 1. Send "info" | Reply: template `tenant-info` with fullName, phone, room details, dates |
| WA-024 | Info no active lease | Verified tenant, no active lease | 1. Send "info" | Reply: "Anda tidak memiliki kontrak sewa yang aktif." |
| WA-025 | Info with unpaid bills | Verified tenant, active lease, unpaid invoices | 1. Send "info" | `hasUnpaid: true` in template |
| WA-026 | Info with no unpaid bills | Verified tenant, active lease, no unpaid invoices | 1. Send "info" | `hasUnpaid: false` in template |
| WA-027 | Info with null originRegion | Verified tenant, `originRegion=null` | 1. Send "info" | originRegion displayed as "-" |
| WA-028 | Info with ongoing lease (no endDate) | Active lease, `endDate=null` | 1. Send "info" | endDate displayed as "Berlangsung" |

---

## Group 12: Complaint Commands

### 12.1 Komplainku (List Complaints) Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-029 | Komplainku with complaints | Verified tenant, has complaints | 1. Send "komplainku" | Reply: template `list-complaints` with max 3 recent complaints |
| WA-030 | Komplainku no complaints | Verified tenant, no complaints | 1. Send "komplainku" | Reply: "Belum ada komplain yang Anda kirimkan." |
| WA-031 | Komplainku with space suffix | Verified tenant | 1. Send "komplainku " | Reply: template `list-complaints` or no complaints message |
| WA-032 | Komplainku with extra text | Verified tenant | 1. Send "komplainku test" | Reply: template `unknown-command` (pattern requires just number or nothing) |

### 12.2 Komplainku \<id\> (Check Complaint) Command

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-033 | Komplainku with valid ID | Verified tenant, complaint exists with ID | 1. Send "komplainku 123" | Reply: template `check-complaint` with full complaint details |
| WA-034 | Komplainku with invalid ID | Verified tenant, complaint ID not owned by tenant | 1. Send "komplainku 999" | Reply: "Komplain dengan ID tersebut tidak ditemukan." |
| WA-035 | Komplainku with non-numeric ID | Verified tenant | 1. Send "komplainku abc" | Reply: template `unknown-command` (regex requires digits only) |
| WA-036 | Komplainku resolved complaint | Verified tenant, complaint resolved | 1. Send "komplainku <id>" | Template includes resolvedAt, resolveNotes, resolverName |
| WA-037 | Komplainku processed complaint | Verified tenant, complaint processed | 1. Send "komplainku <id>" | Template includes processedAt date |

### 12.3 Direct Complaint Submission (komplain \<text\>)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-038 | Komplain with text | Verified tenant, active lease | 1. Send "komplain AC tidak dingin" | Complaint created, Reply: template `submit-complaint` |
| WA-039 | Komplain with image only | Verified tenant, active lease | 1. Send image with caption "komplain" | Description defaults to "Foto", complaint created |
| WA-040 | Komplain with image and caption | Verified tenant, active lease | 1. Send image with caption "komplain kerusakan pintu" | Description: "kerusakan pintu", complaint created |
| WA-041 | Komplain without active lease | Verified tenant, no active lease | 1. Send "komplain test" | Reply: template `no-lease-complaint` |
| WA-042 | Komplain with short text (< 5 chars) | Verified tenant, active lease | 1. Send "komplain abc" | Reply: "✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan." |
| WA-043 | Komplain exactly 5 chars | Verified tenant, active lease | 1. Send "komplain 12345" | Complaint created (min 5 chars inclusive) |
| WA-044 | Komplain with image, short caption OK | Verified tenant, active lease | 1. Send image with caption "komplain abc" | Complaint created (image present, no min length) |

---

## Group 13: Complaint Conversation Flow

### 13.1 Flow Initiation

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-045 | Start complaint flow | Verified tenant, active lease | 1. Send "komplain" (exact) | Reply: template `complaint-prompt`, session started, moved to "collect" step |
| WA-046 | Start flow without lease | Verified tenant, no active lease | 1. Send "komplain" | Reply: template `no-lease-complaint`, no session started |
| WA-047 | Flow with immediate description | Verified tenant, active lease | 1. Send "komplain AC rusak" | Complaint created immediately (no prompt), no session started |
| WA-048 | Flow with immediate image | Verified tenant, active lease | 1. Send image with caption "komplain" | Complaint created with description "Foto", no session started |
| WA-049 | Flow with immediate batal | Verified tenant, active lease | 1. Send "komplain batal" | Reply: "❌ Komplain dibatalkan.", no session started |

### 13.2 Collect Step

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-050 | Submit description | Active session in collect step | 1. Send "Kerusakan di kamar mandi" | Complaint created, session ended |
| WA-051 | Submit with image | Active session in collect step | 1. Send image (with or without caption) | Complaint created with description (caption or "Foto"), session ended |
| WA-052 | Cancel with "batal" | Active session in collect step | 1. Send "batal" (case-insensitive) | Reply: "❌ Komplain dibatalkan.", session ended |
| WA-053 | Cancel with "BATAL" | Active session in collect step | 1. Send "BATAL" (uppercase) | Reply: "❌ Komplain dibatalkan.", session ended |
| WA-054 | Short description rejected | Active session in collect step | 1. Send "abc" (no image) | Reply: "✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan.", session continues |
| WA-055 | Short description with image OK | Active session in collect step | 1. Send image without caption | Complaint created with description "Foto", session ended |
| WA-056 | Session loses lease mid-flow | Active session, lease deactivated | 1. Submit description | Reply: template `no-lease-complaint`, session ended |

### 13.3 Session Management

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-057 | Session timeout (5 minutes) | Active session | 1. Wait 5+ minutes 2. Send message | Session expired, message processed as new command |
| WA-058 | Session activity updates | Active session | 1. Send message 2. Check `lastActivity` | `lastActivity` timestamp updated |
| WA-059 | New session after timeout | Session expired | 1. Send "komplain" | New session started (no conflict) |
| WA-060 | Active session blocks commands | Active complaint session | 1. Send "help" | Message routed to session handler, not command processor |
| WA-061 | Session ended after completion | Just submitted complaint | 1. Send "help" | Normal command response (session cleared) |
| WA-062 | Session ended after cancel | Just cancelled | 1. Send "help" | Normal command response (session cleared) |

---

## Group 14: Edge Cases & Error Handling

### 14.1 Unknown Commands

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-063 | Unknown command | Verified tenant | 1. Send "halo" | Reply: template `unknown-command` |
| WA-064 | Command-like but not exact | Verified tenant | 1. Send "helps" | Reply: template `unknown-command` (not exact match) |
| WA-065 | Empty message (whitespace only) | Verified tenant | 1. Send "   " | No reply (empty text, no image) |
| WA-066 | Image without text | Verified tenant | 1. Send image without caption | Reply: template `unknown-command` (text is empty) |

### 14.2 Image Handling

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-067 | Image download success | Verified tenant | 1. Send image with command | Image processed, buffer attached to `messageInput` |
| WA-068 | Image download failure | Verified tenant, network issue | 1. Send image | Image download logged as error, `messageInput.image` undefined, text processed |
| WA-069 | Image with mimtype | Verified tenant | 1. Send PNG image | `mimetype: "image/png"` captured |
| WA-070 | Image default mimetype | Verified tenant | 1. Send image without mimetype | `mimetype: "image/jpeg"` as default |

### 14.3 Message Processing

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-071 | Own message ignored | Bot sends message | 1. Bot receives its own message | Ignored (`fromMe` check) |
| WA-072 | Group message ignored | Message from group chat | 1. Send to group with bot | Ignored (JID doesn't end with `@s.whatsapp.net`) |
| WA-073 | Rate limiting | Multiple messages sent | 1. Bot sends 2+ replies rapidly | 1-second delay between sends enforced |
| WA-074 | Message logging | Verified tenant sends message | 1. Send any message | Message logged to `chatbotMessages` (incoming + outgoing) |
| WA-075 | Message with quoted reply | Verified tenant | 1. Send message quoting bot | Bot reply quotes user's message |

### 14.4 Data Validation

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-076 | Invoice limit in payment history | Tenant has 15+ paid invoices | 1. Send "riwayat" | Only 10 most recent paid invoices returned |
| WA-077 | Complaints limit in list | Tenant has 5+ complaints | 1. Send "komplainku" | Only 3 most recent complaints returned |
| WA-078 | Origin region null handling | Tenant with `originRegion=null` | 1. Send "info" | Displays "-" for origin region |
| WA-079 | End date null handling | Lease with `endDate=null` | 1. Send "info" | Displays "Berlangsung" for end date |

---

## Group 15: Background Polling

### 15.1 Notification Polling

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| WA-080 | Poll notifications | Bot running | 1. Wait for 5-second interval | `pollNotifications` called |
| WA-081 | Poll resolved complaints | Bot running, complaint resolved | 1. Complaint marked resolved | Tenant receives notification via template `complaint-resolved` |
| WA-082 | Poll in-progress complaints | Bot running, complaint processed | 1. Complaint marked in_progress | Tenant receives notification via template `complaint-in-progress` |

---

## Template Reference

| Template Name | Parameters | Source |
|--------------|------------|--------|
| `help` | `{fullName}` | help.ts |
| `check-bills` | `{roomNumber, roomType, monthlyPrice, unpaid[], total, hasPaymentLink}` | check-bills.ts |
| `check-complaint` | `{id, description, createdAt, processedAt, resolvedAt, status, resolveNotes, resolverName}` | check-complaint.ts |
| `list-complaints` | `{items[{id, description, createdAt, status}]}` | list-complaints.ts |
| `submit-complaint` | `{id, description, createdAt}` | complaint.ts, lib/complaint.ts |
| `payment-history` | `{paid[{id, amount, dueDate}]}` | payment-history.ts |
| `tenant-info` | `{fullName, phoneNumber, originRegion, roomNumber, roomType, monthlyPrice, startDate, endDate, hasUnpaid}` | tenant-info.ts |
| `unknown-number` | `{}` | index.ts |
| `unknown-command` | `{}` | index.ts |
| `verification-prompt` | `{fullName}` | index.ts |
| `verification-success` | `{fullName}` | index.ts |
| `no-lease-complaint` | `{}` | complaint.ts, submit-complaint.ts |
| `complaint-prompt` | `{}` | complaint.ts |
| `complaint-in-progress` | `{fullName, id, description}` | polls/complaints.ts |
| `complaint-resolved` | `{fullName, id, description, resolveNotes}` | polls/complaints.ts |

---

## Hardcoded Response Strings

| Context | String |
|---------|--------|
| No active lease (tagihan) | `"📍 Anda tidak memiliki kontrak sewa yang aktif."` |
| No payment history | `"Anda tidak memiliki riwayat pembayaran."` |
| No paid invoices | `"Belum ada riwayat pembayaran lunas."` |
| No active lease (info) | `"Anda tidak memiliki kontrak sewa yang aktif."` |
| No complaints | `"Belum ada komplain yang Anda kirimkan."` |
| Complaint not found | `"Komplain dengan ID tersebut tidak ditemukan."` |
| Description too short | `"✏️ Deskripsi terlalu pendek (min 5 karakter). Coba lagi atau ketik *batal* untuk membatalkan."` |
| Complaint cancelled | `"❌ Komplain dibatalkan."` |

---

## Constants

| Constant | Value | Location |
|----------|-------|----------|
| SESSION_TIMEOUT_MS | 5 * 60 * 1000 (5 minutes) | conversation/manager.ts |
| CLEANUP_INTERVAL_MS | 30 * 1000 (30 seconds) | conversation/manager.ts |
| Unknown number cooldown | 30_000 (30 seconds) | index.ts |
| Send rate limit | 1_000 (1 second) | index.ts |
| Poll interval | 5_000 (5 seconds) | index.ts |
| Invoice limit (payment history) | 10 | payment-history.ts |
| Complaint limit (list) | 3 | list-complaints.ts |
| Min description length | 5 characters | conversation/flows/complaint.ts |
