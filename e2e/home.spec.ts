import { test, expect } from '@playwright/test'

test.describe('Página Inicial', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')

    // Unauthenticated users see the landing page
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('deve exibir conteúdo da landing page para usuários não autenticados', async ({ page }) => {
    await page.goto('/')

    // Landing page shows CTA links to register/login
    const ctaLink = page.getByRole('link', { name: /começar|entrar|login|cadastro/i }).first()
    await expect(ctaLink).toBeVisible()
  })

  test('deve navegar para página de login quando não autenticado', async ({ page }) => {
    await page.goto('/')

    const loginLink = page.getByRole('link', { name: /entrar|login/i }).first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/.*login.*/)
    }
  })

  test('deve ser responsiva em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.locator('h1').first()).toBeVisible()
  })
})
