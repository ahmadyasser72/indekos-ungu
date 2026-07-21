# Blackbox Test Cases - Room & Tenant Management

**Feature Area**: Manajemen Kamar dan Penghuni  
**Routes**: `/dashboard/manage/rooms`, `/dashboard/manage/tenants`  
**Access**: staff role (users with `allowEdit` permission can perform CRUD operations)

---

## Room Management

**Page**: Manajemen Kamar  
**Title**: "Manajemen Kamar"  
**Description**: "Kelola inventaris, spesifikasi, dan status hunian kamar indekos"  
**Route**: `/dashboard/manage/rooms`

### Room Status Values

| Status | Label | Badge Class |
|--------|-------|-------------|
| occupied | Terisi | badge-success |
| vacant | Kosong | badge-warning |
| inactive | Nonaktif | badge-neutral |

### Room Types

| Type | Label |
|------|-------|
| standard | Standar |
| premium | Premium |

### Stats Displayed

- Total Kamar
- Kamar Terisi
- Kamar Kosong
- Kamar Nonaktif

---

### ROOM-001: View Room List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-001 | Display room list | Rooms exist in system | 1. Navigate to `/dashboard/manage/rooms` | Room cards displayed in grid layout showing: room number, room type, monthly price, tenant name (or "-"), status badge |
| ROOM-002 | Display stats | Rooms exist | 1. Navigate to room list | Stats bar shows: Total Kamar, Kamar Terisi, Kamar Kosong, Kamar Nonaktif with correct counts |
| ROOM-003 | Empty state | No rooms in system | 1. Navigate to room list | Empty state displayed (no room cards) |
| ROOM-004 | View as staff without edit permission | Logged in as staff with `allowEdit=false` | 1. Navigate to room list | Rooms displayed, "Tambah Kamar" button not visible, Edit/Delete actions not visible |
| ROOM-005 | View as staff with edit permission | Logged in as staff with `allowEdit=true` | 1. Navigate to room list | Rooms displayed, "Tambah Kamar" button visible, Edit/Delete actions visible |

---

### ROOM-002: Search Rooms

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-006 | Search by room number | Rooms exist with number "101" | 1. Enter "101" in search field "Cari nomor/penghuni..." | Rooms with number containing "101" displayed |
| ROOM-007 | Search by room type | Rooms exist with type "Premium" | 1. Enter "Premium" in search field | Rooms with type "Premium" displayed |
| ROOM-008 | Search by tenant name | Room occupied by "John Doe" | 1. Enter "John" in search field | Room with tenant named "John Doe" displayed |
| ROOM-009 | Search with no results | Rooms exist | 1. Enter "XYZ123" in search field | No rooms displayed |
| ROOM-010 | Clear search | Search performed | 1. Clear search field | All rooms displayed |

---

### ROOM-003: Filter Rooms

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-011 | Filter by status "Terisi" | Mix of room statuses | 1. Click filter popover 2. Select "Terisi" under Status | Only occupied rooms displayed (isActive=true, has active lease) |
| ROOM-012 | Filter by status "Kosong" | Mix of room statuses | 1. Click filter popover 2. Select "Kosong" under Status | Only vacant rooms displayed (isActive=true, no active lease) |
| ROOM-013 | Filter by status "Nonaktif" | Mix of room statuses | 1. Click filter popover 2. Select "Nonaktif" under Status | Only inactive rooms displayed (isActive=false) |
| ROOM-014 | Filter by type "Standar" | Mix of room types | 1. Click filter popover 2. Select "Standar" under Tipe Kamar | Only standard rooms displayed |
| ROOM-015 | Filter by type "Premium" | Mix of room types | 1. Click filter popover 2. Select "Premium" under Tipe Kamar | Only premium rooms displayed |
| ROOM-016 | Combined filters | Mix of rooms | 1. Select status "Terisi" 2. Select type "Premium" | Only occupied premium rooms displayed |
| ROOM-017 | Clear filters | Filters applied | 1. Deselect all filter options | All rooms displayed |

---

