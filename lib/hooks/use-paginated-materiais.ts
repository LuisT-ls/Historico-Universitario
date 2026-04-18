'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { getMateriais, PAGE_SIZE, type MaterialFilters, type MateriaisPage } from '@/services/materials.service'
import type { Material } from '@/types'

interface UsePaginatedMateriaisResult {
  items: Material[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  error: string | null
  loadMore: () => void
  reload: () => void
}

export function usePaginatedMateriais(
  filters: MaterialFilters,
  pageSize = PAGE_SIZE,
): UsePaginatedMateriaisResult {
  const [items, setItems] = useState<Material[]>([])
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable ref so loadMore closure doesn't need cursor in deps
  const cursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null)
  cursorRef.current = cursor

  // When text filters are active Firestore cannot limit correctly, so we
  // disable pagination and fetch all matching server-side docs at once.
  const hasTextFilter = !!(filters.search || filters.disciplina)
  const effectivePageSize = hasTextFilter ? null : pageSize

  const filtersKey = JSON.stringify(filters)

  const fetchFirst = useCallback(async () => {
    setLoading(true)
    setError(null)
    setItems([])
    setCursor(null)
    setHasMore(false)
    try {
      const page: MateriaisPage = await getMateriais(filters, effectivePageSize, null)
      setItems(page.items)
      setCursor(page.nextCursor)
      setHasMore(page.nextCursor !== null)
    } catch {
      setError('Erro ao carregar materiais.')
    } finally {
      setLoading(false)
    }
    // filtersKey covers all filter deps; effectivePageSize derives from filters too
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, effectivePageSize])

  useEffect(() => {
    fetchFirst()
  }, [fetchFirst])

  const loadMore = useCallback(async () => {
    if (!cursorRef.current || loadingMore) return
    setLoadingMore(true)
    try {
      const page: MateriaisPage = await getMateriais(filters, pageSize, cursorRef.current)
      setItems(prev => [...prev, ...page.items])
      setCursor(page.nextCursor)
      setHasMore(page.nextCursor !== null)
    } catch {
      setError('Erro ao carregar mais materiais.')
    } finally {
      setLoadingMore(false)
    }
    // filtersKey + pageSize are stable across calls; cursorRef is a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, pageSize, loadingMore])

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
    reload: fetchFirst,
  }
}
