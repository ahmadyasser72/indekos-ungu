# Blackbox Test Cases - Authentication & Account Management

Detailed test cases derived from source code analysis.

---

## 1. Authentication

### 1.1 Login Flow

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| AUTH-001 | Login with valid credentials | User exists in database | 1. Navigate to `/login`<br>2. Enter valid username in "Nama Pengguna" field<br>3. Enter valid password in "Kata Sandi" field<br>4. Click "Masuk" button | Redirect to `/dashboard`. Session created with user info. Audit log records: "User {username} berhasil login" |
| AUTH-002 | Login with invalid username | None | 1. Navigate to `/login`<br>2. Enter non-existent username<br>3. Enter any password<br>4. Click "Masuk" button | Error message: "Username atau password tidak sesuai." displayed in alert-error. User remains on login page. |
| AUTH-003 | Login with wrong password | User exists in database | 1. Navigate to `/login`<br>2. Enter valid username<br>3. Enter incorrect password<br>4. Click "Masuk" button | Error message: "Username atau password tidak sesuai." displayed in alert-error. User remains on login page. |
| AUTH-004 | Login with empty username | None | 1. Navigate to `/login`<br>2. Leave "Nama Pengguna" empty<br>3. Enter any password<br>4. Click "Masuk" button | Browser validation prevents form submission (required field) |
| AUTH-005 | Login with empty password | None | 1. Navigate to `/login`<br>2. Enter any username<br>3. Leave "Kata Sandi" empty<br>4. Click "Masuk" button | Browser validation prevents form submission (required field) |
| AUTH-006 | Logout | User logged in | 1. Click logout button/action | Session destroyed. Redirect to `/login` |

### 1.2 Session & Authorization Guard

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| AUTH-007 | Access dashboard without login | Not logged in | 1. Navigate directly to `/dashboard` | Redirect to `/login` |
| AUTH-008 | Access manage pages without login | Not logged in | 1. Navigate directly to `/dashboard/manage/*` | Redirect to `/login` |
| AUTH-009 | Access manage actions without login | Not logged in | 1. Trigger any `manage.*` action via API/form | Redirect to `/login` |
| AUTH-010 | Session persistence across requests | User logged in | 1. Login successfully<br>2. Navigate to different pages within session | User remains logged in, no redirect to login |

### 1.3 Role-Based Navigation

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| AUTH-011 | Admin sidebar menu | Logged in as `admin` | 1. View sidebar menu | Menu shows: "Dashboard" + "Manajemen" section containing only "Manajemen Akun" |
| AUTH-012 | Owner sidebar menu | Logged in as `owner` | 1. View sidebar menu | Menu shows: "Dashboard" + "Laporan" section (Laporan Transaksi, Laporan Notifikasi, Log Chatbot, Log Audit). No "Manajemen" section. |
| AUTH-013 | Staff sidebar menu | Logged in as `staff` | 1. View sidebar menu | Menu shows: "Dashboard" + "Manajemen" section (Kamar, Penghuni, Komplain - NO Akun) + "Laporan" section |
| AUTH-014 | Owner allowEdit=false | Logged in as `owner` | 1. Navigate to any management page | Edit/create/delete buttons hidden or disabled. allowEdit=false for all operations. |
| AUTH-015 | Staff cannot access accounts page | Logged in as `staff` | 1. Navigate directly to `/dashboard/manage/accounts` | Staff has no sidebar link. If accessed directly, behavior depends on route protection (should be blocked or redirected). |

---

## 2. Account Management (CRUD)

### 2.1 Add Account

**Page**: `/dashboard/manage/accounts` → Click "Tambah Akun" button

