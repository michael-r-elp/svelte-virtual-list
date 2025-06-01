import { expect, test } from '@playwright/test'

test.describe('bottomToTop scroll-to', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tests/scroll-to/bottomToTop', { waitUntil: 'networkidle' })
    })

    test('should scroll to the correct item', async ({ page }) => {
        await page.locator('input[type=range]').fill('1234')
        await page.locator('button').click()
        await page.waitForTimeout(200)
        const item = page.locator('[data-testid="list-item-1234"]')
        await expect(item).toBeVisible()
        await expect(item).toHaveText('Item 1234')
    })

    test('should scroll to the last item', async ({ page }) => {
        await page.locator('input[type=range]').fill('9999')
        await page.locator('button').click()
        await page.waitForTimeout(200)
        const item = page.locator('[data-testid="list-item-9999"]')
        await expect(item).toBeVisible()
        await expect(item).toHaveText('Item 9999')
    })

    test('should scroll to the first item', async ({ page }) => {
        await page.locator('input[type=range]').fill('0')
        await page.locator('button').click()
        await page.waitForTimeout(200)
        const item = page.locator('[data-testid="list-item-0"]')
        await expect(item).toBeVisible()
        await expect(item).toHaveText('Item 0')
    })
})
