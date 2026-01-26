'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems = [
    { label: 'Início', href: '/' },
    ...items,
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://historicoacademico.vercel.app${item.href}` : undefined,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={cn('flex items-center space-x-2 text-sm text-slate-400', className)}
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          return (
            <Fragment key={index}>
              {index === 0 ? (
                <Link
                  href={item.href || '#'}
                  className="hover:text-slate-200 transition-colors"
                  aria-label="Página inicial"
                >
                  <Home className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                  {isLast ? (
                    <span className="text-slate-200 font-medium" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className="hover:text-slate-200 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </Fragment>
          )
        })}
      </nav>
    </>
  )
}
