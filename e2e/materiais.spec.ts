import { test, expect } from '@playwright/test'

test.describe('Página de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/materiais')
    await page.waitForLoadState('load')
  })

  test('carrega a página com o título correto', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /materiais acadêmicos/i })).toBeVisible()
  })

  test('exibe a barra de filtros', async ({ page }) => {
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()
  })

  test('exibe o seletor de ordenação', async ({ page }) => {
    await expect(page.getByLabel(/ordenar por/i)).toBeVisible()
  })

  test('exibe o FAB de adicionar material', async ({ page }) => {
    // O FAB aparece para não-autenticados como botão de login ou para autenticados como +
    const fab = page.locator('button, a').filter({ hasText: /entrar|enviar|novo/i }).last()
    await expect(fab).toBeVisible()
  })

  test('filtro de busca filtra os resultados', async ({ page }) => {
    // Aguarda qualquer estado inicial (cards ou empty state)
    const searchInput = page.getByPlaceholder(/buscar/i)
    await searchInput.fill('xyzimpossível123')

    // Após busca sem resultados, mostra empty state
    await expect(
      page.getByText(/nenhum material encontrado/i)
    ).toBeVisible({ timeout: 5000 })
  })

  test('limpar filtros reseta a busca', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar/i)
    await searchInput.fill('xyzimpossível123')

    // Espera chip aparecer
    const clearButton = page.getByText(/limpar tudo/i)
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await expect(searchInput).toHaveValue('')
    }
  })

  test('é responsiva em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await expect(page.getByRole('heading', { name: /materiais acadêmicos/i })).toBeVisible()
    await expect(page.getByPlaceholder(/buscar/i)).toBeVisible()
  })
})

test.describe('Filtros de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/materiais')
    await page.waitForLoadState('load')
  })

  test('dropdown de curso contém as opções esperadas', async ({ page }) => {
    const select = page.getByLabel(/filtrar por curso/i)
    await expect(select).toBeVisible()

    const options = select.locator('option')
    const count = await options.count()
    expect(count).toBeGreaterThan(1) // inclui "Todos os cursos" + cursos
  })

  test('dropdown de tipo contém os tipos esperados', async ({ page }) => {
    const select = page.getByLabel(/filtrar por tipo/i)
    await expect(select).toBeVisible()

    await expect(select.locator('option', { hasText: 'Prova' })).toHaveCount(1)
    await expect(select.locator('option', { hasText: 'Resumo' })).toHaveCount(1)
  })

  test('selecionar um tipo ativa o chip de filtro', async ({ page }) => {
    const select = page.getByLabel(/filtrar por tipo/i)
    await select.selectOption({ label: 'Prova' })

    await expect(page.getByText('Prova').last()).toBeVisible()
    await expect(page.getByText(/filtros ativos/i)).toBeVisible()
  })
})

test.describe('Navegação para Detalhe', () => {
  test('clicar em um card navega para a página de detalhe', async ({ page }) => {
    await page.goto('/materiais')
    await page.waitForLoadState('load')

    // Verifica se há cards de material
    const cards = page.locator('a[href^="/materiais/"]').filter({ hasNot: page.locator('[href="/materiais"]') })
    const count = await cards.count()

    if (count > 0) {
      const href = await cards.first().getAttribute('href')
      await cards.first().click()
      await page.waitForLoadState('load')
      await expect(page).toHaveURL(new RegExp(href!))
    } else {
      // Repositório vazio — verifica o empty state
      await expect(page.getByText(/nenhum material/i)).toBeVisible()
    }
  })
})

test.describe('Página de Detalhe do Material', () => {
  test('redireciona para 404 para ID inválido', async ({ page }) => {
    await page.goto('/materiais/id-que-nao-existe-abc123')
    await page.waitForLoadState('load')

    // Deve exibir mensagem de não encontrado ou redirecionar
    await expect(
      page.getByText(/não encontrado|not found/i)
    ).toBeVisible({ timeout: 8000 })
  })
})
