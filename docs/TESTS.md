# 前端測試文檔

本文檔詳細記錄 `ledger-of-decisions-web` 專案的所有測試案例。

## 測試概覽

| 類別        | 測試檔案數 | 測試案例數 | 覆蓋率   |
| ----------- | ---------- | ---------- | -------- |
| Utils       | 3          | 120        | 100%     |
| Stores      | 3          | 72         | 94.73%   |
| Composables | 6          | 91         | 83.76%   |
| Components  | 19         | 291        | 91-100%  |
| **總計**    | **31**     | **574**    | **93%+** |

---

## 1. Utils 測試

### 1.1 formatters.spec.ts (38 個測試)

測試檔案：`tests/unit/utils/formatters.spec.ts`

#### formatCurrency

| 測試案例                                       | 描述                                    |
| ---------------------------------------------- | --------------------------------------- |
| formats number as TWD currency                 | 將數字格式化為 TWD 貨幣 (1500 → $1,500) |
| formats string amount as currency              | 將字串金額格式化為貨幣                  |
| formats large numbers with thousand separators | 大數字加入千分位分隔符                  |
| formats zero correctly                         | 正確格式化零值                          |
| returns $0 for NaN values                      | NaN 值返回 $0                           |
| returns $0 for empty string                    | 空字串返回 $0                           |
| formats decimal numbers without decimals       | 小數四捨五入取整                        |

#### formatNumber

| 測試案例                                | 描述                 |
| --------------------------------------- | -------------------- |
| formats number with thousand separators | 數字加入千分位分隔符 |
| formats string number                   | 格式化字串數字       |
| returns 0 for NaN values                | NaN 值返回 0         |
| formats zero correctly                  | 正確格式化零值       |

#### formatDate

| 測試案例                                | 描述                         |
| --------------------------------------- | ---------------------------- |
| formats Date object with default format | 使用預設格式格式化 Date 物件 |
| formats ISO string with default format  | 格式化 ISO 字串              |
| formats date with custom format         | 使用自訂格式                 |

#### formatDateWithWeekday

| 測試案例                             | 描述                      |
| ------------------------------------ | ------------------------- |
| formats date with weekday in Chinese | 格式化日期並包含中文星期  |
| formats ISO string with weekday      | 格式化 ISO 字串並包含星期 |

#### formatDateForApi

| 測試案例                     | 描述                                            |
| ---------------------------- | ----------------------------------------------- |
| formats date for API request | 格式化日期為 API 請求格式 (yyyy-MM-dd HH:mm:ss) |

#### formatRelativeTime

| 測試案例                            | 描述                      |
| ----------------------------------- | ------------------------- |
| formats recent time as relative     | 格式化為相對時間          |
| formats ISO string as relative time | 格式化 ISO 字串為相對時間 |

#### formatSmartDate

| 測試案例                                    | 描述                          |
| ------------------------------------------- | ----------------------------- |
| formats today as "今日" with time           | 今天顯示為「今日 HH:mm」      |
| formats yesterday as "昨日" with time       | 昨天顯示為「昨日 HH:mm」      |
| formats older dates with month/day and time | 較早日期顯示為「MM/dd HH:mm」 |

#### formatTime

| 測試案例                           | 描述                  |
| ---------------------------------- | --------------------- |
| formats Date object to time string | 格式化為時間字串      |
| formats ISO string to time         | 格式化 ISO 字串為時間 |

#### formatPercentage

| 測試案例                                 | 描述                     |
| ---------------------------------------- | ------------------------ |
| formats percentage with default decimals | 預設一位小數格式化百分比 |
| formats percentage with custom decimals  | 自訂小數位數             |
| formats integer percentage               | 整數百分比               |

#### formatChangePercentage

| 測試案例                                   | 描述             |
| ------------------------------------------ | ---------------- |
| formats positive change with plus sign     | 正數變化加上正號 |
| formats negative change without extra sign | 負數變化保留負號 |
| formats zero without sign                  | 零值不加符號     |

#### getTrendDirection

| 測試案例                           | 描述            |
| ---------------------------------- | --------------- |
| returns "up" for positive change   | 正數返回 "up"   |
| returns "down" for negative change | 負數返回 "down" |
| returns "stable" for zero change   | 零返回 "stable" |

#### getTrendColorClass

| 測試案例                                                  | 描述                         |
| --------------------------------------------------------- | ---------------------------- |
| returns gray class for stable trend                       | 穩定趨勢返回灰色 class       |
| returns success class for up trend when positive is good  | 上升趨勢（正向好）返回成功色 |
| returns alert class for up trend when positive is bad     | 上升趨勢（正向壞）返回警告色 |
| returns alert class for down trend when positive is good  | 下降趨勢（正向好）返回警告色 |
| returns success class for down trend when positive is bad | 下降趨勢（正向壞）返回成功色 |

---

### 1.2 validation.spec.ts (51 個測試)

測試檔案：`tests/unit/utils/validation.spec.ts`

#### expenseFormSchema

| 測試案例                                       | 描述                                                        |
| ---------------------------------------------- | ----------------------------------------------------------- |
| validates a complete valid expense form        | 驗證完整有效的消費表單                                      |
| validates minimal required fields              | 驗證最小必填欄位                                            |
| rejects missing amount                         | 拒絕缺少金額                                                |
| rejects zero amount                            | 拒絕零金額                                                  |
| rejects negative amount                        | 拒絕負數金額                                                |
| rejects amount exceeding 10 million            | 拒絕超過一千萬的金額                                        |
| rejects invalid category                       | 拒絕無效的類別                                              |
| validates all valid categories                 | 驗證所有有效類別 (food, transport, training, living, other) |
| rejects empty occurred_at                      | 拒絕空的發生日期                                            |
| rejects invalid intent                         | 拒絕無效的意圖                                              |
| validates all valid intents                    | 驗證所有有效意圖                                            |
| validates all valid confidence levels          | 驗證所有有效信心程度                                        |
| allows null confidence_level                   | 允許 null 的信心程度                                        |
| rejects note exceeding 500 characters          | 拒絕超過 500 字的備註                                       |
| rejects decision_note exceeding 500 characters | 拒絕超過 500 字的決策備註                                   |

#### dateRangeSchema

| 測試案例                          | 描述                     |
| --------------------------------- | ------------------------ |
| validates empty date range        | 驗證空日期範圍           |
| validates start date only         | 僅驗證開始日期           |
| validates end date only           | 僅驗證結束日期           |
| validates valid date range        | 驗證有效日期範圍         |
| validates same start and end date | 驗證相同開始和結束日期   |
| rejects start date after end date | 拒絕開始日期晚於結束日期 |

#### recurringExpenseFormSchema

| 測試案例                                    | 描述                                              |
| ------------------------------------------- | ------------------------------------------------- |
| validates complete valid recurring expense  | 驗證完整有效的固定支出                            |
| validates with optional fields              | 驗證包含選填欄位                                  |
| rejects missing name                        | 拒絕缺少名稱                                      |
| rejects empty name                          | 拒絕空名稱                                        |
| rejects name exceeding 255 characters       | 拒絕超過 255 字的名稱                             |
| rejects zero amount_min                     | 拒絕零最小金額                                    |
| rejects amount_min exceeding 10 million     | 拒絕超過一千萬的最小金額                          |
| validates all frequency types               | 驗證所有頻率類型 (daily, weekly, monthly, yearly) |
| rejects frequency_interval less than 1      | 拒絕小於 1 的頻率間隔                             |
| rejects frequency_interval greater than 100 | 拒絕大於 100 的頻率間隔                           |
| validates day_of_month in range 1-31        | 驗證月份中的日期在 1-31 範圍內                    |
| rejects day_of_month outside range          | 拒絕超出範圍的日期                                |
| validates month_of_year in range 1-12       | 驗證月份在 1-12 範圍內                            |
| rejects month_of_year outside range         | 拒絕超出範圍的月份                                |
| validates day_of_week in range 0-6          | 驗證星期在 0-6 範圍內                             |
| rejects amount_max less than amount_min     | 拒絕最大金額小於最小金額                          |
| allows amount_max equal to amount_min       | 允許最大金額等於最小金額                          |
| rejects end_date before start_date          | 拒絕結束日期早於開始日期                          |
| allows end_date equal to start_date         | 允許結束日期等於開始日期                          |