### ROOM-004: Add Room

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-018 | Add room with valid data | Staff with `allowEdit=true` | 1. Click "Tambah Kamar" button 2. Enter room number 3. Select room type 4. Enter monthly price 5. Submit | Success message: "Berhasil menambah kamar! (ID: X)", room appears in list |
| ROOM-019 | Add room with inactive status | Staff with `allowEdit=true` | 1. Click "Tambah Kamar" 2. Fill form 3. Uncheck "Aktif" checkbox 4. Submit | Room created with status "Nonaktif" |
| ROOM-020 | Add room with duplicate number | Room "101" exists | 1. Click "Tambah Kamar" 2. Enter room number "101" 3. Submit | Error message: "Nomor kamar sudah terdaftar." |
| ROOM-021 | Add room without edit permission | Staff with `allowEdit=false` | 1. Navigate to room list | "Tambah Kamar" button not visible |
| ROOM-022 | Add room with missing required fields | Staff with `allowEdit=true` | 1. Click "Tambah Kamar" 2. Leave room number empty 3. Submit | Form validation error |

---

### ROOM-005: Edit Room

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-023 | Edit room details | Staff with `allowEdit=true`, room exists | 1. Click actions menu on room card 2. Click "Edit Kamar" 3. Modify room type 4. Submit | Success message: "Berhasil edit kamar! (ID: X)", changes reflected |
| ROOM-024 | Edit room number to duplicate | Room "101" and "102" exist | 1. Edit room "102" 2. Change number to "101" 3. Submit | Error message: "Nomor kamar sudah terdaftar." |
| ROOM-025 | Edit room price | Staff with `allowEdit=true`, room exists | 1. Edit room 2. Change monthly price 3. Submit | Success message, new price displayed |
| ROOM-026 | Edit room status to inactive | Occupied room | 1. Edit room 2. Uncheck "Aktif" 3. Submit | Success message, status shows "Nonaktif" |
| ROOM-027 | Edit non-existent room | Staff with `allowEdit=true` | 1. Directly call edit action with invalid ID | Error message: "Kamar tidak ditemukan." |
| ROOM-028 | Edit room without edit permission | Staff with `allowEdit=false` | 1. View room card | Actions menu not visible |

---

### ROOM-006: Delete Room

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-029 | Delete vacant room | Staff with `allowEdit=true`, room has no tenant | 1. Click actions menu 2. Click "Hapus" 3. Confirm deletion | Success message: "Berhasil hapus kamar! (ID: X)", room removed from list |
| ROOM-030 | Delete occupied room | Room has active tenant | 1. Attempt to delete | Error message: "Kamar masih digunakan [Tenant Name]." |
| ROOM-031 | Delete non-existent room | Staff with `allowEdit=true` | 1. Directly call delete action with invalid ID | Error message: "Kamar tidak ditemukan." |
| ROOM-032 | Delete room without edit permission | Staff with `allowEdit=false` | 1. View room card | "Hapus" option not visible |

---

### ROOM-007: View Room Detail

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-033 | View room detail modal | Room exists | 1. Click "Detail" button on room card | Modal opens showing: room number, type, price, facilities, tenant info (if occupied) |
| ROOM-034 | View detail of occupied room | Room has active tenant | 1. Click "Detail" | Modal shows tenant name and contact info |
| ROOM-035 | View detail of vacant room | Room has no tenant | 1. Click "Detail" | Modal shows tenant field as "-" or empty |

---

### ROOM-008: PDF Export

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ROOM-036 | Download PDF report | Rooms exist | 1. Click "PDF" button | PDF file downloaded with current filter/search applied |
| ROOM-037 | Download PDF with filters | Filters applied | 1. Apply status filter "Terisi" 2. Click "PDF" | PDF contains only filtered rooms |

---

## Tenant Management

**Page**: Manajemen Penghuni  
**Title**: "Manajemen Penghuni"  
**Description**: "Kelola data identitas, kontak, dan masa aktif sewa penghuni"  
**Route**: `/dashboard/manage/tenants`

### Tenant Status Values

| Status | Label | Badge Class |
|--------|-------|-------------|
| active | Aktif | badge-success |
| completed | Selesai | badge-neutral opacity-60 |
| moved | Pindah | badge-neutral |

### Stats Displayed

- Total Penghuni (desc: "Seluruh data penghuni")
- Sewa Aktif (desc: "X sudah selesai")
- Terverifikasi (desc: "X belum verifikasi")

### Table Columns

- Nama Penghuni (with avatar initials, "Belum Verifikasi" badge if unverified)
- No. HP (WhatsApp link)
- Kamar
- Awal Sewa
- Akhir Sewa
- Status
- Aksi

---

