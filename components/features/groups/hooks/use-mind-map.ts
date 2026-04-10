'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
    type OnConnect,
    type OnEdgesChange,
    type OnNodesChange,
    type XYPosition,
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
} from '@xyflow/react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { saveMindMap } from '@/services/group.service'
import { logger } from '@/lib/logger'
import type { MindMapEdge, MindMapNode, MindMapNodeData } from '@/types'

const SAVE_DEBOUNCE_MS = 600
const MIND_MAP_DOC = 'board'

interface UseMindMapOptions {
    groupId: string
    currentUserId: string
}

interface UseMindMapReturn {
    nodes: MindMapNode[]
    edges: MindMapEdge[]
    isLoading: boolean
    isSaving: boolean
    onNodesChange: OnNodesChange<MindMapNode>
    onEdgesChange: OnEdgesChange<MindMapEdge>
    onConnect: OnConnect
    addNode: (position: XYPosition, label?: string) => void
    deleteNode: (nodeId: string) => void
    updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void
    clearAll: () => void
}

export function useMindMap({ groupId, currentUserId }: UseMindMapOptions): UseMindMapReturn {
    const [nodes, setNodes] = useState<MindMapNode[]>([])
    const [edges, setEdges] = useState<MindMapEdge[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Refs para debounce — evita capturar closures antigas
    const nodesRef = useRef<MindMapNode[]>(nodes)
    const edgesRef = useRef<MindMapEdge[]>(edges)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isRemoteUpdateRef = useRef(false)

    nodesRef.current = nodes
    edgesRef.current = edges

    // ── Listener Firestore em tempo real ────────────────────────────────────────
    useEffect(() => {
        if (!db || !groupId) return

        const ref = doc(db, 'groups', groupId, 'mindMap', MIND_MAP_DOC)
        const unsubscribe = onSnapshot(
            ref,
            (snap) => {
                if (!snap.exists()) {
                    setNodes([])
                    setEdges([])
                    setIsLoading(false)
                    return
                }
                const data = snap.data()

                // Sinaliza que a próxima atualização de state veio do Firestore,
                // então não deve disparar um save de volta.
                isRemoteUpdateRef.current = true
                setNodes(data.nodes ?? [])
                setEdges(data.edges ?? [])
                setIsLoading(false)
            },
            (error) => {
                logger.error('Erro no listener do mapa mental:', error)
                setIsLoading(false)
            }
        )

        return () => {
            unsubscribe()
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        }
    }, [groupId])

    // ── Save com debounce ────────────────────────────────────────────────────────
    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(async () => {
            setIsSaving(true)
            try {
                await saveMindMap(groupId, nodesRef.current, edgesRef.current, currentUserId)
            } catch (err) {
                logger.error('Erro ao salvar mapa mental:', err)
            } finally {
                setIsSaving(false)
            }
        }, SAVE_DEBOUNCE_MS)
    }, [groupId, currentUserId])

    // ── Handlers do React Flow ───────────────────────────────────────────────────
    const onNodesChange: OnNodesChange<MindMapNode> = useCallback((changes) => {
        setNodes((nds) => applyNodeChanges(changes, nds))

        // Não salva se a mudança veio do Firestore (evita loop)
        if (isRemoteUpdateRef.current) {
            isRemoteUpdateRef.current = false
            return
        }

        // Filtra mudanças que precisam ser persistidas (ignora apenas seleção)
        const shouldPersist = changes.some((c) => c.type !== 'select')
        if (shouldPersist) scheduleSave()
    }, [scheduleSave])

    const onEdgesChange: OnEdgesChange<MindMapEdge> = useCallback((changes) => {
        setEdges((eds) => applyEdgeChanges(changes, eds))

        const shouldPersist = changes.some((c) => c.type !== 'select')
        if (shouldPersist) scheduleSave()
    }, [scheduleSave])

    const onConnect: OnConnect = useCallback((connection) => {
        const newEdge: MindMapEdge = {
            id: `e-${connection.source}-${connection.target}-${Date.now()}`,
            source: connection.source,
            target: connection.target,
            type: 'smoothstep',
            animated: false,
        }
        setEdges((eds) => addEdge(newEdge, eds))
        scheduleSave()
    }, [scheduleSave])

    // ── CRUD ─────────────────────────────────────────────────────────────────────
    const addNode = useCallback((position: XYPosition, label = 'Novo nó') => {
        const newNode: MindMapNode = {
            id: `node-${Date.now()}`,
            type: 'mindMapNode',
            position,
            data: { label },
        }
        setNodes((nds) => [...nds, newNode])
        scheduleSave()
    }, [scheduleSave])

    const deleteNode = useCallback((nodeId: string) => {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId))
        // Remove também as arestas conectadas ao nó deletado
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
        scheduleSave()
    }, [scheduleSave])

    const updateNodeData = useCallback((nodeId: string, data: Partial<MindMapNodeData>) => {
        setNodes((nds) =>
            nds.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
            )
        )
        scheduleSave()
    }, [scheduleSave])

    const clearAll = useCallback(() => {
        setNodes([])
        setEdges([])
        scheduleSave()
    }, [scheduleSave])

    return {
        nodes,
        edges,
        isLoading,
        isSaving,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        deleteNode,
        updateNodeData,
        clearAll,
    }
}