#### validateForm

| 測試案例                            | 描述                       |
| ----------------------------------- | -------------------------- |
| returns success true for valid data | 有效資料返回 success: true |
| returns errors for invalid data     | 無效資料返回錯誤           |
| returns first error for each field  | 每個欄位只返回第一個錯誤   |

#### isValidCategory

| 測試案例                           | 描述               |
| ---------------------------------- | ------------------ |
| returns true for valid categories  | 有效類別返回 true  |
| returns false for invalid category | 無效類別返回 false |

#### isValidIntent

| 測試案例                         | 描述               |
| -------------------------------- | ------------------ |
| returns true for valid intents   | 有效意圖返回 true  |
| returns false for invalid intent | 無效意圖返回 false |

#### isValidConfidenceLevel

| 測試案例                                   | 描述                   |
| ------------------------------------------ | ---------------------- |
| returns true for valid confidence levels   | 有效信心程度返回 true  |
| returns false for invalid confidence level | 無效信心程度返回 false |

#### isValidFrequencyType

| 測試案例                                 | 描述                   |
| ---------------------------------------- | ---------------------- |
| returns true for valid frequency types   | 有效頻率類型返回 true  |
| returns false for invalid frequency type | 無效頻率類型返回 false |

---

### 1.3 constants.spec.ts (31 個測試)

測試檔案：`tests/unit/utils/constants.spec.ts`

#### CATEGORY_OPTIONS

| 測試案例                             | 描述                   |
| ------------------------------------ | ---------------------- |
| contains all 5 categories            | 包含所有 5 個類別      |
| has correct category values          | 擁有正確的類別值       |
| has label and icon for each category | 每個類別都有標籤和圖示 |

#### CATEGORY_MAP

| 測試案例                      | 描述             |
| ----------------------------- | ---------------- |
| maps all categories correctly | 正確映射所有類別 |

#### INTENT_OPTIONS

| 測試案例                                | 描述                     |
| --------------------------------------- | ------------------------ |
| contains all 5 intents                  | 包含所有 5 個意圖        |
| has correct intent values               | 擁有正確的意圖值         |
| has all required fields for each intent | 每個意圖都有所有必要欄位 |

#### INTENT_MAP

| 測試案例                   | 描述             |
| -------------------------- | ---------------- |
| maps all intents correctly | 正確映射所有意圖 |

#### INTENT_COLORS

| 測試案例                      | 描述                       |
| ----------------------------- | -------------------------- |
| has hex color for each intent | 每個意圖都有十六進位顏色值 |

#### CONFIDENCE_OPTIONS

| 測試案例                               | 描述                     |
| -------------------------------------- | ------------------------ |
| contains all 3 confidence levels       | 包含所有 3 個信心程度    |
| has correct confidence values          | 擁有正確的信心程度值     |
| has all required fields for each level | 每個程度都有所有必要欄位 |

#### CONFIDENCE_MAP

| 測試案例                             | 描述                 |
| ------------------------------------ | -------------------- |
| maps all confidence levels correctly | 正確映射所有信心程度 |

#### DATE_RANGE_PRESETS

| 測試案例                  | 描述              |
| ------------------------- | ----------------- |
| contains all 4 presets    | 包含所有 4 個預設 |
| has correct preset values | 擁有正確的預設值  |

#### SORT_OPTIONS

| 測試案例                    | 描述                  |
| --------------------------- | --------------------- |
| contains all 4 sort options | 包含所有 4 個排序選項 |
| has correct sort values     | 擁有正確的排序值      |

#### PAGE_SIZE_OPTIONS

| 測試案例                         | 描述                   |
| -------------------------------- | ---------------------- |
| has default page size of 15      | 預設頁面大小為 15      |
| contains valid page size options | 包含有效的頁面大小選項 |
| includes default page size       | 包含預設頁面大小       |

#### FREQUENCY_TYPE_OPTIONS

| 測試案例                          | 描述                   |
| --------------------------------- | ---------------------- |
| contains all 4 frequency types    | 包含所有 4 個頻率類型  |
| has correct frequency type values | 擁有正確的頻率類型值   |
| has label and icon for each type  | 每個類型都有標籤和圖示 |

#### FREQUENCY_TYPE_MAP

| 測試案例                           | 描述                 |
| ---------------------------------- | -------------------- |
| maps all frequency types correctly | 正確映射所有頻率類型 |

#### DAY_OF_WEEK_OPTIONS

| 測試案例                                   | 描述                 |
| ------------------------------------------ | -------------------- |
| contains all 7 days                        | 包含所有 7 天        |
| has correct day values 0-6                 | 擁有正確的日期值 0-6 |
| has both label and shortLabel for each day | 每天都有標籤和短標籤 |

#### DAY_OF_WEEK_MAP

| 測試案例                | 描述           |
| ----------------------- | -------------- |
| maps all days correctly | 正確映射所有天 |

#### MONTH_OPTIONS

| 測試案例                          | 描述                  |
| --------------------------------- | --------------------- |
| contains all 12 months            | 包含所有 12 個月      |
| has correct month values 1-12     | 擁有正確的月份值 1-12 |
| has Chinese labels for each month | 每個月都有中文標籤    |

---

## 2. Stores 測試

### 2.1 ui.spec.ts (20 個測試)

測試檔案：`tests/unit/stores/ui.spec.ts`

#### initial state

| 測試案例                  | 描述               |
| ------------------------- | ------------------ |
| has correct initial state | 擁有正確的初始狀態 |

#### openExpenseModal

| 測試案例                                | 描述                              |
| --------------------------------------- | --------------------------------- |
| opens modal without expense id          | 不帶 expense id 打開 modal        |
| opens modal with expense id for editing | 帶 expense id 打開 modal 進行編輯 |

#### closeExpenseModal

| 測試案例                           | 描述                     |
| ---------------------------------- | ------------------------ |
| closes modal and clears editing id | 關閉 modal 並清除編輯 id |

#### openConfirmDialog

| 測試案例                        | 描述                    |
| ------------------------------- | ----------------------- |
| opens confirm dialog with props | 帶 props 打開確認對話框 |

#### closeConfirmDialog

| 測試案例                               | 描述                       |
| -------------------------------------- | -------------------------- |
| closes confirm dialog and clears props | 關閉確認對話框並清除 props |

#### setConfirmDialogLoading

| 測試案例                                | 描述                              |
| --------------------------------------- | --------------------------------- |
| sets loading state on confirm dialog    | 設定確認對話框的載入狀態          |
| does nothing if no confirm dialog props | 如果沒有對話框 props 則不做任何事 |

#### showToast

| 測試案例                              | 描述                          |
| ------------------------------------- | ----------------------------- |
| adds toast to list                    | 將 toast 加入列表             |
| adds toast with message               | 加入帶訊息的 toast            |
| auto removes toast after duration     | 在持續時間後自動移除 toast    |
| uses default duration of 5000ms       | 使用預設的 5000ms 持續時間    |
| does not auto remove if duration is 0 | 如果持續時間為 0 則不自動移除 |

#### removeToast

| 測試案例                     | 描述                       |
| ---------------------------- | -------------------------- |
| removes toast by id          | 根據 id 移除 toast         |
| does nothing if id not found | 如果找不到 id 則不做任何事 |

#### convenience toast methods

| 測試案例                    | 描述                   |
| --------------------------- | ---------------------- |
| success shows success toast | success 顯示成功 toast |
| success with message        | success 帶訊息         |
| warning shows warning toast | warning 顯示警告 toast |
| error shows error toast     | error 顯示錯誤 toast   |
| info shows info toast       | info 顯示資訊 toast    |

---

### 2.2 expense.spec.ts (28 個測試)

測試檔案：`tests/unit/stores/expense.spec.ts`

#### initial state

| 測試案例                  | 描述               |
| ------------------------- | ------------------ |
| has correct initial state | 擁有正確的初始狀態 |

#### getters

