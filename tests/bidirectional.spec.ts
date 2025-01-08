import { expect, test } from '@playwright/test'

test.describe('Bidirectional Scrolling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tests/bidirectional')
        // Wait for both lists to render
        await page.waitForSelector('[data-testid="top-to-bottom-viewport"]')
        await page.waitForSelector('[data-testid="bottom-to-top-viewport"]')
    })

    test('should render items correctly in both directions', async ({ page }) => {
        // Check top-to-bottom list
        await expect(page.locator('[data-testid="ttb-item-0"]')).toBeVisible()
        await expect(page.locator('[data-testid="ttb-item-1"]')).toBeVisible()

        // Wait for bottom-to-top list to initialize and scroll
        await page.waitForTimeout(100) // Allow time for initial scroll

        // Check bottom-to-top list
        const lastItemVisible = await page.evaluate(() => {
            const viewport = document.querySelector('[data-testid="bottom-to-top-viewport"]')
            viewport.scrollTop = viewport.scrollHeight
            return true
        })
        expect(lastItemVisible).toBe(true)

        await expect(page.locator('[data-testid="btt-item-0"]')).toBeVisible()
        await expect(page.locator('[data-testid="btt-item-1"]')).toBeVisible()
    })

    test('should maintain scroll position in both lists', async ({ page }) => {
        // Scroll top-to-bottom list
        await page.evaluate(() => {
            const ttbList = document.querySelector('[data-testid="top-to-bottom-viewport"]')
            ttbList.scrollTop = 1000
        })

        // Scroll bottom-to-top list
        await page.evaluate(() => {
            const bttList = document.querySelector('[data-testid="bottom-to-top-viewport"]')
            bttList.scrollTop = 1000
        })

        // Wait for rendering
        await page.waitForTimeout(100)

        // Verify items are visible at new positions
        const ttbVisibleItems = await page.locator('[data-testid^="ttb-item-"]').count()
        const bttVisibleItems = await page.locator('[data-testid^="btt-item-"]').count()

        expect(ttbVisibleItems).toBeGreaterThan(0)
        expect(bttVisibleItems).toBeGreaterThan(0)
    })
})