### TENANT-001: View Tenant List

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-001 | Display tenant list | Tenants exist in system | 1. Navigate to `/dashboard/manage/tenants` | Table displayed with all tenants showing: name, phone, room, start/end dates, status |
| TENANT-002 | Display stats | Tenants exist | 1. Navigate to tenant list | Stats bar shows: Total Penghuni, Sewa Aktif, Terverifikasi with correct counts |
| TENANT-003 | Empty state | No tenants in system | 1. Navigate to tenant list | Empty table state displayed |
| TENANT-004 | View as staff without edit permission | Staff with `allowEdit=false` | 1. Navigate to tenant list | Tenants displayed, "Tambah Penghuni" button not visible, edit actions not visible |
| TENANT-005 | View as staff with edit permission | Staff with `allowEdit=true` | 1. Navigate to tenant list | Tenants displayed, "Tambah Penghuni" button visible, edit actions visible |
| TENANT-006 | View unverified tenant badge | Tenant with `isVerified=false` | 1. View tenant list | Tenant name shows "Belum Verifikasi" warning badge, row has opacity-60 |
| TENANT-007 | Click WhatsApp link | Tenant with phone number | 1. Click phone link | Opens WhatsApp with `https://wa.me/[phoneNumber]` |

---

### TENANT-002: Search Tenants

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-008 | Search by tenant name | Tenant "John Doe" exists | 1. Enter "John" in search field "Cari nama penghuni..." | Tenant "John Doe" displayed |
| TENANT-009 | Search by phone number | Tenant with phone "62812345678" | 1. Enter "123" in search field | Tenant with matching phone displayed |
| TENANT-010 | Search by room number | Tenant in room "101" | 1. Enter "101" in search field | Tenant in room "101" displayed |
| TENANT-011 | Search with no results | Tenants exist | 1. Enter "XYZ123" in search field | No tenants displayed |
| TENANT-012 | Clear search | Search performed | 1. Clear search field | All tenants displayed |

---

### TENANT-003: Filter Tenants

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-013 | Filter by status "Aktif" | Mix of tenant statuses | 1. Click filter popover 2. Select "Aktif" under Status | Only active tenants displayed (has active lease) |
| TENANT-014 | Filter by status "Selesai" | Mix of tenant statuses | 1. Click filter popover 2. Select "Selesai" under Status | Only completed tenants displayed (no active lease) |
| TENANT-015 | Clear filters | Filters applied | 1. Deselect all filter options | All tenants displayed |

---

### TENANT-004: Add Tenant (Create New Lease)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-016 | Add tenant with valid data | Staff with `allowEdit=true`, vacant room exists | 1. Click "Tambah Penghuni" 2. Enter full name 3. Enter phone number 4. Select room 5. Enter start date 6. Submit | Success message: "Berhasil menambah kontrak sewa penghuni baru! (ID: X)", tenant appears in list |
| TENANT-017 | Add tenant with optional fields | Staff with `allowEdit=true` | 1. Click "Tambah Penghuni" 2. Fill required fields 3. Enter origin region 4. Enter end date 5. Submit | Tenant created with all fields populated |
| TENANT-018 | Add tenant with duplicate phone | Phone "62812345678" already registered | 1. Click "Tambah Penghuni" 2. Enter same phone number 3. Submit | Error message: "Nomor HP sudah terdaftar." |
| TENANT-019 | Add tenant to occupied room | Room already has active tenant | 1. Try to add tenant to occupied room 2. Submit | Error message: "Kamar sudah terisi." |
| TENANT-020 | Add tenant without edit permission | Staff with `allowEdit=false` | 1. Navigate to tenant list | "Tambah Penghuni" button not visible |
| TENANT-021 | Phone number normalization | Staff with `allowEdit=true` | 1. Add tenant with phone "08123456789" | Phone stored as "62812345678" (normalized to 62 prefix) |
| TENANT-022 | Add tenant with missing required fields | Staff with `allowEdit=true` | 1. Click "Tambah Penghuni" 2. Leave name empty 3. Submit | Form validation error |

---

### TENANT-005: Edit Tenant

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-023 | Edit tenant name | Staff with `allowEdit=true`, tenant exists | 1. Click actions menu 2. Click "Edit" 3. Change full name 4. Submit | Success message: "Berhasil mengubah data penghuni! (ID: X)", changes reflected |
| TENANT-024 | Edit tenant phone | Staff with `allowEdit=true`, tenant exists | 1. Edit tenant 2. Change phone number 3. Submit | Success message, tenant `isVerified` reset to false, notification created for phone change |
| TENANT-025 | Edit phone to duplicate | Phone already registered to another tenant | 1. Edit tenant 2. Enter duplicate phone 3. Submit | Error message: "Nomor HP sudah terdaftar." |
| TENANT-026 | Edit non-existent tenant | Staff with `allowEdit=true` | 1. Directly call edit action with invalid ID | Error message: "Penghuni tidak ditemukan." |
| TENANT-027 | Edit origin region | Staff with `allowEdit=true`, tenant exists | 1. Edit tenant 2. Change/update origin region 3. Submit | Success message, changes reflected |
| TENANT-028 | Edit tenant without edit permission | Staff with `allowEdit=false` | 1. View tenant row | "Edit" option not visible in actions menu |