| 測試案例                                   | 描述                            |
| ------------------------------------------ | ------------------------------- |
| hasExpenses returns false when empty       | 空列表時 hasExpenses 返回 false |
| hasExpenses returns true when has expenses | 有消費時 hasExpenses 返回 true  |
| totalPages returns 1 when no pagination    | 沒有分頁時 totalPages 返回 1    |
| totalPages returns correct value           | 返回正確的總頁數                |
| currentPage returns 1 when no pagination   | 沒有分頁時 currentPage 返回 1   |
| currentPage returns correct value          | 返回正確的當前頁                |
| totalItems returns 0 when no pagination    | 沒有分頁時 totalItems 返回 0    |
| totalItems returns correct value           | 返回正確的總項目數              |

#### fetchExpenses

| 測試案例                      | 描述               |
| ----------------------------- | ------------------ |
| fetches expenses successfully | 成功獲取消費列表   |
| sets loading during fetch     | 獲取時設定載入狀態 |
| handles fetch error           | 處理獲取錯誤       |
| passes params to API          | 傳遞參數給 API     |

#### fetchExpenseById

| 測試案例                            | 描述             |
| ----------------------------------- | ---------------- |
| fetches single expense successfully | 成功獲取單筆消費 |
| handles fetch error                 | 處理獲取錯誤     |

#### createExpense

| 測試案例                              | 描述                 |
| ------------------------------------- | -------------------- |
| creates expense and adds to list      | 建立消費並加入列表   |
| adds new expense to beginning of list | 將新消費加入列表開頭 |
| handles create error                  | 處理建立錯誤         |

#### updateExpense

| 測試案例                                            | 描述                          |
| --------------------------------------------------- | ----------------------------- |
| updates expense in list                             | 更新列表中的消費              |
| updates currentExpense if it matches                | 如果匹配則更新 currentExpense |
| does not update currentExpense if id does not match | 如果 id 不匹配則不更新        |

#### deleteExpense

| 測試案例                            | 描述                          |
| ----------------------------------- | ----------------------------- |
| removes expense from list           | 從列表中移除消費              |
| clears currentExpense if it matches | 如果匹配則清除 currentExpense |
| handles delete error                | 處理刪除錯誤                  |

#### setFilters

| 測試案例                          | 描述                 |
| --------------------------------- | -------------------- |
| merges new filters with existing  | 將新過濾器與現有合併 |
| overwrites existing filter values | 覆蓋現有過濾器值     |

#### clearFilters

| 測試案例                  | 描述               |
| ------------------------- | ------------------ |
| resets filters to default | 重設過濾器為預設值 |

#### clearCurrentExpense

| 測試案例               | 描述         |
| ---------------------- | ------------ |
| clears current expense | 清除當前消費 |

---

### 2.3 recurring-expense.spec.ts (24 個測試)

測試檔案：`tests/unit/stores/recurring-expense.spec.ts`

#### initial state

| 測試案例                  | 描述               |
| ------------------------- | ------------------ |
| has correct initial state | 擁有正確的初始狀態 |

#### getters

| 測試案例                                         | 描述               |
| ------------------------------------------------ | ------------------ |
| hasRecurringExpenses returns false when empty    | 空列表時返回 false |
| hasRecurringExpenses returns true when has items | 有項目時返回 true  |
| activeRecurringExpenses filters active only      | 過濾出僅啟用的項目 |
| inactiveRecurringExpenses filters inactive only  | 過濾出僅停用的項目 |
| totalPages returns 1 when no pagination          | 沒有分頁時返回 1   |
| currentPage returns 1 when no pagination         | 沒有分頁時返回 1   |
| totalItems returns 0 when no pagination          | 沒有分頁時返回 0   |

#### fetchRecurringExpenses

| 測試案例                                | 描述                 |
| --------------------------------------- | -------------------- |
| fetches recurring expenses successfully | 成功獲取固定支出列表 |
| handles fetch error                     | 處理獲取錯誤         |
| passes params to API                    | 傳遞參數給 API       |

#### fetchRecurringExpenseById

| 測試案例                         | 描述             |
| -------------------------------- | ---------------- |
| fetches single recurring expense | 獲取單筆固定支出 |

#### createRecurringExpense

| 測試案例                              | 描述               |
| ------------------------------------- | ------------------ |
| creates and adds to beginning of list | 建立並加入列表開頭 |

#### updateRecurringExpense

| 測試案例                                   | 描述                   |
| ------------------------------------------ | ---------------------- |
| updates in list using immutable pattern    | 使用不可變模式更新列表 |
| updates currentRecurringExpense if matches | 如果匹配則更新當前項目 |

#### deleteRecurringExpense

| 測試案例                                  | 描述                   |
| ----------------------------------------- | ---------------------- |
| removes from list                         | 從列表中移除           |
| clears currentRecurringExpense if matches | 如果匹配則清除當前項目 |

#### fetchUpcoming

| 測試案例                  | 描述               |
| ------------------------- | ------------------ |
| fetches upcoming expenses | 獲取即將到期的支出 |

#### generateExpense

| 測試案例                         | 描述                   |
| -------------------------------- | ---------------------- |
| generates expense from recurring | 從固定支出生成消費記錄 |
| works without data parameter     | 不帶資料參數也能運作   |

#### fetchHistory

| 測試案例                              | 描述                   |
| ------------------------------------- | ---------------------- |
| fetches history for recurring expense | 獲取固定支出的歷史記錄 |

#### setFilters

| 測試案例       | 描述       |
| -------------- | ---------- |
| merges filters | 合併過濾器 |

#### clearFilters

| 測試案例                       | 描述               |
| ------------------------------ | ------------------ |
| resets filters to empty object | 重設過濾器為空物件 |

#### clearCurrentRecurringExpense

| 測試案例                   | 描述                   |
| -------------------------- | ---------------------- |
| clears current and history | 清除當前項目和歷史記錄 |

---

## 3. Composables 測試

### 3.1 useFormValidation.spec.ts (20 個測試)

測試檔案：`tests/unit/composables/useFormValidation.spec.ts`

#### initial state

| 測試案例                     | 描述                       |
| ---------------------------- | -------------------------- |
| has empty errors and touched | 擁有空的 errors 和 touched |

#### validate

| 測試案例                                        | 描述                     |
| ----------------------------------------------- | ------------------------ |
| returns true for valid data                     | 有效資料返回 true        |
| returns false for invalid data                  | 無效資料返回 false       |
| clears previous errors on successful validation | 成功驗證時清除先前的錯誤 |
| only keeps first error for each field           | 每個欄位只保留第一個錯誤 |

#### validateField

| 測試案例                     | 描述               |
| ---------------------------- | ------------------ |
| marks field as touched       | 將欄位標記為已觸碰 |
| sets error for invalid field | 為無效欄位設定錯誤 |
| clears error for valid field | 為有效欄位清除錯誤 |

#### getError

| 測試案例                                     | 描述                     |
| -------------------------------------------- | ------------------------ |
| returns error message for field              | 返回欄位的錯誤訊息       |
| returns empty string for field without error | 沒有錯誤的欄位返回空字串 |

#### hasError

| 測試案例                              | 描述                 |
| ------------------------------------- | -------------------- |
| returns true when field has error     | 有錯誤時返回 true    |
| returns false when field has no error | 沒有錯誤時返回 false |

#### isTouched

| 測試案例                                | 描述               |
| --------------------------------------- | ------------------ |
| returns true when field is touched      | 已觸碰時返回 true  |
| returns false when field is not touched | 未觸碰時返回 false |

#### touch

| 測試案例               | 描述               |
| ---------------------- | ------------------ |
| marks field as touched | 將欄位標記為已觸碰 |

#### reset

| 測試案例                            | 描述                   |
| ----------------------------------- | ---------------------- |
| clears all errors and touched state | 清除所有錯誤和觸碰狀態 |

#### setError

| 測試案例               | 描述           |
| ---------------------- | -------------- |
| sets error for field   | 為欄位設定錯誤 |
| preserves other errors | 保留其他錯誤   |

#### clearError

| 測試案例                | 描述           |
| ----------------------- | -------------- |
| removes error for field | 移除欄位的錯誤 |
| preserves other errors  | 保留其他錯誤   |

---

### 3.2 useDateRange.spec.ts (13 個測試)

測試檔案：`tests/unit/composables/useDateRange.spec.ts`

