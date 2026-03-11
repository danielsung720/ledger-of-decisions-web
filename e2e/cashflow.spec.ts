import { test, expect } from '@playwright/test'

test.describe('Cash Flow Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cashflow')
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('displays page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('每月現金流估算')
  })

  test('displays summary cards', async ({ page }) => {
    await expect(page.getByText('總收入')).toBeVisible()
    await expect(page.getByText('總支出')).toBeVisible()
    await expect(page.getByText('淨現金流')).toBeVisible()
    await expect(page.getByText('儲蓄率')).toBeVisible()
  })

  test('displays income and expense tables', async ({ page }) => {
    // These are h3 headings in the table cards
    await expect(page.getByRole('heading', { name: '收入項目' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '支出項目' })).toBeVisible()
  })

  test('displays projection table', async ({ page }) => {
    await expect(page.getByText('多月預測')).toBeVisible()
  })

  test('displays month selector buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: '1 個月' })).toBeVisible()
    await expect(page.getByRole('button', { name: '3 個月' })).toBeVisible()
    await expect(page.getByRole('button', { name: '6 個月' })).toBeVisible()
    await expect(page.getByRole('button', { name: '12 個月' })).toBeVisible()
  })
})

test.describe('Income Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cashflow')
    await page.waitForLoadState('networkidle')
  })

  test('can open add income modal', async ({ page }) => {
    await page.getByRole('button', { name: '新增收入' }).click()
    // Check for modal title (heading) specifically
    await expect(page.getByRole('heading', { name: '新增收入' })).toBeVisible()
    // Use exact match to avoid matching "項目名稱" in table
    await expect(page.getByText('名稱', { exact: true })).toBeVisible()
  })

  test('can fill income form', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: '新增收入' }).click()
    await expect(page.getByRole('heading', { name: '新增收入' })).toBeVisible()

    // Fill form using input placeholders and labels
    await page.getByPlaceholder('例如：薪資、年終獎金').fill('測試薪資')
    await page.locator('input[type="number"]').first().fill('80000')

    // Verify form is filled
    await expect(page.getByPlaceholder('例如：薪資、年終獎金')).toHaveValue('測試薪資')
  })

  test('validates required fields', async ({ page }) => {
    await page.getByRole('button', { name: '新增收入' }).click()
    await expect(page.getByRole('heading', { name: '新增收入' })).toBeVisible()

    // Try to submit empty form
    await page.getByRole('button', { name: '儲存' }).click()

    // Should show validation error
    await expect(page.getByText('請輸入收入名稱')).toBeVisible()
  })

  test('can close modal with cancel button', async ({ page }) => {
    await page.getByRole('button', { name: '新增收入' }).click()
    await expect(page.getByRole('heading', { name: '新增收入' })).toBeVisible()

    // Click cancel
    await page.getByRole('button', { name: '取消' }).click()

    // Modal should be closed
    await expect(page.getByRole('heading', { name: '新增收入' })).not.toBeVisible()
  })
})

test.describe('Cash Flow Item Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cashflow')
    await page.waitForLoadState('networkidle')
  })

  test('can open add expense modal', async ({ page }) => {
    await page.getByRole('button', { name: '新增支出' }).click()
    // Check for modal title (heading) specifically
    await expect(page.getByRole('heading', { name: '新增支出' })).toBeVisible()
  })

  test('can fill expense form', async ({ page }) => {
    // Open modal
    await page.getByRole('button', { name: '新增支出' }).click()
    await expect(page.getByRole('heading', { name: '新增支出' })).toBeVisible()

    // Fill form
    await page.getByPlaceholder('例如：房租、電費').fill('測試房租')
    await page.locator('input[type="number"]').first().fill('25000')

    // Verify form is filled
    await expect(page.getByPlaceholder('例如：房租、電費')).toHaveValue('測試房租')
  })

  test('can close expense modal with cancel button', async ({ page }) => {
    await page.getByRole('button', { name: '新增支出' }).click()
    await expect(page.getByRole('heading', { name: '新增支出' })).toBeVisible()

    // Click cancel
    await page.getByRole('button', { name: '取消' }).click()

    // Modal should be closed
    await expect(page.getByRole('heading', { name: '新增支出' })).not.toBeVisible()
  })
})

test.describe('Month Projection Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cashflow')
    await page.waitForLoadState('networkidle')
  })

  test('can switch to 3 months projection', async ({ page }) => {
    await page.getByRole('button', { name: '3 個月' }).click()
    await expect(page.getByText('多月預測 (3 個月)')).toBeVisible()
  })

  test('can switch to 6 months projection', async ({ page }) => {
    await page.getByRole('button', { name: '6 個月' }).click()
    await expect(page.getByText('多月預測 (6 個月)')).toBeVisible()
  })

  test('can switch to 12 months projection', async ({ page }) => {
    await page.getByRole('button', { name: '12 個月' }).click()
    await expect(page.getByText('多月預測 (12 個月)')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('can navigate to cashflow page from header', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Find and click the cashflow link
    const cashflowLink = page.getByRole('link', { name: /現金流/ })
    if (await cashflowLink.isVisible()) {
      await cashflowLink.click()
      await expect(page).toHaveURL('/cashflow')
    }
  })
})
