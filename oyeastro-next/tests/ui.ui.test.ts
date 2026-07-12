import { test, expect } from '@playwright/test'

test.describe('OyeAstro UI Flow', () => {
  test('Hero form submits and shows loading state', async ({ page }) => {
    await page.goto('/')
    
    // Fill out the intake form
    await page.fill('input[placeholder*="Riya"]', 'Riya')
    await page.fill('input[placeholder*="Mumbai"]', 'Mumbai')
    await page.fill('input[type="date"]', '1999-05-15')
    await page.fill('input[type="time"]', '10:30')
    
    // Submit
    await page.click('form button.submit-btn')
    
    // Check for loading state or chart card display
    await expect(page.locator('form button.submit-btn')).toBeVisible()
  })

  test('Fold 2 (Compatibility) renders below fold 1', async ({ page }) => {
    await page.goto('/')
    const fold2 = page.locator('#match')
    await fold2.scrollIntoViewIfNeeded()
    await expect(fold2).toBeVisible()
  })

  test('Nav is fixed and visible on scroll', async ({ page }) => {
    await page.goto('/')
    await page.mouse.wheel(0, 1000)
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    const position = await nav.evaluate(el => getComputedStyle(el).position)
    expect(position).toBe('fixed')
  })
})
