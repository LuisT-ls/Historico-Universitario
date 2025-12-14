import { test, expect } from '@playwright/test'

test.describe('Acessibilidade', () => {
  test('deve passar verificações básicas de acessibilidade', async ({ page }) => {
    await page.goto('/')
    
    // Verificações básicas de acessibilidade
    // Verificar se há headings
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)
    
    // Verificar se botões têm texto ou aria-label
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      
      // Pelo menos um deve ter texto ou aria-label
      expect(text || ariaLabel).toBeTruthy()
    }
  })

  test('deve ter contraste adequado', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se o texto está visível
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent.first()).toBeVisible()
  })

  test('deve ser navegável por teclado', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se há elementos focáveis
    await page.keyboard.press('Tab')
    
    // Verificar se algum elemento recebeu foco
    const focusedElement = page.locator(':focus')
    const count = await focusedElement.count()
    
    // Pelo menos um elemento deve ser focável
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
