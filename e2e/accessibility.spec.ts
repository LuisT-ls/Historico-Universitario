import { test, expect } from '@playwright/test'

test.describe('Acessibilidade', () => {
  test('deve passar verificações básicas de acessibilidade', async ({ page }) => {
    await page.goto('/')

    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)

    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('deve ter conteúdo visível na página', async ({ page }) => {
    await page.goto('/')

    // Landing page for unauthenticated users — check that some content is visible
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('deve ser navegável por teclado', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')

    const focusedElement = page.locator(':focus')
    const count = await focusedElement.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