---

### TENANT-006: Terminate Lease (End Tenancy)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-029 | Terminate active lease | Staff with `allowEdit=true`, tenant has active lease | 1. Click actions menu 2. Click "Berhenti Menginap" 3. Confirm | Success message: "Berhasil menghentikan sewa penghuni! (ID: X)", lease ends, status becomes "Selesai" |
| TENANT-030 | Terminate lease - no active lease | Tenant has no active lease | 1. View actions menu | "Berhenti Menginap" option not visible (only available for active tenants) |
| TENANT-031 | Terminate without edit permission | Staff with `allowEdit=false` | 1. View tenant row | Actions menu shows only "Chat" and "Detail" buttons |

---

### TENANT-007: Move Tenant to Different Room

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-032 | Move tenant to vacant room | Staff with `allowEdit=true`, tenant has active lease, vacant room exists | 1. Click actions menu 2. Click "Pindah Kamar" 3. Select new room 4. Enter start date 5. Submit | Success message: "Berhasil memindahkan penghuni ke kamar baru! (ID: X)", old lease deactivated, new lease created |
| TENANT-033 | Move tenant to occupied room | Target room has active tenant | 1. Attempt to move to occupied room 2. Submit | Error message: "Kamar tujuan sudah terisi." |
| TENANT-034 | Move tenant without active lease | Tenant has no active lease | 1. Attempt to access move modal | Error message: "Penghuni tidak memiliki kontrak sewa aktif." |
| TENANT-035 | Move non-existent tenant | Staff with `allowEdit=true` | 1. Directly call move action with invalid ID | Error message: "Penghuni tidak ditemukan." |
| TENANT-036 | Move option visibility | Tenant is active | 1. View actions menu for active tenant | "Pindah Kamar" option visible |
| TENANT-037 | Move option hidden | Tenant is inactive (completed) | 1. View actions menu for inactive tenant | "Pindah Kamar" option not visible |

---

### TENANT-008: Re-register Tenant (New Lease for Existing Tenant)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-038 | Re-register completed tenant | Staff with `allowEdit=true`, tenant has no active lease, vacant room | 1. Click actions menu on completed tenant 2. Click "Sewa Baru" 3. Select room 4. Enter start date 5. Submit | Success message: "Berhasil mendaftarkan ulang sewa penghuni! (ID: X)", new lease created |
| TENANT-039 | Re-register tenant already has active lease | Tenant has active lease | 1. View actions menu for active tenant | "Sewa Baru" option not visible |
| TENANT-040 | Re-register to occupied room | Target room occupied | 1. Attempt to register to occupied room 2. Submit | Error message: "Kamar sudah terisi." |
| TENANT-041 | Re-register non-existent tenant | Staff with `allowEdit=true` | 1. Directly call register action with invalid ID | Error message: "Penghuni tidak ditemukan." |
| TENANT-042 | Re-register with active lease error | Tenant has active lease | 1. Directly call register action | Error message: "Penghuni masih memiliki kontrak sewa aktif." |

---

### TENANT-009: View Tenant Detail

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-043 | View tenant detail modal | Tenant exists | 1. Click "Detail" button | Modal opens showing: full name, phone, origin region, room, lease dates, verification status |
| TENANT-044 | View detail of active tenant | Tenant has active lease | 1. Click "Detail" | Modal shows current room and active dates |
| TENANT-045 | View detail of completed tenant | Tenant has no active lease | 1. Click "Detail" | Modal shows no current room or "-" |

---

### TENANT-010: Chat with Tenant

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-046 | Open chat modal | Tenant exists | 1. Click "Chat" button | Chat modal opens for messaging |
| TENANT-047 | Chat button visible for all users | Any staff role | 1. View tenant list | "Chat" button visible regardless of edit permission |

---

