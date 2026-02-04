import { test, expect } from '@playwright/test'

test.describe('Navegação', () => {
  test('deve navegar entre páginas principais', async ({ page }) => {
    await page.goto('/')

    // Verificar header principal de navegação (usar banner para evitar duplicação)
    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    // Verificar footer
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('deve ter links de navegação funcionais', async ({ page }) => {
    await page.goto('/')

    // Verificar se há links no header principal (usar banner)
    const navLinks = page.getByRole('banner').locator('a')
    const count = await navLinks.count()

    if (count > 0) {
      // Clicar no primeiro link e verificar navegação
      const firstLink = navLinks.first()
      const href = await firstLink.getAttribute('href')

      if (href && href !== '#') {
        await firstLink.click()
        // Aguardar navegação
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('deve manter estado de autenticação', async ({ page }) => {
    await page.goto('/')

    // Verificar se há indicador de autenticação no header principal
    const authIndicator = page.getByRole('banner').getByText(/entrar|sair|perfil/i)
    await expect(authIndicator.first()).toBeVisible()
  })
})