**Modal Fields**:
- Username (required, text input)
- Nama Tampilan (required, text input)
- Kata Sandi (required, password input)
- Role Akses (required, select: "Staff (Operasional & Komplain)" or "Owner (Laporan Keuangan)")

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ACCT-001 | Add account with valid data | Logged in as `admin`, allowEdit=true | 1. Click "Tambah Akun" button<br>2. Enter unique username<br>3. Enter display name<br>4. Enter password<br>5. Select role (staff or owner)<br>6. Click "Simpan Akun" | Success message: "Berhasil menambah akun! (ID: {id})". Account appears in list. Audit log: "Membuat akun user: {username} dengan role: {role}" |
| ACCT-002 | Add account with duplicate username | Account with same username exists | 1. Click "Tambah Akun"<br>2. Enter existing username<br>3. Fill other fields<br>4. Click "Simpan Akun" | Error message: "Username tidak tersedia." Account not created. |
| ACCT-003 | Add account with empty username | Logged in as `admin` | 1. Click "Tambah Akun"<br>2. Leave username empty<br>3. Fill other fields<br>4. Click "Simpan Akun" | Browser validation prevents submission (required field) |
| ACCT-004 | Add account with empty display name | Logged in as `admin` | 1. Click "Tambah Akun"<br>2. Leave "Nama Tampilan" empty<br>3. Fill other fields<br>4. Click "Simpan Akun" | Browser validation prevents submission (required field) |
| ACCT-005 | Add account with empty password | Logged in as `admin` | 1. Click "Tambah Akun"<br>2. Leave "Kata Sandi" empty<br>3. Fill other fields<br>4. Click "Simpan Akun" | Browser validation prevents submission (required field) |
| ACCT-006 | Add account without selecting role | Logged in as `admin` | 1. Click "Tambah Akun"<br>2. Leave role as "Pilih hak akses" (default)<br>3. Fill other fields<br>4. Click "Simpan Akun" | Browser validation prevents submission (required field) |
| ACCT-007 | Add account button hidden for owner | Logged in as `owner` (allowEdit=false) | 1. Navigate to `/dashboard/manage/accounts` | "Tambah Akun" button not visible |
| ACCT-008 | Add account button visible for admin | Logged in as `admin` (allowEdit=true) | 1. Navigate to `/dashboard/manage/accounts` | "Tambah Akun" button visible |

### 2.2 Edit Account

**Modal**: Click edit button on account row

**Edit Form Fields**:
- Username (required, pre-filled)
- Nama Tampilan (required, pre-filled)
- Kata Sandi (optional - "Biarkan kosong untuk tidak mengganti")
- Role Akses (required, pre-selected)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ACCT-009 | Edit account with valid changes | Logged in as `admin`, target account exists and is NOT admin role | 1. Click edit button on non-admin account<br>2. Modify username, display name, or role<br>3. Click "Simpan Akun" | Success message: "Berhasil edit akun! (ID: {id})". Changes reflected in list. Audit log: "Mengubah akun user: {username} dengan role: {role}" |
| ACCT-010 | Edit account - change password | Logged in as `admin`, target account exists | 1. Click edit button<br>2. Enter new password in "Kata Sandi" field<br>3. Click "Simpan Akun" | Success message. Password updated in database. |
| ACCT-011 | Edit account - leave password empty | Logged in as `admin`, target account exists | 1. Click edit button<br>2. Leave "Kata Sandi" empty<br>3. Modify other fields<br>4. Click "Simpan Akun" | Success message. Existing password unchanged. |
| ACCT-012 | Edit account - duplicate username | Another account with target username exists | 1. Click edit button on account A<br>2. Change username to match account B<br>3. Click "Simpan Akun" | Error message: "Username tidak tersedia." Changes not saved. |
| ACCT-013 | Edit admin account | Logged in as `admin`, target account has role "admin" | 1. Click edit button on admin account | Modal shows error alert: "Akun admin tidak dapat diedit." No edit form displayed. |
| ACCT-014 | Edit non-existent account | Account ID does not exist in database | 1. Directly access edit modal URL with invalid ID<br>2. Modal loads | Modal shows "Akun" not found component (NotFound label="Akun") |
| ACCT-015 | Edit account - change role from staff to owner | Logged in as `admin`, target account is staff | 1. Click edit button<br>2. Change role from "Staff" to "Owner"<br>3. Click "Simpan Akun" | Success message. Role updated. User's menu access changes on next login. |

### 2.3 Delete Account

**Modal**: Click delete button on account row

**Delete Confirmation** displays:
- Username
- Nama (Display Name)
- Role (badge)
- Terakhir diakses (Last Accessed)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ACCT-016 | Delete non-admin account | Logged in as `admin`, target account exists and is NOT admin role | 1. Click delete button on account<br>2. View confirmation showing account details<br>3. Click "Hapus" | Success message: "Berhasil menghapus akun! (ID: {id})". Account removed from list. Audit log: "Menghapus akun user: {username} ({role})" |
| ACCT-017 | Delete admin account | Logged in as `admin`, target account has role "admin" | 1. Click delete button on admin account | Modal shows error alert: "Akun admin tidak dapat dihapus." No delete button. |
| ACCT-018 | Delete non-existent account | Account ID does not exist | 1. Trigger delete action with invalid ID | Error message: "Akun tidak ditemukan." |
| ACCT-019 | Delete account - cancel operation | Logged in as `admin` | 1. Click delete button<br>2. Close modal without confirming | Account remains unchanged. No action taken. |

---

## 3. Update Own Profile

**Action**: `auth.updateProfile` (self-service profile update)

