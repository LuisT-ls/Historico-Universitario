import { test, expect } from '@playwright/test'

test.describe('Página Inicial', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se o título está presente
    await expect(page.getByRole('heading', { name: /Histórico Universitário/i })).toBeVisible()
  })

  test('deve exibir seleção de curso', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se os cursos estão presentes
    await expect(page.getByText(/BICTI|Engenharia/i)).toBeVisible()
  })

  test('deve navegar para página de login quando não autenticado', async ({ page }) => {
    await page.goto('/')
    
    // Verificar se há link/botão de login
    const loginButton = page.getByRole('link', { name: /entrar|login/i })
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await expect(page).toHaveURL(/.*login.*/)
    }
  })

  test('deve ser responsiva em mobile', async ({ page }) => {
    // Simular dispositivo móvel
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Verificar se o conteúdo está visível
    await expect(page.getByRole('heading', { name: /Histórico Universitário/i })).toBeVisible()
  })
})
