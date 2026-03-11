# Ledger of Decisions Web

[English](README.md) | [繁體中文](README.zh-TW.md)

**Ledger of Decisions（決策帳本）** 的前端 Web 應用程式 - 一款不只記錄「花了什麼」，更追蹤「為什麼花」的個人財務應用。

## 技術棧

- **框架**: Nuxt 3
- **語言**: Vue 3 + TypeScript
- **樣式**: Tailwind CSS（自訂設計系統）
- **狀態管理**: Pinia
- **圖表**: Chart.js + vue-chartjs
- **驗證**: Zod
- **單元測試**: Vitest + @vue/test-utils
- **E2E 測試**: Playwright
- **端口**: 3000

## 快速開始

### 前置需求

- Node.js 20+
- 後端 API 運行於 `http://localhost:8080`（參見 [ledger-of-decisions-api](../ledger-of-decisions-api)）

### 安裝

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

應用程式將運行於 `http://localhost:3000`。

### 環境設定

主要 Runtime Config 變數（設定於 `.env` 或環境變數）：

| 變數                    | 預設值                  | 說明                          |
| ----------------------- | ----------------------- | ----------------------------- |
| `NUXT_API_PROXY_TARGET` | `http://localhost:8080` | 後端 API 代理目標（伺服器端） |
| `NUXT_PUBLIC_API_BASE`  | `/api`                  | 公開 API 基礎路徑（客戶端）   |

瀏覽器的 API 請求透過 Nuxt 內建代理（`/api/**` → 後端），開發環境下無需處理 CORS 問題。

### Docker

```bash
# 使用 Docker Compose 啟動
docker compose up -d
```

## 架構

```
ledger-of-decisions-web/
├── assets/css/           # 全域樣式與主題變數
├── components/
│   ├── ui/               # 基礎 UI 元件（AppButton、AppInput、AppModal…）
│   ├── layout/           # 佈局元件（TheHeader、UserMenu）
│   ├── expense/          # 消費記錄元件
│   ├── dashboard/        # 首頁元件
│   ├── review/           # 回顧／統計元件
│   ├── recurring/        # 週期性支出元件
│   ├── cashflow/         # 現金流元件
│   ├── settings/         # 設置頁元件
│   └── shared/           # 共用元件（EmptyState）
├── composables/          # Vue Composables（業務邏輯、API 呼叫）
├── stores/               # Pinia Store（全域狀態）
├── types/                # TypeScript 型別定義
├── utils/                # 工具函式（API Client、格式化、常數）
├── pages/                # 檔案式路由
├── layouts/              # 應用佈局（default、auth）
├── middleware/           # 路由中間件
└── plugins/              # Nuxt 插件
```

**設計模式**: Composable 優先業務邏輯、Store 管理全域狀態、ViewModel Composable 處理頁面層邏輯。

## 頁面路由

| 路由                 | 檔案                          | 說明                       |
| -------------------- | ----------------------------- | -------------------------- |
| `/`                  | `pages/index.vue`             | 首頁（統計摘要、最近記錄） |
| `/records`           | `pages/records.vue`           | 消費記錄（篩選、批次操作） |
| `/review`            | `pages/review.vue`            | 分析與決策回顧             |
| `/recurring`         | `pages/recurring.vue`         | 週期性支出範本             |
| `/cashflow`          | `pages/cashflow.vue`          | 現金流規劃與預測           |
| `/settings`          | `pages/settings/index.vue`    | 主題與偏好設定             |
| `/settings/password` | `pages/settings/password.vue` | 修改密碼                   |
| `/login`             | `pages/login.vue`             | 登入                       |
| `/register`          | `pages/register.vue`          | 註冊                       |
| `/verify-email`      | `pages/verify-email.vue`      | Email 驗證                 |
| `/forgot-password`   | `pages/forgot-password.vue`   | 請求密碼重設               |
| `/reset-password`    | `pages/reset-password.vue`    | 完成密碼重設               |

## 狀態管理（Pinia Store）

| Store             | 檔案                          | 職責                           |
| ----------------- | ----------------------------- | ------------------------------ |
| Auth              | `stores/auth.ts`              | 登入狀態、使用者資訊、Token    |
| Expense           | `stores/expense.ts`           | 消費記錄、分頁、篩選條件       |
| Recurring Expense | `stores/recurring-expense.ts` | 週期性支出範本                 |
| Cash Flow         | `stores/cashflow.ts`          | 收入、現金流項目、摘要、預測   |
| Theme             | `stores/theme.ts`             | 主題選擇與持久化               |
| UI                | `stores/ui.ts`                | 全域 UI 狀態（Modal、Loading） |

## Composables

| Composable                         | 職責               |
| ---------------------------------- | ------------------ |
| `useAuth`                          | 認證邏輯           |
| `useExpenses`                      | 消費記錄 CRUD      |
| `useRecurringExpenses`             | 週期性支出 CRUD    |
| `useCashFlow`                      | 現金流 CRUD        |
| `useReview`                        | 回顧統計           |
| `useToast`                         | Toast 通知         |
| `useDateRange`                     | 日期區間選擇       |
| `useFormValidation`                | 表單驗證輔助       |
| `useExpenseListViewModel`          | 記錄頁面邏輯       |
| `useDashboardViewModel`            | 首頁邏輯           |
| `useReviewViewModel`               | 回顧頁面邏輯       |
| `useRecurringExpenseListViewModel` | 週期性支出頁面邏輯 |
| `useCashFlowViewModel`             | 現金流頁面邏輯     |

## 型別定義

### 列舉

```ts
enum Category {
  Food,
  Transport,
  Training,
  Living,
  Other,
}
enum Intent {
  Necessity,
  Efficiency,
  Enjoyment,
  Recovery,
  Impulse,
}
enum ConfidenceLevel {
  High,
  Medium,
  Low,
}
```

### 核心資料模型

```ts
interface Expense {
  id: number
  amount: number
  category: Category
  intent: Intent
  occurred_at: string // 'YYYY-MM-DD'
  confidence_level: ConfidenceLevel | null
  note: string | null
  currency: string
}
```

## 設計系統

本專案使用自訂 Tailwind CSS 設計系統：

- **主題感知色彩**：透過 CSS 變數支援多主題切換
- **意圖專屬色彩**：每種消費意圖（`necessity`、`efficiency`、`enjoyment`、`recovery`、`impulse`）均有專屬色盤
- **字體**：Inter + Noto Sans TC（內文）、DM Sans（等寬/展示）
- **暖色中性色盤**：cream、warm-gray 系列
- **一致的間距、圓角、陰影 Token**

## 測試

### 單元測試（Vitest）

```bash
# 執行測試
npm run test

# 監聽模式
npm run test:watch

# 含覆蓋率報告
npm run test:coverage
```

測試檔案放置於元件旁的 `__tests__/` 資料夾。最低覆蓋率要求：80%。

### E2E 測試（Playwright）

```bash
# 執行 E2E 測試（本地）
npm run test:e2e

# 開啟 UI 模式
npm run test:e2e:ui
```

穩定的 E2E 測試建議使用 `ledger-of-decisions-e2e/` 的 Docker 環境執行。

## 開發指令

```bash
# 開發伺服器
npm run dev

# 型別檢查
npm run typecheck

# Lint 檢查
npm run lint
npm run lint:fix

# 執行測試
npm run test
npm run test:coverage

# 正式環境建置
npm run build
npm run preview
```

## 授權條款

MIT
