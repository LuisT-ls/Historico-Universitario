import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  /* Executar testes em paralelo */
  fullyParallel: true,

  /* Falhar o build no CI se você deixar test.only acidentalmente */
  forbidOnly: !!process.env.CI,

  /* Retry no CI apenas */
  retries: process.env.CI ? 2 : 0,

  /* Workers no CI, 1 localmente */
  workers: process.env.CI ? 1 : undefined,

  /* Configuração de reporter */
  reporter: [
    ['html'],
    ['list'],
    process.env.CI ? ['github'] : ['list'],
  ],

  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegação */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    /* Coletar trace quando retentar o teste falhado */
    trace: 'on-first-retry',

    /* Screenshot apenas quando falhar */
    screenshot: 'only-on-failure',

    /* Video apenas quando falhar */
    video: 'retain-on-failure',

    /* Aumentar timeout para CI */
    actionTimeout: process.env.CI ? 15000 : 10000,
    navigationTimeout: process.env.CI ? 30000 : 20000,
  },

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testar em dispositivos móveis */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Executar servidor de desenvolvimento antes de iniciar os testes */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000, // 3 minutos para CI
  },
})