#### initial state

| 測試案例                         | 描述                   |
| -------------------------------- | ---------------------- |
| defaults to this_month preset    | 預設為 this_month 預設 |
| has empty custom dates initially | 初始時自訂日期為空     |

#### dateRange computed

| 測試案例                                       | 描述                 |
| ---------------------------------------------- | -------------------- |
| returns today range for today preset           | 今天預設返回今天範圍 |
| returns this week range for this_week preset   | 本週預設返回本週範圍 |
| returns this month range for this_month preset | 本月預設返回本月範圍 |
| returns custom dates for custom preset         | 自訂預設返回自訂日期 |
| defaults to this_month for unknown preset      | 未知預設預設為本月   |

#### setPreset

| 測試案例             | 描述       |
| -------------------- | ---------- |
| changes preset value | 變更預設值 |

#### setCustomRange

| 測試案例                                        | 描述                         |
| ----------------------------------------------- | ---------------------------- |
| sets custom dates and switches to custom preset | 設定自訂日期並切換到自訂預設 |

#### getApiParams

| 測試案例                                   | 描述                     |
| ------------------------------------------ | ------------------------ |
| returns preset param for non-custom preset | 非自訂預設返回預設參數   |
| returns date params for custom preset      | 自訂預設返回日期參數     |
| returns this_week params correctly         | 正確返回 this_week 參數  |
| returns this_month params correctly        | 正確返回 this_month 參數 |

---

### 3.3 useToast.spec.ts (7 個測試)

測試檔案：`tests/unit/composables/useToast.spec.ts`

#### success

| 測試案例                        | 描述                   |
| ------------------------------- | ---------------------- |
| adds success toast              | 加入成功 toast         |
| adds success toast with message | 加入帶訊息的成功 toast |

#### warning

| 測試案例           | 描述           |
| ------------------ | -------------- |
| adds warning toast | 加入警告 toast |

#### error

| 測試案例         | 描述           |
| ---------------- | -------------- |
| adds error toast | 加入錯誤 toast |

#### info

| 測試案例        | 描述           |
| --------------- | -------------- |
| adds info toast | 加入資訊 toast |

#### remove

| 測試案例            | 描述               |
| ------------------- | ------------------ |
| removes toast by id | 根據 id 移除 toast |

#### toasts

| 測試案例                      | 描述               |
| ----------------------------- | ------------------ |
| is reactive computed property | 是響應式的計算屬性 |

---

### 3.4 useExpenses.spec.ts (17 個測試)

測試檔案：`tests/unit/composables/useExpenses.spec.ts`

#### computed properties

| 測試案例                           | 描述                      |
| ---------------------------------- | ------------------------- |
| exposes expenses from store        | 從 store 暴露 expenses    |
| exposes loading from store         | 從 store 暴露 loading     |
| exposes error from store           | 從 store 暴露 error       |
| exposes hasExpenses from store     | 從 store 暴露 hasExpenses |
| exposes pagination info from store | 從 store 暴露分頁資訊     |

#### fetchExpenses

| 測試案例                     | 描述                        |
| ---------------------------- | --------------------------- |
| calls store fetchExpenses    | 呼叫 store 的 fetchExpenses |
| shows error toast on failure | 失敗時顯示錯誤 toast        |
| passes params to store       | 傳遞參數給 store            |

#### createExpense

| 測試案例                                | 描述                     |
| --------------------------------------- | ------------------------ |
| creates expense and shows success toast | 建立消費並顯示成功 toast |
| shows error toast on failure            | 失敗時顯示錯誤 toast     |

#### updateExpense

| 測試案例                                | 描述                     |
| --------------------------------------- | ------------------------ |
| updates expense and shows success toast | 更新消費並顯示成功 toast |
| shows error toast on failure            | 失敗時顯示錯誤 toast     |

#### deleteExpense

| 測試案例                                | 描述                     |
| --------------------------------------- | ------------------------ |
| deletes expense and shows success toast | 刪除消費並顯示成功 toast |
| shows error toast on failure            | 失敗時顯示錯誤 toast     |

#### confirmDelete

| 測試案例                                         | 描述                            |
| ------------------------------------------------ | ------------------------------- |
| opens confirm dialog with correct props          | 使用正確的 props 打開確認對話框 |
| deletes expense on confirm                       | 確認時刪除消費                  |
| calls onSuccess callback after successful delete | 成功刪除後呼叫 onSuccess 回呼   |

---

### 3.5 useRecurringExpenses.spec.ts (18 個測試)

測試檔案：`tests/unit/composables/useRecurringExpenses.spec.ts`

#### computed properties

| 測試案例                                     | 描述                                    |
| -------------------------------------------- | --------------------------------------- |
| exposes recurringExpenses from store         | 從 store 暴露 recurringExpenses         |
| exposes activeRecurringExpenses from store   | 從 store 暴露 activeRecurringExpenses   |
| exposes inactiveRecurringExpenses from store | 從 store 暴露 inactiveRecurringExpenses |

#### fetchRecurringExpenses

| 測試案例                                 | 描述                     |
| ---------------------------------------- | ------------------------ |
| fetches and shows error toast on failure | 獲取失敗時顯示錯誤 toast |

#### fetchRecurringExpenseById

| 測試案例                     | 描述                 |
| ---------------------------- | -------------------- |
| returns recurring expense    | 返回固定支出         |
| shows error toast on failure | 失敗時顯示錯誤 toast |

#### createRecurringExpense

| 測試案例                        | 描述                 |
| ------------------------------- | -------------------- |
| creates and shows success toast | 建立並顯示成功 toast |
| shows error toast on failure    | 失敗時顯示錯誤 toast |

#### updateRecurringExpense

| 測試案例                        | 描述                 |
| ------------------------------- | -------------------- |
| updates and shows success toast | 更新並顯示成功 toast |

#### deleteRecurringExpense

| 測試案例                        | 描述                 |
| ------------------------------- | -------------------- |
| deletes and shows success toast | 刪除並顯示成功 toast |

#### toggleActive

| 測試案例                            | 描述                 |
| ----------------------------------- | -------------------- |
| activates and shows success toast   | 啟用並顯示成功 toast |
| deactivates and shows success toast | 停用並顯示成功 toast |

#### fetchUpcoming

| 測試案例                  | 描述               |
| ------------------------- | ------------------ |
| fetches upcoming expenses | 獲取即將到期的支出 |

#### generateExpense

| 測試案例                                  | 描述                     |
| ----------------------------------------- | ------------------------ |
| generates expense and shows success toast | 生成消費並顯示成功 toast |

#### fetchHistory

| 測試案例        | 描述         |
| --------------- | ------------ |
| fetches history | 獲取歷史記錄 |

#### confirmDelete

| 測試案例             | 描述           |
| -------------------- | -------------- |
| opens confirm dialog | 打開確認對話框 |

#### confirmGenerate

| 測試案例                            | 描述                       |
| ----------------------------------- | -------------------------- |
| opens confirm dialog with item name | 使用項目名稱打開確認對話框 |

#### clearCurrentRecurringExpense

| 測試案例                   | 描述                   |
| -------------------------- | ---------------------- |
| clears current and history | 清除當前項目和歷史記錄 |

---

### 3.6 useReview.spec.ts (16 個測試)

測試檔案：`tests/unit/composables/useReview.spec.ts`

#### initial state

| 測試案例                    | 描述                    |
| --------------------------- | ----------------------- |
| has null summary initially  | 初始時 summary 為 null  |
| has null trends initially   | 初始時 trends 為 null   |
| has false loading initially | 初始時 loading 為 false |
| has null error initially    | 初始時 error 為 null    |
| has default date range      | 擁有預設的日期範圍      |

#### fetchSummary

| 測試案例                           | 描述                   |
| ---------------------------------- | ---------------------- |
| fetches summary successfully       | 成功獲取摘要           |
| sets loading during fetch          | 獲取時設定載入狀態     |
| handles error and sets error state | 處理錯誤並設定錯誤狀態 |
| passes params to API               | 傳遞參數給 API         |
| passes custom date params to API   | 傳遞自訂日期參數給 API |

#### fetchTrends

