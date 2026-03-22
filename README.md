# LIVE_TIKTOK_FE

Hệ thống theo dõi Live TikTok (Standard 2026).

## Tech Stack
- **Core:** React + TypeScript (Next.js 16)
- **State Management:** Redux Toolkit (Standard Thunks - No RTK Query)
- **Form:** React Hook Form + Zod
- **Style:** Tailwind CSS (Mobile-first)
- **API:** Axios
- **Test:** Vitest + React Testing Library

---

## Naming Conventions (QUAN TRỌNG)
Tuân thủ tuyệt đối để tránh lỗi Case Sensitive khi deploy lên Linux/Vercel.

| Đối tượng | Quy tắc (Case) | Ví dụ Đúng  | Ví dụ Sai  |
| :--- | :--- | :--- | :--- |
| **Folders** | **kebab-case** | `medical-records/`, `patient-profile/` | `MedicalRecords`, `medicalRecords` |
| **Components** (`.tsx`) | **PascalCase** | `LoginForm.tsx`, `AllergySection.tsx` | `loginForm.tsx`, `allergySection.tsx` |
| **Pages** (`.tsx`) | **PascalCase** | `MedicalRecordPage.tsx` | `medicalRecordPage.tsx` |
| **Logic Files** (`.ts`) | **camelCase** | `authSlice.ts`, `medicalApi.ts` | `AuthSlice.ts` |
| **Types/Utils** (`.ts`) | **camelCase** | `schemas.ts`, `formatDate.ts` | `Schemas.ts` |
| **Component Name** | **PascalCase** | `export const LoginForm = () => {}` | `export const loginForm = ...` |

### Quy ước Zod/Types
- File Zod schema: `*.schema.ts` (vd: `serviceTemplate.schema.ts`).
- File domain types: `*.types.ts` (vd: `serviceTemplate.types.ts`).

### Quy ước tên file theo vai trò (chung cho toàn dự án)
- API (`features/*/api`): `*Api.ts` hoặc verb rõ nghĩa (`getMe.ts`, `login.ts`); **không dùng `*.api.ts`**.
- Hooks: `use*.ts` / `use*.tsx` (vd: `useViewRecord.ts`).
- Redux:
  - Slice: `*Slice.ts` hoặc `*.slice.ts` (thống nhất theo từng feature)
  - Thunks: `*.thunks.ts` hoặc `*Thunk.ts` (thống nhất theo từng feature)
  - Selectors: `*.selectors.ts`
  - State: `*.state.ts`
- Types/Schema:
  - Domain types: `*.types.ts`
  - Zod schema: `*.schema.ts`
- Utils/helpers/formatters: camelCase + hậu tố ngữ nghĩa (`formatters.ts`, `dateUtils.ts`...).

---

## Project Structure (Bulletproof React)

Cấu trúc thư mục được tổ chức theo **Feature**. Bên dưới gồm 2 phần:
1) Cấu trúc tổng quát của dự án.
2) Mẫu chi tiết cho feature lớn (ví dụ Paraclinical).

### Tổng quát
```text
src/
├── features/
│   ├── live-monitor/          <-- Tên feature (kebab-case)
│   │   ├── api/               <-- Chứa file gọi Axios thuần
│   │   ├── components/        <-- UI Components (PascalCase)
│   │   ├── pages/             <-- Page Components (PascalCase)
│   │   ├── hooks/             <-- (optional) custom hooks theo feature
│   │   ├── stores/            <-- (optional) Redux logic theo feature
│   │   └── types/             <-- Zod Schemas & TS Types
├── components/                <-- Shared Components (Button, Input)
├── stores/                    <-- Global Store Configuration
└── utils/                     <-- Shared Utilities
```

Ghi chú:
- `stores/` **không bắt buộc** cho mọi feature.
- Chỉ tạo `stores/` khi feature cần Redux state dùng lại giữa nhiều component/page hoặc cần async flow qua thunk/slice.
- Feature nhỏ có thể chỉ cần `api/ + hooks/ + components/ + pages/ + types/ (+ utils)`.

### Style Structure
Từ phase hiện tại, style được chuẩn hoá về `src/styles` để dễ maintain và tránh vỡ UI khi chỉnh sửa màu/font.

```text
src/
├── index.css                          <-- entry import style chính
└── styles/
    └── live-monitor/
        ├── live-monitor-ui.css        <-- tokens chung (màu, font, text size, line-height, radius...)
        ├── chat.css
        ├── gift.css
        └── stats.css
```

---

## Performance Rules

### 1. NO GENERIC BARREL FILES
Không dùng `index.ts` chung chung để gom export (ảnh hưởng tree-shaking và khó trace import).
Cho phép **barrel có tên rõ ràng** theo feature (vd: `liveMonitor.ts` trong `stores/`).

*   **SAI:** `import { Button, Input } from '@/components';`
*   **ĐÚNG:** `import { Button } from '@/components/ui/Button';`

---

## Redux Flow (Standard Thunk)

Chúng ta sử dụng mô hình **Thunk** tiêu chuẩn (không dùng RTK Query cho dự án này).

1.  **API Layer (`api/`)**: Chỉ chứa hàm gọi Axios, trả về Promise.
2.  **Slice Layer (`slices/`)**:
    *   Dùng `createAsyncThunk` để gọi API.
    *   Dùng `extraReducers` để xử lý 3 trạng thái: `pending`, `fulfilled`, `rejected`.

---

## Hướng dẫn sử dụng (How to Use)

Sau khi khởi động cả Frontend và Backend, hãy thực hiện các bước sau:

1.  **Đăng nhập**: Sử dụng tài khoản Demo hoặc đăng ký mới tại trang `/login`.
2.  **Thêm TikToker**: Vào mục "Quản lý TikToker" để thêm @ID TikTok bạn muốn monitor.
3.  **Bắt đầu Monitor**: Nhấn vào nút "Xem Live" của một TikToker. FE sẽ gửi yêu cầu tới Backend để khởi tạo kết nối.
4.  **Theo dõi Real-time**: Khi Backend kết nối thành công, màn hình sẽ hiển thị số người xem, lượt tim và danh sách quà tặng/chat cập nhật liên tục mà không cần load lại trang.

---

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Testing (Vitest)
Test được đặt ngay trong thư mục feature (Colocation).

```bash
npm run test
```
