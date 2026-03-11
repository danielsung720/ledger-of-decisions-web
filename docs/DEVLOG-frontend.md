# 前端開發日誌

## 2026-03-11 - 專案初始化：README、Pre-commit、CI/CD

**做了什麼**：

- 新增 `README.md`（英文）與 `README.zh-TW.md`（繁體中文），涵蓋技術棧、快速開始、架構說明、頁面路由、Store、Composables、設計系統、測試與開發指令
- 初始化 git repo（`git init`）
- 安裝 `husky` + `lint-staged`，設定 pre-commit hook：staged 檔案自動跑 `prettier --write` + `eslint`，全專案跑 `vitest run`
- 新增 `npm run format` / `npm run format:check` script
- 全專案執行一次 `prettier --write` 統一格式（修正 105 個檔案）
- 建立 `.github/workflows/ci.yml`：format check、lint、typecheck、test:coverage 四個 jobs 並行
- 建立 `.github/workflows/deploy.yml`：CI gate 通過後，PR 部署 Vercel preview，push main 部署 production

**為什麼**：

- 準備將專案推上 GitHub，需要完整的本地品質守門（pre-commit）與自動化 CI/CD 流程
- README 雙語版對照後端 `ledger-of-decisions-api` 的格式，維持專案文件一致性

**備註**：

- Vercel 部署需在 GitHub repo Secrets 設定 `VERCEL_TOKEN`、`VERCEL_ORG_ID`、`VERCEL_PROJECT_ID`
- lint-staged 採 `--write` 自動修正而非 `--check`，避免開發者每次都需手動跑 prettier