| 測試案例                    | 描述         |
| --------------------------- | ------------ |
| fetches trends successfully | 成功獲取趨勢 |
| handles error               | 處理錯誤     |

#### fetchAll

| 測試案例                                    | 描述                |
| ------------------------------------------- | ------------------- |
| fetches both summary and trends in parallel | 並行獲取摘要和趨勢  |
| handles error from either API               | 處理任一 API 的錯誤 |
| passes params to summary API                | 傳遞參數給摘要 API  |

#### setDateRange

| 測試案例           | 描述         |
| ------------------ | ------------ |
| updates date range | 更新日期範圍 |

---

## 4. Components 測試

### 4.1 AppButton.spec.ts (20 個測試)

測試檔案：`tests/components/ui/AppButton.spec.ts`

#### rendering

| 測試案例                  | 描述                  |
| ------------------------- | --------------------- |
| renders slot content      | 渲染 slot 內容        |
| renders as button element | 渲染為 button 元素    |
| defaults to type="button" | 預設 type 為 "button" |
| accepts type prop         | 接受 type prop        |

#### variants

| 測試案例                                   | 描述                        |
| ------------------------------------------ | --------------------------- |
| applies primary variant classes by default | 預設應用 primary 變體 class |
| applies secondary variant classes          | 應用 secondary 變體 class   |
| applies text variant classes               | 應用 text 變體 class        |
| applies icon variant classes               | 應用 icon 變體 class        |

#### sizes

| 測試案例                   | 描述               |
| -------------------------- | ------------------ |
| applies md size by default | 預設應用 md 尺寸   |
| applies sm size classes    | 應用 sm 尺寸 class |
| applies lg size classes    | 應用 lg 尺寸 class |

#### disabled state

| 測試案例                                           | 描述                                       |
| -------------------------------------------------- | ------------------------------------------ |
| is not disabled by default                         | 預設不禁用                                 |
| sets disabled attribute when disabled prop is true | disabled prop 為 true 時設定 disabled 屬性 |
| does not emit click when disabled                  | 禁用時不發出 click 事件                    |

#### loading state

| 測試案例                         | 描述                    |
| -------------------------------- | ----------------------- |
| is not loading by default        | 預設不載入              |
| shows spinner when loading       | 載入時顯示 spinner      |
| is disabled when loading         | 載入時禁用              |
| does not emit click when loading | 載入時不發出 click 事件 |

#### click events

| 測試案例                            | 描述                        |
| ----------------------------------- | --------------------------- |
| emits click event on click          | 點擊時發出 click 事件       |
| passes MouseEvent in click emission | click 發出時傳遞 MouseEvent |

---

### 4.2 AppInput.spec.ts (23 個測試)

測試檔案：`tests/components/ui/AppInput.spec.ts`

#### rendering

| 測試案例              | 描述             |
| --------------------- | ---------------- |
| renders input element | 渲染 input 元素  |
| defaults to text type | 預設為 text 類型 |
| accepts type prop     | 接受 type prop   |
| renders placeholder   | 渲染 placeholder |

#### label

| 測試案例                          | 描述                      |
| --------------------------------- | ------------------------- |
| does not render label by default  | 預設不渲染 label          |
| renders label when provided       | 提供時渲染 label          |
| adds required class when required | required 時加入必填 class |

#### v-model

| 測試案例                         | 描述                         |
| -------------------------------- | ---------------------------- |
| displays modelValue              | 顯示 modelValue              |
| emits update:modelValue on input | 輸入時發出 update:modelValue |
| handles number values            | 處理數字值                   |
| handles null values              | 處理 null 值                 |

#### disabled state

| 測試案例                   | 描述               |
| -------------------------- | ------------------ |
| is not disabled by default | 預設不禁用         |
| sets disabled attribute    | 設定 disabled 屬性 |

#### error state

| 測試案例                          | 描述                  |
| --------------------------------- | --------------------- |
| does not show error by default    | 預設不顯示錯誤        |
| shows error message when provided | 提供時顯示錯誤訊息    |
| applies error styles to input     | 對 input 應用錯誤樣式 |

#### prefix and suffix

| 測試案例                        | 描述           |
| ------------------------------- | -------------- |
| does not show prefix by default | 預設不顯示前綴 |
| shows prefix when provided      | 提供時顯示前綴 |
| shows suffix when provided      | 提供時顯示後綴 |
| applies padding for prefix      | 對前綴應用內距 |
| applies padding for suffix      | 對後綴應用內距 |

#### events

| 測試案例          | 描述            |
| ----------------- | --------------- |
| emits blur event  | 發出 blur 事件  |
| emits focus event | 發出 focus 事件 |

---

### 4.3 AppTag.spec.ts (15 個測試)

測試檔案：`tests/components/ui/AppTag.spec.ts`

#### custom variant

| 測試案例                               | 描述                 |
| -------------------------------------- | -------------------- |
| renders with custom label              | 渲染自訂標籤         |
| uses default colors for custom variant | 自訂變體使用預設顏色 |
| accepts custom colors                  | 接受自訂顏色         |

#### intent variant

| 測試案例                  | 描述         |
| ------------------------- | ------------ |
| renders necessity intent  | 渲染必要意圖 |
| renders efficiency intent | 渲染效率意圖 |
| renders enjoyment intent  | 渲染享受意圖 |
| renders recovery intent   | 渲染恢復意圖 |
| renders impulse intent    | 渲染衝動意圖 |
| shows intent icon         | 顯示意圖圖示 |

#### confidence variant

| 測試案例                  | 描述             |
| ------------------------- | ---------------- |
| renders high confidence   | 渲染高信心       |
| renders medium confidence | 渲染中等信心     |
| renders low confidence    | 渲染低信心       |
| shows confidence emoji    | 顯示信心表情符號 |

#### styling

| 測試案例               | 描述                    |
| ---------------------- | ----------------------- |
| has rounded-full class | 擁有 rounded-full class |
| has inline-flex class  | 擁有 inline-flex class  |

---

### 4.4 AppSpinner.spec.ts (9 個測試)

測試檔案：`tests/components/ui/AppSpinner.spec.ts`

#### rendering

| 測試案例               | 描述                    |
| ---------------------- | ----------------------- |
| renders svg element    | 渲染 svg 元素           |
| has animate-spin class | 擁有 animate-spin class |
| has viewBox attribute  | 擁有 viewBox 屬性       |

#### sizes

| 測試案例                   | 描述             |
| -------------------------- | ---------------- |
| applies md size by default | 預設應用 md 尺寸 |
| applies sm size            | 應用 sm 尺寸     |
| applies lg size            | 應用 lg 尺寸     |

#### svg content

| 測試案例                          | 描述                          |
| --------------------------------- | ----------------------------- |
| contains circle element           | 包含 circle 元素              |
| contains path element             | 包含 path 元素                |
| circle has stroke-width attribute | circle 擁有 stroke-width 屬性 |

---

### 4.5 AppPagination.spec.ts (17 個測試)

測試檔案：`tests/components/ui/AppPagination.spec.ts`

#### rendering

| 測試案例                                                | 描述                         |
| ------------------------------------------------------- | ---------------------------- |
| displays item range info                                | 顯示項目範圍資訊             |
| displays correct range for middle page                  | 中間頁顯示正確範圍           |
| displays correct range for last page with partial items | 最後一頁部分項目顯示正確範圍 |

#### navigation buttons

| 測試案例                              | 描述                       |
| ------------------------------------- | -------------------------- |
| disables prev button on first page    | 第一頁時禁用上一頁按鈕     |
| enables prev button on non-first page | 非第一頁時啟用上一頁按鈕   |
| disables next button on last page     | 最後一頁時禁用下一頁按鈕   |
| enables next button on non-last page  | 非最後一頁時啟用下一頁按鈕 |

#### page buttons

| 測試案例                             | 描述                 |
| ------------------------------------ | -------------------- |
| shows all pages for small page count | 小頁數時顯示所有頁碼 |
| shows ellipsis for large page counts | 大頁數時顯示省略號   |
| highlights current page              | 高亮當前頁           |

#### page navigation