| ID | Test Case | Precondition | Steps | Expected Result |
|----|-----------|--------------|-------|-----------------|
| ACCT-020 | Update own profile - change display name | User logged in | 1. Navigate to profile settings<br>2. Change display name<br>3. Submit | Profile updated. Session name updated. Audit log: "User {username} mengupdate profil sendiri" |
| ACCT-021 | Update own profile - change username | User logged in | 1. Navigate to profile settings<br>2. Change username to unique value<br>3. Submit | Profile updated. Audit log shows both old and new username in format: "{oldUsername}/{newUsername}" |
| ACCT-022 | Update own profile - duplicate username | Another user has target username | 1. Attempt to change username to existing username | Error message: "Username tidak tersedia." |
| ACCT-023 | Update own profile - change password | User logged in | 1. Navigate to profile settings<br>2. Enter new password<br>3. Submit | Password updated. User can login with new password. |
| ACCT-024 | Update own profile - session invalid | Session expired or invalid | 1. Submit profile update with invalid session | Error message: "Sesi tidak valid." |
| ACCT-025 | Update own profile - user not found | User ID in session does not exist in database | 1. Submit profile update | Error message: "Akun tidak ditemukan." |

---

## 4. Role Permission Matrix

| Role | Dashboard | Manajemen Akun | Manajemen Kamar/Penghuni/Komplain | Laporan | allowEdit |
|------|-----------|----------------|-----------------------------------|---------|-----------|
| admin | ✓ | ✓ | ✗ | ✗ | true |
| owner | ✓ | ✗ | ✗ | ✓ | false |
| staff | ✓ | ✗ | ✓ | ✓ | true |

### Navigation Details

**Admin Menu**:
- Dashboard
- Manajemen: Manajemen Akun only

**Owner Menu**:
- Dashboard
- Laporan: Laporan Transaksi, Laporan Notifikasi, Log Chatbot, Log Audit

**Staff Menu**:
- Dashboard
- Manajemen: Manajemen Kamar, Manajemen Penghuni, Manajemen Komplain (NO Akun)
- Laporan: Laporan Transaksi, Laporan Notifikasi, Log Chatbot, Log Audit

---

## 5. Error Messages Reference

| Error Condition | Error Message | Source |
|-----------------|---------------|--------|
| Invalid credentials | "Username atau password tidak sesuai." | `auth.ts:114` |
| Duplicate username (add) | "Username tidak tersedia." | `accounts.ts:31` |
| Duplicate username (edit) | "Username tidak tersedia." | `accounts.ts:79` |
| Duplicate username (profile) | "Username tidak tersedia." | `auth.ts:38` |
| User not found (edit) | "Akun tidak ditemukan." | `accounts.ts:91` |
| User not found (delete) | "Akun tidak ditemukan." | `accounts.ts:135` |
| User not found (profile) | "Akun tidak ditemukan." | `auth.ts:52` |
| Invalid session | "Sesi tidak valid." | `auth.ts:24` |
| Admin edit protection (UI) | "Akun admin tidak dapat diedit." | `modal/edit/[id].astro:28` |
| Admin delete protection (UI) | "Akun admin tidak dapat dihapus." | `modal/delete/[id].astro:34` |

---

## 6. UI Labels Reference

### Login Page
- Page title: "Login"
- App name: "Indekos Ungu"
- App subtitle: "Sistem Manajemen Indekos"
- Username label: "Nama Pengguna"
- Username placeholder: "Masukkan username"
- Password label: "Kata Sandi"
- Password placeholder: "Masukkan password"
- Submit button: "Masuk"

### Accounts Page
- Page title: "Manajemen Akun"
- Page description: "Kelola kredensial dan hak akses pengguna sistem"
- Add button: "Tambah Akun"

### Add Account Modal
- Modal title: "Tambah Akun Baru"
- Modal icon: "lucide:user-plus"
- Submit button: "Simpan Akun"
- Role options: "Staff (Operasional & Komplain)", "Owner (Laporan Keuangan)"
- Role placeholder: "Pilih hak akses"

### Edit Account Modal
- Modal title: "Edit Akun"
- Modal icon: "lucide:pencil"
- Submit button: "Simpan Akun"
- Password placeholder: "Biarkan kosong untuk tidak mengganti"

### Delete Account Modal
- Modal title: "Hapus Akun"
- Modal icon: "lucide:user-x"
- Submit button: "Hapus" (btn-error styling)
- Displayed fields: Username, Nama, Role, Terakhir diakses

### Success Messages
- Add: "Berhasil menambah akun! (ID: {id})"
- Edit: "Berhasil edit akun! (ID: {id})"
- Delete: "Berhasil menghapus akun! (ID: {id})"
