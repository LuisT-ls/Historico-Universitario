import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Histórico Universitário Online Gratuito - Gerencie seu Histórico Acadêmico',
    template: '%s | Histórico Universitário',
  },
  description:
    '🎓 Sistema GRATUITO para gerenciar histórico universitário! Calcule CR automaticamente, controle disciplinas, requisitos de formatura. BICTI e Engenharias. ✅ Acesse já!',
  keywords: [
    'histórico universitário online gratuito',
    'sistema acadêmico brasileiro',
    'calcular CR coeficiente rendimento',
    'gerenciar disciplinas universitárias',
    'controle notas acadêmicas',
    'requisitos formatura universidade',
    'BICTI engenharia produção elétrica',
    'grade curricular online',
    'acompanhar progresso estudantil',
  ],
  authors: [{ name: 'Luís Antonio Souza Teixeira' }],
  creator: 'Luís Antonio Souza Teixeira',
  publisher: 'Luís Antonio Souza Teixeira',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://historicoacademico.vercel.app',
    siteName: 'Histórico Universitário - Sistema Acadêmico Gratuito',
    title: 'Histórico Universitário Online Gratuito - Gerencie seu Histórico Acadêmico',
    description:
      '🎓 Sistema GRATUITO para gerenciar histórico universitário! Calcule CR automaticamente, controle disciplinas, requisitos de formatura. BICTI e Engenharias.',
    images: [
      {
        url: 'https://historicoacademico.vercel.app/assets/img/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Histórico Universitário Online - Sistema gratuito para gerenciar histórico acadêmico',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Histórico Universitário Online Gratuito - Sistema Acadêmico',
    description:
      '🎓 Sistema gratuito para gerenciar histórico universitário, calcular CR e acompanhar disciplinas. Para todos os cursos!',
    images: ['https://historicoacademico.vercel.app/assets/img/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://historicoacademico.vercel.app',
    languages: {
      'pt-BR': 'https://historicoacademico.vercel.app',
      pt: 'https://historicoacademico.vercel.app',
    },
  },
  verification: {
    google: 'verify_google',
    other: {
      'msvalidate.01': '5A55B423705267CEA3E9275C4039EBBA',
    },
  },
  metadataBase: new URL('https://historicoacademico.vercel.app'),
  icons: {
    icon: [
      { url: '/assets/img/favicon/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/assets/img/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/img/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/img/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/assets/img/favicon/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/assets/img/favicon/android-chrome-512x512.png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Histórico Universitário',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/assets/img/favicon/android-chrome-192x192.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="scroll-smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const darkModeEnabled = localStorage.getItem('historico-ufba-dark-mode') === 'true';
                  if (darkModeEnabled) {
                    document.documentElement.classList.add('dark-mode');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark-mode');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  // Fallback se localStorage não estiver disponível
                  document.documentElement.classList.remove('dark-mode');
                }
              })();
            `,
          }}
        />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

