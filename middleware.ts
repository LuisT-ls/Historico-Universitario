import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Gera um nonce criptograficamente seguro por requisição.
 * Usado para eliminar 'unsafe-inline' e 'unsafe-eval' da Content-Security-Policy.
 *
 * Funcionamento:
 * 1. Um nonce único (base64 de UUID v4) é gerado a cada request.
 * 2. O nonce é injetado no header 'x-nonce' da request (para o layout lê-lo).
 * 3. O CSP com 'nonce-${nonce}' é definido no header da response.
 * 4. 'strict-dynamic' permite que scripts carregados por scripts com nonce
 *    também sejam executados (necessário para o runtime do Next.js).
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const isProd = process.env.NODE_ENV === 'production'

  const cspDirectives = [
    "base-uri 'self'",
    "default-src 'self'",
    // 'nonce-...' autoriza apenas scripts com o atributo nonce correto.
    // 'strict-dynamic' permite que esses scripts carreguem outros (chunks do Next.js).
    // Sem 'unsafe-inline' e sem 'unsafe-eval'.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com`,
    // style-src mantém 'unsafe-inline' pois Next.js/Tailwind injetam estilos inline
    // e não há vetor XSS via CSS neste contexto.
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://*.googleusercontent.com https://*.firebaseusercontent.com https://www.googletagmanager.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net wss://*.firebaseio.com https://www.google-analytics.com https://*.sentry.io https://*.ingest.sentry.io",
    "frame-src 'self' https://*.firebaseapp.com https://*.google.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join('; ')

  // Passa o nonce para o Server Component via header da request
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Define o CSP na response
  response.headers.set('Content-Security-Policy', cspDirectives)

  return response
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas EXCETO:
     * - _next/static  (assets estáticos já compilados)
     * - _next/image   (otimização de imagem)
     * - favicon.ico   (ícone do site)
     * - arquivos de imagem públicos
     *
     * O filtro 'next-router-prefetch' / 'purpose: prefetch' evita que
     * o middleware rode em prefetches do Next.js Router (que não renderizam HTML).
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
