import { expect, test } from '@playwright/test'

test.describe('Basic Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tests/basic', { waitUntil: 'networkidle' })
    })

    test('should render initial viewport items', async ({ page }) => {
        const itemCount = await page.locator('.test-item').count()
        expect(itemCount).toBeGreaterThan(0)

        // Check if items are actually visible
        const firstItem = await page.locator('[data-testid="list-item-0"]')
        await expect(firstItem).toBeVisible()
    })

    test('should render correct item content', async ({ page }) => {
        await expect(page.locator('[data-testid="list-item-0"]')).toHaveText('Item 0')
        await expect(page.locator('[data-testid="list-item-1"]')).toHaveText('Item 1')
    })

    test('should only render items in viewport plus reasonable buffer', async ({ page }) => {
        const renderedItems = await page.evaluate(() => {
            return document.querySelectorAll('.test-item').length
        })

        // With 500px height and ~30px items, expect between 15-45 items
        // (viewport items + reasonable buffer on each end)
        expect(renderedItems).toBeGreaterThan(15) // Minimum viewport items
        expect(renderedItems).toBeLessThan(50) // Maximum with buffers

        // Verify we're actually virtualizing
        expect(renderedItems).toBeLessThan(100) // Much less than total items
    })
})