| 測試案例                                 | 描述                                |
| ---------------------------------------- | ----------------------------------- |
| emits update:currentPage on page click   | 點擊頁碼時發出 update:currentPage   |
| emits update:currentPage on prev click   | 點擊上一頁時發出 update:currentPage |
| emits update:currentPage on next click   | 點擊下一頁時發出 update:currentPage |
| does not emit when clicking current page | 點擊當前頁時不發出事件              |

#### visible pages calculation

| 測試案例                                            | 描述                                   |
| --------------------------------------------------- | -------------------------------------- |
| shows pages 1, 2, 3, ..., 10 when on page 1         | 第 1 頁時顯示 1, 2, 3, ..., 10         |
| shows pages 1, ..., 4, 5, 6, ..., 10 when on page 5 | 第 5 頁時顯示 1, ..., 4, 5, 6, ..., 10 |
| shows pages 1, ..., 9, 10 when on page 10           | 第 10 頁時顯示 1, ..., 9, 10           |

---

### 4.6 AppModal.spec.ts (10 個測試)

測試檔案：`tests/components/ui/AppModal.spec.ts`

#### rendering

| 測試案例                       | 描述                 |
| ------------------------------ | -------------------- |
| renders slot content when open | 打開時渲染 slot 內容 |
| does not render when closed    | 關閉時不渲染         |

#### title

| 測試案例                      | 描述                    |
| ----------------------------- | ----------------------- |
| renders header when closeable | closeable 時渲染 header |
| renders title when provided   | 提供時渲染標題          |

#### size

| 測試案例            | 描述           |
| ------------------- | -------------- |
| defaults to md size | 預設為 md 尺寸 |

#### closeable

| 測試案例                                   | 描述                              |
| ------------------------------------------ | --------------------------------- |
| is closeable by default                    | 預設可關閉                        |
| hides close button when closeable is false | closeable 為 false 時隱藏關閉按鈕 |

#### footer slot

| 測試案例                          | 描述                   |
| --------------------------------- | ---------------------- |
| renders footer slot when provided | 提供時渲染 footer slot |

#### close event

| 測試案例                                    | 描述                                   |
| ------------------------------------------- | -------------------------------------- |
| emits close when close button clicked       | 點擊關閉按鈕時發出 close 事件          |
| does not emit close when closeable is false | closeable 為 false 時不發出 close 事件 |

---

### 4.7 StatsSummaryCard.spec.ts (13 個測試)

測試檔案：`tests/components/dashboard/StatsSummaryCard.spec.ts`

#### rendering

| 測試案例                          | 描述               |
| --------------------------------- | ------------------ |
| renders title                     | 渲染標題           |
| renders icon                      | 渲染圖示           |
| renders count with correct format | 以正確格式渲染筆數 |
| renders formatted amount          | 渲染格式化金額     |
| formats large amounts correctly   | 正確格式化大金額   |

#### trend display

| 測試案例                              | 描述                   |
| ------------------------------------- | ---------------------- |
| does not show trend when not provided | 未提供時不顯示趨勢     |
| shows up trend with alert color       | 顯示上升趨勢（警告色） |
| shows down trend with success color   | 顯示下降趨勢（成功色） |
| shows stable trend with gray color    | 顯示穩定趨勢（灰色）   |

#### styling

| 測試案例             | 描述                  |
| -------------------- | --------------------- |
| has card class       | 擁有 card class       |
| has card-hover class | 擁有 card-hover class |

#### edge cases

| 測試案例            | 描述       |
| ------------------- | ---------- |
| handles zero count  | 處理零筆數 |
| handles zero amount | 處理零金額 |

---

### 4.8 EmptyState.spec.ts (11 個測試)

測試檔案：`tests/components/shared/EmptyState.spec.ts`

#### rendering

| 測試案例             | 描述         |
| -------------------- | ------------ |
| renders title        | 渲染標題     |
| renders default icon | 渲染預設圖示 |
| renders custom icon  | 渲染自訂圖示 |

#### description

| 測試案例                                      | 描述               |
| --------------------------------------------- | ------------------ |
| does not render description when not provided | 未提供時不渲染描述 |
| renders description when provided             | 提供時渲染描述     |

#### action button

| 測試案例                                             | 描述                            |
| ---------------------------------------------------- | ------------------------------- |
| does not render button when actionLabel not provided | 未提供 actionLabel 時不渲染按鈕 |
| renders button when actionLabel provided             | 提供 actionLabel 時渲染按鈕     |
| emits action when button clicked                     | 點擊按鈕時發出 action 事件      |

#### slot

| 測試案例                     | 描述               |
| ---------------------------- | ------------------ |
| renders default slot content | 渲染預設 slot 內容 |

#### styling

| 測試案例             | 描述         |
| -------------------- | ------------ |
| centers content      | 內容置中     |
| has vertical padding | 擁有垂直內距 |

---

### 4.9 IntentSelector.spec.ts (12 個測試)

測試檔案：`tests/components/expense/IntentSelector.spec.ts`

#### rendering

| 測試案例                     | 描述                  |
| ---------------------------- | --------------------- |
| renders label                | 渲染標籤              |
| renders all 5 intent options | 渲染所有 5 個意圖選項 |
| renders intent icons         | 渲染意圖圖示          |
| renders intent sub-labels    | 渲染意圖副標籤        |

#### selection

| 測試案例                                | 描述                         |
| --------------------------------------- | ---------------------------- |
| emits update:modelValue on click        | 點擊時發出 update:modelValue |
| emits different intents for each button | 每個按鈕發出不同的意圖       |

#### selected state

| 測試案例                                        | 描述                     |
| ----------------------------------------------- | ------------------------ |
| shows selected state for necessity              | 顯示必要的選中狀態       |
| shows selected state for impulse                | 顯示衝動的選中狀態       |
| shows unselected state for non-selected intents | 顯示非選中意圖的未選狀態 |

#### error state

| 測試案例                              | 描述               |
| ------------------------------------- | ------------------ |
| does not show error when not provided | 未提供時不顯示錯誤 |
| shows error message when provided     | 提供時顯示錯誤訊息 |

#### button behavior

| 測試案例                       | 描述                          |
| ------------------------------ | ----------------------------- |
| all buttons have type="button" | 所有按鈕的 type 都是 "button" |

---

### 4.10 ConfidenceSelector.spec.ts (15 個測試)

測試檔案：`tests/components/expense/ConfidenceSelector.spec.ts`

#### rendering

| 測試案例                         | 描述                  |
| -------------------------------- | --------------------- |
| renders label                    | 渲染標籤              |
| renders all 3 confidence options | 渲染所有 3 個信心選項 |
| renders confidence emojis        | 渲染信心表情符號      |

#### selection

| 測試案例                                          | 描述                         |
| ------------------------------------------------- | ---------------------------- |
| emits update:modelValue on click                  | 點擊時發出 update:modelValue |
| emits different confidence levels for each button | 每個按鈕發出不同的信心程度   |

#### toggle behavior

| 測試案例                                         | 描述                    |
| ------------------------------------------------ | ----------------------- |
| emits null when clicking already selected option | 點擊已選選項時發出 null |
| emits new value when clicking different option   | 點擊不同選項時發出新值  |

#### selected state

| 測試案例                                        | 描述                   |
| ----------------------------------------------- | ---------------------- |
| shows selected state for high confidence        | 顯示高信心的選中狀態   |
| shows selected state for medium confidence      | 顯示中等信心的選中狀態 |
| shows selected state for low confidence         | 顯示低信心的選中狀態   |
| shows unselected state for non-selected options | 顯示非選選項的未選狀態 |
| shows unselected state when nothing selected    | 沒有選擇時顯示未選狀態 |

#### button behavior

| 測試案例                       | 描述                          |
| ------------------------------ | ----------------------------- |
| all buttons have type="button" | 所有按鈕的 type 都是 "button" |
| renders 3 buttons              | 渲染 3 個按鈕                 |

#### styling

| 測試案例                        | 描述                        |
| ------------------------------- | --------------------------- |
| buttons have rounded-full class | 按鈕擁有 rounded-full class |

---

### 4.11 AppTextarea.spec.ts (19 個測試)

測試檔案：`tests/components/ui/AppTextarea.spec.ts`

#### rendering