### TENANT-011: PDF Export

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| TENANT-048 | Download PDF report | Tenants exist | 1. Click "PDF" button | PDF file downloaded with current filter/search applied |
| TENANT-049 | Download PDF with filters | Filters applied | 1. Apply status filter "Aktif" 2. Click "PDF" | PDF contains only filtered tenants |

---

## Permission Matrix

### Room Management Actions

| Action | allowEdit=true | allowEdit=false |
|--------|---------------|-----------------|
| View room list | ✓ | ✓ |
| Search rooms | ✓ | ✓ |
| Filter rooms | ✓ | ✓ |
| View room detail | ✓ | ✓ |
| Download PDF | ✓ | ✓ |
| Add room | ✓ | ✗ (button hidden) |
| Edit room | ✓ | ✗ (action hidden) |
| Delete room | ✓ | ✗ (action hidden) |

### Tenant Management Actions

| Action | allowEdit=true | allowEdit=false |
|--------|---------------|-----------------|
| View tenant list | ✓ | ✓ |
| Search tenants | ✓ | ✓ |
| Filter tenants | ✓ | ✓ |
| View tenant detail | ✓ | ✓ |
| Download PDF | ✓ | ✓ |
| Chat with tenant | ✓ | ✓ |
| Add tenant | ✓ | ✗ (button hidden) |
| Edit tenant | ✓ | ✗ (action hidden) |
| Terminate lease | ✓ | ✗ (action hidden) |
| Move tenant | ✓ | ✗ (action hidden) |
| Re-register tenant | ✓ | ✗ (action hidden) |

---

## Error Messages Reference

### Room Errors

| Error Code | Message | Trigger |
|------------|---------|---------|
| BAD_REQUEST | "Nomor kamar sudah terdaftar." | Add/Edit room with duplicate room number |
| NOT_FOUND | "Kamar tidak ditemukan." | Edit/Delete non-existent room |
| BAD_REQUEST | "Kamar masih digunakan [Tenant Name]." | Delete room with active tenant |

### Tenant Errors

| Error Code | Message | Trigger |
|------------|---------|---------|
| BAD_REQUEST | "Nomor HP sudah terdaftar." | Add/Edit tenant with duplicate phone number |
| BAD_REQUEST | "Kamar sudah terisi." | Add tenant to occupied room OR Move tenant to occupied room OR Re-register to occupied room |
| BAD_REQUEST | "Penghuni tidak ditemukan." | Edit/Move/Register non-existent tenant |
| BAD_REQUEST | "Penghuni masih memiliki kontrak sewa aktif." | Re-register tenant who already has active lease |
| BAD_REQUEST | "Penghuni tidak memiliki kontrak sewa aktif." | Move tenant without active lease |

---

## Success Messages Reference

### Room Success Messages

| Action | Success Message |
|--------|-----------------|
| Add room | "Berhasil menambah kamar! (ID: X)" |
| Edit room | "Berhasil edit kamar! (ID: X)" |
| Delete room | "Berhasil hapus kamar! (ID: X)" |

### Tenant Success Messages

| Action | Success Message |
|--------|-----------------|
| Add tenant | "Berhasil menambah kontrak sewa penghuni baru! (ID: X)" |
| Edit tenant | "Berhasil mengubah data penghuni! (ID: X)" |
| Terminate lease | "Berhasil menghentikan sewa penghuni! (ID: X)" |
| Move tenant | "Berhasil memindahkan penghuni ke kamar baru! (ID: X)" |
| Re-register tenant | "Berhasil mendaftarkan ulang sewa penghuni! (ID: X)" |

---

## Notes

1. **Phone Normalization**: Phone numbers are automatically normalized to 62 prefix (Indonesia format). Input "08123456789" becomes "62812345678".

2. **Verification Reset**: When editing a tenant's phone number, `isVerified` is automatically reset to `false` and a phone_change notification is created.

3. **Room Status Logic**:
   - "Terisi" (occupied): `isActive=true` AND has active lease with tenant
   - "Kosong" (vacant): `isActive=true` AND no active lease
   - "Nonaktif" (inactive): `isActive=false`

4. **Tenant Status Logic**:
   - "Aktif": Has active lease (`lease.isActive=true`)
   - "Selesai": No active lease

5. **Move Operation**: Moving a tenant:
   - Deactivates old lease (sets `isActive=false`, sets `endDate` to current date)
   - Creates new lease with new room and start date

6. **Audit Logging**: All CRUD operations are logged with audit trail including action type, entity, ID, and description.

7. **PDF Export**: The PDF download link preserves current search and filter parameters via query string.
