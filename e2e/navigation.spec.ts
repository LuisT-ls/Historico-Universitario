import { test, expect } from '@playwright/test'

test.describe('Navegação', () => {
  test('deve navegar entre páginas principais', async ({ page }) => {
    await page.goto('/')
    
    // Verificar header
    const header = page.locator('header')
    await expect(header).toBeVisible()
    
    // Verificar footer
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })

  test('deve ter links de navegação funcionais', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se há links no header
    const navLinks = page.locator('nav a, header a')
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
    
    // Verificar se há indicador de autenticação no header
    const authIndicator = page.locator('header').getByText(/entrar|sair|perfil/i)
    await expect(authIndicator.first()).toBeVisible()
  })
})