| 測試案例                 | 描述               |
| ------------------------ | ------------------ |
| renders textarea element | 渲染 textarea 元素 |
| renders placeholder      | 渲染 placeholder   |
| has default rows of 3    | 預設行數為 3       |
| accepts custom rows      | 接受自訂行數       |

#### label

| 測試案例                          | 描述                      |
| --------------------------------- | ------------------------- |
| does not render label by default  | 預設不渲染 label          |
| renders label when provided       | 提供時渲染 label          |
| adds required class when required | required 時加入必填 class |

#### v-model

| 測試案例                         | 描述                         |
| -------------------------------- | ---------------------------- |
| displays modelValue              | 顯示 modelValue              |
| emits update:modelValue on input | 輸入時發出 update:modelValue |

#### character count

| 測試案例                             | 描述                            |
| ------------------------------------ | ------------------------------- |
| displays character count             | 顯示字元計數                    |
| uses custom maxLength                | 使用自訂最大長度                |
| sets maxlength attribute on textarea | 設定 textarea 的 maxlength 屬性 |

#### disabled state

| 測試案例                   | 描述               |
| -------------------------- | ------------------ |
| is not disabled by default | 預設不禁用         |
| sets disabled attribute    | 設定 disabled 屬性 |

#### error state

| 測試案例                          | 描述                     |
| --------------------------------- | ------------------------ |
| does not show error by default    | 預設不顯示錯誤           |
| shows error message when provided | 提供時顯示錯誤訊息       |
| applies error styles to textarea  | 對 textarea 應用錯誤樣式 |

#### events

| 測試案例          | 描述            |
| ----------------- | --------------- |
| emits blur event  | 發出 blur 事件  |
| emits focus event | 發出 focus 事件 |

---

### 4.12 AppSelect.spec.ts (16 個測試)

測試檔案：`tests/components/ui/AppSelect.spec.ts`

#### rendering

| 測試案例                                   | 描述                       |
| ------------------------------------------ | -------------------------- |
| renders placeholder when no value selected | 沒有選擇時渲染 placeholder |
| renders custom placeholder                 | 渲染自訂 placeholder       |
| renders selected option label              | 渲染選中選項的標籤         |
| renders selected option icon               | 渲染選中選項的圖示         |

#### label

| 測試案例                          | 描述                      |
| --------------------------------- | ------------------------- |
| does not render label by default  | 預設不渲染 label          |
| renders label when provided       | 提供時渲染 label          |
| adds required class when required | required 時加入必填 class |

#### error state

| 測試案例                          | 描述               |
| --------------------------------- | ------------------ |
| does not show error by default    | 預設不顯示錯誤     |
| shows error message when provided | 提供時顯示錯誤訊息 |
| applies error styles to button    | 對按鈕應用錯誤樣式 |

#### options rendering

| 測試案例              | 描述         |
| --------------------- | ------------ |
| renders all options   | 渲染所有選項 |
| renders option labels | 渲染選項標籤 |
| renders option icons  | 渲染選項圖示 |

#### selection

| 測試案例                        | 描述             |
| ------------------------------- | ---------------- |
| finds selected option correctly | 正確找到選中選項 |
| handles null value              | 處理 null 值     |

#### options without icons

| 測試案例                                | 描述                   |
| --------------------------------------- | ---------------------- |
| renders options without icons correctly | 正確渲染沒有圖示的選項 |

---

### 4.13 AppConfirmDialog.spec.ts (18 個測試)

測試檔案：`tests/components/ui/AppConfirmDialog.spec.ts`

#### rendering

| 測試案例                    | 描述         |
| --------------------------- | ------------ |
| renders title               | 渲染標題     |
| renders message             | 渲染訊息     |
| does not render when closed | 關閉時不渲染 |

#### button text

| 測試案例                  | 描述             |
| ------------------------- | ---------------- |
| uses default confirm text | 使用預設確認文字 |
| uses default cancel text  | 使用預設取消文字 |
| uses custom confirm text  | 使用自訂確認文字 |
| uses custom cancel text   | 使用自訂取消文字 |

#### variants

| 測試案例                                 | 描述                 |
| ---------------------------------------- | -------------------- |
| applies danger variant styles by default | 預設應用危險變體樣式 |
| applies warning variant styles           | 應用警告變體樣式     |
| applies info variant styles              | 應用資訊變體樣式     |

#### events

| 測試案例                                  | 描述                       |
| ----------------------------------------- | -------------------------- |
| emits confirm when confirm button clicked | 點擊確認按鈕時發出 confirm |
| emits cancel when cancel button clicked   | 點擊取消按鈕時發出 cancel  |

#### loading state

| 測試案例                                     | 描述                         |
| -------------------------------------------- | ---------------------------- |
| disables buttons when loading                | 載入時禁用按鈕               |
| shows spinner in confirm button when loading | 載入時在確認按鈕顯示 spinner |
| does not show spinner when not loading       | 非載入時不顯示 spinner       |
| applies opacity class when loading           | 載入時應用透明度 class       |

#### button types

| 測試案例                       | 描述                          |
| ------------------------------ | ----------------------------- |
| all buttons have type="button" | 所有按鈕的 type 都是 "button" |
| renders two buttons            | 渲染兩個按鈕                  |

---

### 4.14 AppToast.spec.ts (16 個測試)

測試檔案：`tests/components/ui/AppToast.spec.ts`

#### rendering

| 測試案例                                  | 描述                   |
| ----------------------------------------- | ---------------------- |
| renders when show is true                 | show 為 true 時渲染    |
| does not render when show is false        | show 為 false 時不渲染 |
| renders title                             | 渲染標題               |
| renders message when provided             | 提供時渲染訊息         |
| does not render message when not provided | 未提供時不渲染訊息     |

#### toast types

| 測試案例                                    | 描述                         |
| ------------------------------------------- | ---------------------------- |
| applies success styles for success type     | 成功類型應用成功樣式         |
| applies warning styles for warning type     | 警告類型應用警告樣式         |
| applies error styles for error type         | 錯誤類型應用錯誤樣式         |
| applies info styles for info type (default) | 資訊類型（預設）應用資訊樣式 |

#### close button

| 測試案例                                             | 描述                                |
| ---------------------------------------------------- | ----------------------------------- |
| renders close button by default                      | 預設渲染關閉按鈕                    |
| does not render close button when closeable is false | closeable 為 false 時不渲染關閉按鈕 |
| emits close when close button clicked                | 點擊關閉按鈕時發出 close            |

#### auto-dismiss

| 測試案例                                 | 描述                       |
| ---------------------------------------- | -------------------------- |
| emits close after duration               | 持續時間後發出 close       |
| uses default duration of 5000ms          | 使用預設的 5000ms 持續時間 |
| does not auto-dismiss when duration is 0 | duration 為 0 時不自動關閉 |

#### button types

| 測試案例                       | 描述                        |
| ------------------------------ | --------------------------- |
| close button has type="button" | 關閉按鈕的 type 是 "button" |

---

### 4.15 ExpenseRecordRow.spec.ts (18 個測試)

測試檔案：`tests/components/expense/ExpenseRecordRow.spec.ts`

#### rendering

| 測試案例                        | 描述             |
| ------------------------------- | ---------------- |
| renders category icon           | 渲染類別圖示     |
| renders category label          | 渲染類別標籤     |
| renders formatted amount        | 渲染格式化金額   |
| renders formatted date          | 渲染格式化日期   |
| renders note when present       | 有備註時渲染備註 |
| does not render note when empty | 空備註時不渲染   |

#### intent display

| 測試案例                                    | 描述                     |
| ------------------------------------------- | ------------------------ |
| renders intent tag when decision exists     | 有決策時渲染意圖標籤     |
| does not render intent tag when no decision | 沒有決策時不渲染意圖標籤 |

#### confidence display

| 測試案例                              | 描述                     |
| ------------------------------------- | ------------------------ |
| renders confidence emoji when present | 有信心程度時渲染表情符號 |
| does not render confidence when null  | 信心程度為 null 時不渲染 |

#### recurring expense indicator

| 測試案例                                            | 描述                       |
| --------------------------------------------------- | -------------------------- |
| shows recurring tag when from recurring expense     | 來自固定支出時顯示固定標籤 |
| does not show recurring tag when not from recurring | 非固定支出時不顯示固定標籤 |

