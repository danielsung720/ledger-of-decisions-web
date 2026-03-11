# Ledger of Decisions Web

[English](README.md) | [繁體中文](README.zh-TW.md)

Frontend web application for **Ledger of Decisions** - a personal finance app that tracks not just _what_ you spend, but _why_ you spend it.

## Tech Stack

- **Framework**: Nuxt 3
- **Language**: Vue 3 + TypeScript
- **Styling**: Tailwind CSS (custom design system)
- **State Management**: Pinia
- **Charts**: Chart.js + vue-chartjs
- **Validation**: Zod
- **Testing**: Vitest + @vue/test-utils
- **E2E Testing**: Playwright
- **Port**: 3000

## Quick Start

### Prerequisites

- Node.js 20+
- Backend API running at `http://localhost:8080` (see [ledger-of-decisions-api](../ledger-of-decisions-api))

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment

Key runtime config variables (set in `.env` or environment):

| Variable                | Default                 | Description                            |
| ----------------------- | ----------------------- | -------------------------------------- |
| `NUXT_API_PROXY_TARGET` | `http://localhost:8080` | Backend API proxy target (server-side) |
| `NUXT_PUBLIC_API_BASE`  | `/api`                  | Public API base path (client-side)     |

API calls from the browser go through Nuxt's built-in proxy (`/api/**` → backend), avoiding CORS issues in development.

### Docker

```bash
# Start with Docker Compose
docker compose up -d
```

## Architecture

```
ledger-of-decisions-web/
├── assets/css/           # Global styles and theme variables
├── components/
│   ├── ui/               # Base UI components (AppButton, AppInput, AppModal, ...)
│   ├── layout/           # Layout components (TheHeader, UserMenu)
│   ├── expense/          # Expense record components
│   ├── dashboard/        # Dashboard page components
│   ├── review/           # Review / analytics components
│   ├── recurring/        # Recurring expense components
│   ├── cashflow/         # Cash flow components
│   ├── settings/         # Settings page components
│   └── shared/           # Shared utility components (EmptyState)
├── composables/          # Vue composables (business logic, API calls)
├── stores/               # Pinia stores (global state)
├── types/                # TypeScript type definitions
├── utils/                # Utility functions (API client, formatters, constants)
├── pages/                # File-based routing
├── layouts/              # App layouts (default, auth)
├── middleware/           # Route middleware
└── plugins/              # Nuxt plugins
```

**Patterns**: Composable-first logic, Store for global state, ViewModel composables for page-level concerns.

## Pages

| Route                | File                          | Description                                    |
| -------------------- | ----------------------------- | ---------------------------------------------- |
| `/`                  | `pages/index.vue`             | Dashboard (stats summary, recent records)      |
| `/records`           | `pages/records.vue`           | Expense records with filters and batch actions |
| `/review`            | `pages/review.vue`            | Analytics and decision review                  |
| `/recurring`         | `pages/recurring.vue`         | Recurring expense templates                    |
| `/cashflow`          | `pages/cashflow.vue`          | Cash flow planning and projection              |
| `/settings`          | `pages/settings/index.vue`    | Theme and preferences                          |
| `/settings/password` | `pages/settings/password.vue` | Change password                                |
| `/login`             | `pages/login.vue`             | Login                                          |
| `/register`          | `pages/register.vue`          | Registration                                   |
| `/verify-email`      | `pages/verify-email.vue`      | Email verification                             |
| `/forgot-password`   | `pages/forgot-password.vue`   | Password reset request                         |
| `/reset-password`    | `pages/reset-password.vue`    | Password reset completion                      |

## State Management (Pinia Stores)

| Store             | File                          | Responsibility                       |
| ----------------- | ----------------------------- | ------------------------------------ |
| Auth              | `stores/auth.ts`              | Login state, user info, token        |
| Expense           | `stores/expense.ts`           | Expense records, pagination, filters |
| Recurring Expense | `stores/recurring-expense.ts` | Recurring templates                  |
| Cash Flow         | `stores/cashflow.ts`          | Income, items, summary, projection   |
| Theme             | `stores/theme.ts`             | Theme selection and persistence      |
| UI                | `stores/ui.ts`                | Global UI state (modals, loading)    |

## Composables

| Composable                         | Responsibility            |
| ---------------------------------- | ------------------------- |
| `useAuth`                          | Authentication logic      |
| `useExpenses`                      | Expense CRUD operations   |
| `useRecurringExpenses`             | Recurring expense CRUD    |
| `useCashFlow`                      | Cash flow CRUD            |
| `useReview`                        | Review statistics         |
| `useToast`                         | Toast notifications       |
| `useDateRange`                     | Date range selection      |
| `useFormValidation`                | Form validation helpers   |
| `useExpenseListViewModel`          | Records page view logic   |
| `useDashboardViewModel`            | Dashboard page view logic |
| `useReviewViewModel`               | Review page view logic    |
| `useRecurringExpenseListViewModel` | Recurring page view logic |
| `useCashFlowViewModel`             | Cash flow page view logic |

## Type Definitions

### Enums

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

### Core Models

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

## Design System

The project uses a custom Tailwind CSS design system with:

- **Theme-aware colors** via CSS variables (supports multiple themes)
- **Intent colors**: Each spending intent (`necessity`, `efficiency`, `enjoyment`, `recovery`, `impulse`) has a dedicated color palette
- **Typography**: Inter + Noto Sans TC (body), DM Sans (mono/display)
- **Warm neutral palette**: cream, warm-gray scales
- **Consistent spacing, radius, and shadow tokens**

## Testing

### Unit Tests (Vitest)

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

Tests live alongside components in `__tests__/` subdirectories. Minimum coverage: 80%.

### E2E Tests (Playwright)

```bash
# Run E2E tests (local)
npm run test:e2e

# Open UI mode
npm run test:e2e:ui
```

For reliable E2E testing use the Docker environment in `ledger-of-decisions-e2e/`.

## Development Commands

```bash
# Development server
npm run dev

# Type checking
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Run tests
npm run test
npm run test:coverage

# Production build
npm run build
npm run preview
```

## License

MIT