#### action buttons

| 測試案例              | 描述         |
| --------------------- | ------------ |
| renders edit button   | 渲染編輯按鈕 |
| renders delete button | 渲染刪除按鈕 |

#### events

| 測試案例                                      | 描述                           |
| --------------------------------------------- | ------------------------------ |
| emits edit event when edit button clicked     | 點擊編輯按鈕時發出 edit 事件   |
| emits delete event when delete button clicked | 點擊刪除按鈕時發出 delete 事件 |

#### different categories

| 測試案例                             | 描述             |
| ------------------------------------ | ---------------- |
| renders transport category correctly | 正確渲染交通類別 |
| renders living category correctly    | 正確渲染生活類別 |

---

### 4.16 OverviewCard.spec.ts (15 個測試)

測試檔案：`tests/components/review/OverviewCard.spec.ts`

#### total amount display

| 測試案例                                   | 描述                   |
| ------------------------------------------ | ---------------------- |
| renders total amount formatted as currency | 渲染格式化貨幣的總金額 |
| renders total count                        | 渲染總筆數             |
| renders total consumption label            | 渲染總消費標籤         |

#### impulse ratio display

| 測試案例                                 | 描述                       |
| ---------------------------------------- | -------------------------- |
| renders impulse ratio as percentage      | 渲染百分比的衝動比率       |
| applies success color when ratio <= 20%  | 比率 <= 20% 時應用成功色   |
| shows positive message when ratio <= 20% | 比率 <= 20% 時顯示正面訊息 |
| applies alert color when ratio > 20%     | 比率 > 20% 時應用警告色    |
| shows warning message when ratio > 20%   | 比率 > 20% 時顯示警告訊息  |
| renders impulse ratio label              | 渲染衝動消費佔比標籤       |

#### impulse trend display

| 測試案例                                | 描述                     |
| --------------------------------------- | ------------------------ |
| shows dash when no trend data           | 沒有趨勢資料時顯示破折號 |
| renders trend label                     | 渲染趨勢標籤             |
| renders up trend with alert color       | 上升趨勢使用警告色       |
| renders down trend with success color   | 下降趨勢使用成功色       |
| renders stable trend with neutral color | 穩定趨勢使用中性色       |

#### layout

| 測試案例                    | 描述                 |
| --------------------------- | -------------------- |
| renders three cards in grid | 在網格中渲染三張卡片 |

---

### 4.17 HeroSection.spec.ts (13 個測試)

測試檔案：`tests/components/dashboard/HeroSection.spec.ts`

#### rendering

| 測試案例                   | 描述             |
| -------------------------- | ---------------- |
| renders main heading       | 渲染主標題       |
| renders description text   | 渲染描述文字     |
| renders add expense button | 渲染新增消費按鈕 |

#### stats display

| 測試案例                                   | 描述                   |
| ------------------------------------------ | ---------------------- |
| renders total amount formatted as currency | 渲染格式化貨幣的總金額 |
| renders total count                        | 渲染總筆數             |
| renders monthly label                      | 渲染月份標籤           |
| renders impulse ratio as percentage        | 渲染百分比的衝動比率   |
| renders impulse ratio label                | 渲染衝動消費佔比標籤   |

#### impulse ratio styling

| 測試案例                                   | 描述                       |
| ------------------------------------------ | -------------------------- |
| applies success color when ratio <= 20%    | 比率 <= 20% 時應用成功色   |
| shows positive message when ratio <= 20%   | 比率 <= 20% 時顯示正面訊息 |
| applies alert color when ratio > 20%       | 比率 > 20% 時應用警告色    |
| shows improvement message when ratio > 20% | 比率 > 20% 時顯示改善訊息  |

#### events

| 測試案例                             | 描述                      |
| ------------------------------------ | ------------------------- |
| emits addExpense when button clicked | 點擊按鈕時發出 addExpense |

---

### 4.18 DateRangeSelector.spec.ts (11 個測試)

測試檔案：`tests/components/review/DateRangeSelector.spec.ts`

#### preset buttons

| 測試案例                                         | 描述                         |
| ------------------------------------------------ | ---------------------------- |
| renders all preset options                       | 渲染所有預設選項             |
| highlights selected preset                       | 高亮選中的預設               |
| emits update:preset when button clicked          | 點擊按鈕時發出 update:preset |
| emits change when non-custom preset selected     | 選擇非自訂預設時發出 change  |
| does not emit change when custom preset selected | 選擇自訂預設時不發出 change  |

#### custom date range

| 測試案例                                        | 描述                                |
| ----------------------------------------------- | ----------------------------------- |
| does not show custom range inputs by default    | 預設不顯示自訂範圍輸入              |
| shows custom range inputs when preset is custom | 預設為自訂時顯示自訂範圍輸入        |
| renders start and end date labels               | 渲染開始和結束日期標籤              |
| emits update:startDate when start date changes  | 開始日期變更時發出 update:startDate |
| emits update:endDate when end date changes      | 結束日期變更時發出 update:endDate   |

#### button types

| 測試案例                       | 描述                          |
| ------------------------------ | ----------------------------- |
| all buttons have type="button" | 所有按鈕的 type 都是 "button" |

---

### 4.19 RecurringExpenseRow.spec.ts (20 個測試)

測試檔案：`tests/components/recurring/RecurringExpenseRow.spec.ts`

#### rendering

| 測試案例                  | 描述         |
| ------------------------- | ------------ |
| renders expense name      | 渲染支出名稱 |
| renders category icon     | 渲染類別圖示 |
| renders amount display    | 渲染金額顯示 |
| renders currency          | 渲染貨幣     |
| renders frequency display | 渲染頻率顯示 |
| renders expenses count    | 渲染消費筆數 |

#### intent tag

| 測試案例                                          | 描述                         |
| ------------------------------------------------- | ---------------------------- |
| renders intent tag when default intent set        | 設定預設意圖時渲染意圖標籤   |
| does not render intent tag when no default intent | 沒有預設意圖時不渲染意圖標籤 |

#### active status

| 測試案例                               | 描述                   |
| -------------------------------------- | ---------------------- |
| does not show inactive tag when active | 啟用時不顯示停用標籤   |
| shows inactive tag when not active     | 停用時顯示停用標籤     |
| applies opacity class when inactive    | 停用時應用透明度 class |

#### next occurrence

| 測試案例                                 | 描述                     |
| ---------------------------------------- | ------------------------ |
| renders next occurrence date when active | 啟用時渲染下次發生日期   |
| shows ended text when no next occurrence | 沒有下次發生時顯示已結束 |
| applies alert color when expiring soon   | 即將到期時應用警告色     |

#### events

| 測試案例                                      | 描述                            |
| --------------------------------------------- | ------------------------------- |
| emits edit when edit button clicked           | 點擊編輯按鈕時發出 edit         |
| emits delete when delete button clicked       | 點擊刪除按鈕時發出 delete       |
| emits toggleActive when toggle button clicked | 點擊切換按鈕時發出 toggleActive |
| emits generate when generate button clicked   | 點擊生成按鈕時發出 generate     |

#### inactive state actions

| 測試案例                                       | 描述                       |
| ---------------------------------------------- | -------------------------- |
| shows play icon instead of pause when inactive | 停用時顯示播放圖示而非暫停 |
| does not show generate button when inactive    | 停用時不顯示生成按鈕       |

---

## 執行測試指令

```bash
# 執行所有測試
npm run test

# 監聽模式執行測試
npm run test:watch

# 執行測試並生成覆蓋率報告
npm run test:coverage

# 使用 UI 介面執行測試
npm run test:ui
```

---

## 測試覆蓋率報告

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|
All files          |   93.62 |    87.50 |   94.67 |   94.34 |
 components        |   97-100|    77-100|   83-100|   90-100|
 composables       |   83.76 |    74.19 |   86.30 |   85.91 |
 stores            |   94.73 |    66.66 |     100 |   94.53 |
 utils             |     100 |    98.14 |     100 |     100 |
-------------------|---------|----------|---------|---------|
```

**目標覆蓋率**: 80%+
**實際覆蓋率**: 93.62% (超標)
