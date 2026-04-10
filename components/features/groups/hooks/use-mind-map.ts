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
import { getLayoutedElements } from '@/components/features/groups/components/mind-map/get-layouted-elements'
import type { MindMapEdge, MindMapNode, MindMapNodeData } from '@/types'

const SAVE_DEBOUNCE_MS = 600
const MIND_MAP_DOC     = 'board'
const MAX_HISTORY      = 30

// Cor neutra que contrasta em fundo claro E escuro — visível na exportação PNG
const EDGE_STYLE = { stroke: '#64748b', strokeWidth: 2 }

interface HistorySnapshot {
    nodes: MindMapNode[]
    edges: MindMapEdge[]
}

interface UseMindMapOptions {
    groupId: string
    currentUserId: string
}

interface UseMindMapReturn {
    nodes: MindMapNode[]
    edges: MindMapEdge[]
    isLoading: boolean
    isSaving: boolean
    canUndo: boolean
    canRedo: boolean
    onNodesChange: OnNodesChange<MindMapNode>
    onEdgesChange: OnEdgesChange<MindMapEdge>
    onConnect: OnConnect
    addNode: (position: XYPosition, label?: string) => void
    addNodeFromDrop: (sourceId: string, position: XYPosition) => string
    addChildNode: (sourceId: string, sourcePosition: XYPosition) => void
    addSiblingNode: (sourcePosition: XYPosition) => void
    duplicateNode: (sourcePosition: XYPosition, data: MindMapNodeData) => void
    deleteNode: (nodeId: string) => void
    deleteNodes: (nodeIds: string[]) => void
    updateNodeData: (nodeId: string, data: Partial<MindMapNodeData>) => void
    updateNodesData: (nodeIds: string[], data: Partial<MindMapNodeData>) => void
    clearAll: () => void
    applyAutoLayout: (direction?: 'LR' | 'TB') => void
    undo: () => void
    redo: () => void
}

export function useMindMap({ groupId, currentUserId }: UseMindMapOptions): UseMindMapReturn {
    const [nodes, setNodes] = useState<MindMapNode[]>([])
    const [edges, setEdges] = useState<MindMapEdge[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving]   = useState(false)
    const [canUndo, setCanUndo]     = useState(false)
    const [canRedo, setCanRedo]     = useState(false)

    // Refs para debounce e anti-loop
    const nodesRef          = useRef<MindMapNode[]>(nodes)
    const edgesRef          = useRef<MindMapEdge[]>(edges)
    const saveTimerRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isRemoteUpdateRef = useRef(false)
    const isDraggingRef     = useRef(false)
    // Sinaliza que o próximo onSnapshot veio do nosso próprio save (não de outro usuário)
    // — impede que nosso próprio save bounce limpe o histórico de undo
    const isOwnSaveRef      = useRef(false)

    // Pilhas de histórico (refs para não causar re-render a cada snapshot)
    const pastRef   = useRef<HistorySnapshot[]>([])
    const futureRef = useRef<HistorySnapshot[]>([])

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

                // Distingue nosso próprio save do save de outro usuário:
                // — se isOwnSaveRef estiver ativo, é bounce do nosso save → preserva histórico
                // — caso contrário, é update remoto genuíno → limpa histórico para evitar conflitos
                const ownSave = isOwnSaveRef.current
                isOwnSaveRef.current  = false  // consome o flag
                isRemoteUpdateRef.current = true  // impede re-save em onNodesChange

                if (!ownSave) {
                    // Update remoto: outro usuário mudou o mapa → descarta histórico local
                    pastRef.current   = []
                    futureRef.current = []
                    setCanUndo(false)
                    setCanRedo(false)
                }

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
            isOwnSaveRef.current = true // sinaliza: o próximo snapshot é nosso
            try {
                await saveMindMap(groupId, nodesRef.current, edgesRef.current, currentUserId)
            } catch (err) {
                isOwnSaveRef.current = false // save falhou — próximo snapshot não é nosso
                logger.error('Erro ao salvar mapa mental:', err)
            } finally {
                setIsSaving(false)
            }
        }, SAVE_DEBOUNCE_MS)
    }, [groupId, currentUserId])

    // ── Histórico (Undo / Redo) ─────────────────────────────────────────────────
    // Snapshot do estado ATUAL antes de uma mutação local
    const pushHistory = useCallback(() => {
        const snapshot: HistorySnapshot = {
            nodes: nodesRef.current.map(n => ({ ...n, data: { ...n.data } })),
            edges: edgesRef.current.map(e => ({ ...e })),
        }
        pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), snapshot]
        futureRef.current = []
        setCanUndo(true)
        setCanRedo(false)
    }, [])

    const undo = useCallback(() => {
        const past = pastRef.current
        if (past.length === 0) return

        const prev = past[past.length - 1]
        const current: HistorySnapshot = {
            nodes: nodesRef.current.map(n => ({ ...n, data: { ...n.data } })),
            edges: edgesRef.current.map(e => ({ ...e })),
        }

        pastRef.current   = past.slice(0, -1)
        futureRef.current = [current, ...futureRef.current].slice(0, MAX_HISTORY)

        setNodes(prev.nodes)
        setEdges(prev.edges)
        setCanUndo(pastRef.current.length > 0)
        setCanRedo(true)
        scheduleSave()
    }, [scheduleSave])

    const redo = useCallback(() => {
        const future = futureRef.current
        if (future.length === 0) return

        const next = future[0]
        const current: HistorySnapshot = {
            nodes: nodesRef.current.map(n => ({ ...n, data: { ...n.data } })),
            edges: edgesRef.current.map(e => ({ ...e })),
        }

        futureRef.current = future.slice(1)
        pastRef.current   = [...pastRef.current.slice(-(MAX_HISTORY - 1)), current]

        setNodes(next.nodes)
        setEdges(next.edges)
        setCanUndo(true)
        setCanRedo(futureRef.current.length > 0)
        scheduleSave()
    }, [scheduleSave])

    // ── Handlers do React Flow ───────────────────────────────────────────────────
    const onNodesChange: OnNodesChange<MindMapNode> = useCallback((changes) => {
        // Snapshot antes de mudanças locais significativas:
        // — início de drag (1 snapshot por arrasto inteiro)
        // — remoção via teclado Delete
        if (!isRemoteUpdateRef.current) {
            const hasDragStart = changes.some(
                c => c.type === 'position' && (c as { dragging?: boolean }).dragging && !isDraggingRef.current
            )
            const hasDragEnd = changes.some(
                c => c.type === 'position' && !(c as { dragging?: boolean }).dragging && isDraggingRef.current
            )
            const hasRemove = changes.some(c => c.type === 'remove')

            if (hasDragStart) { pushHistory(); isDraggingRef.current = true  }
            if (hasDragEnd)   {               isDraggingRef.current = false }
            if (hasRemove)    { pushHistory() }
        }

        setNodes((nds) => applyNodeChanges(changes, nds))

        if (isRemoteUpdateRef.current) {
            isRemoteUpdateRef.current = false
            return
        }

        const shouldPersist = changes.some((c) => c.type !== 'select')
        if (shouldPersist) scheduleSave()
    }, [scheduleSave, pushHistory])

    const onEdgesChange: OnEdgesChange<MindMapEdge> = useCallback((changes) => {
        if (!isRemoteUpdateRef.current) {
            const hasRemove = changes.some(c => c.type === 'remove')
            if (hasRemove) pushHistory()
        }

        setEdges((eds) => applyEdgeChanges(changes, eds))

        const shouldPersist = changes.some((c) => c.type !== 'select')
        if (shouldPersist) scheduleSave()
    }, [scheduleSave, pushHistory])

    const onConnect: OnConnect = useCallback((connection) => {
        pushHistory()
        const newEdge: MindMapEdge = {
            id: `e-${connection.source}-${connection.target}-${Date.now()}`,
            source: connection.source,
            target: connection.target,
            type: 'smoothstep',
            animated: false,
            style: EDGE_STYLE,
        }
        setEdges((eds) => addEdge(newEdge, eds))
        scheduleSave()
    }, [scheduleSave, pushHistory])

    // ── CRUD ─────────────────────────────────────────────────────────────────────
    const addNode = useCallback((position: XYPosition, label = 'Novo nó') => {
        pushHistory()
        const newNode: MindMapNode = {
            id: `node-${Date.now()}`,
            type: 'mindMapNode',
            position,
            data: { label },
        }
        setNodes((nds) => [...nds, newNode])
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const addNodeFromDrop = useCallback((sourceId: string, position: XYPosition): string => {
        pushHistory()
        const newId = `node-${Date.now()}`
        const newNode: MindMapNode = {
            id: newId,
            type: 'mindMapNode',
            position,
            data: { label: 'Nova ideia' },
        }
        const newEdge: MindMapEdge = {
            id: `e-${sourceId}-${newId}`,
            source: sourceId,
            target: newId,
            type: 'smoothstep',
            animated: false,
            style: EDGE_STYLE,
        }
        setNodes((nds) => [...nds, newNode])
        setEdges((eds) => [...eds, newEdge])
        scheduleSave()
        return newId
    }, [scheduleSave, pushHistory])

    const addChildNode = useCallback((sourceId: string, sourcePosition: XYPosition) => {
        pushHistory()
        const childId = `node-${Date.now()}`
        const newNode: MindMapNode = {
            id: childId,
            type: 'mindMapNode',
            position: { x: sourcePosition.x + 250, y: sourcePosition.y },
            data: { label: 'Novo nó' },
        }
        const newEdge: MindMapEdge = {
            id: `e-${sourceId}-${childId}`,
            source: sourceId,
            target: childId,
            type: 'smoothstep',
            animated: false,
            style: EDGE_STYLE,
        }
        setNodes((nds) => [...nds, newNode])
        setEdges((eds) => [...eds, newEdge])
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const addSiblingNode = useCallback((sourcePosition: XYPosition) => {
        pushHistory()
        const newNode: MindMapNode = {
            id: `node-${Date.now()}`,
            type: 'mindMapNode',
            position: { x: sourcePosition.x, y: sourcePosition.y + 100 },
            data: { label: 'Novo nó' },
        }
        setNodes((nds) => [...nds, newNode])
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const duplicateNode = useCallback((sourcePosition: XYPosition, data: MindMapNodeData) => {
        pushHistory()
        const newNode: MindMapNode = {
            id: `node-${Date.now()}`,
            type: 'mindMapNode',
            position: { x: sourcePosition.x + 50, y: sourcePosition.y + 50 },
            data: { ...data },
        }
        setNodes((nds) => [...nds, newNode])
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const deleteNode = useCallback((nodeId: string) => {
        pushHistory()
        setNodes((nds) => nds.filter((n) => n.id !== nodeId))
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
        scheduleSave()
    }, [scheduleSave, pushHistory])

    // Exclusão em massa (multi-seleção)
    const deleteNodes = useCallback((nodeIds: string[]) => {
        if (nodeIds.length === 0) return
        pushHistory()
        const idSet = new Set(nodeIds)
        setNodes((nds) => nds.filter((n) => !idSet.has(n.id)))
        setEdges((eds) => eds.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)))
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const updateNodeData = useCallback((nodeId: string, data: Partial<MindMapNodeData>) => {
        pushHistory()
        setNodes((nds) =>
            nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
        )
        scheduleSave()
    }, [scheduleSave, pushHistory])

    // Atualização em massa de dados (multi-seleção)
    const updateNodesData = useCallback((nodeIds: string[], data: Partial<MindMapNodeData>) => {
        if (nodeIds.length === 0) return
        pushHistory()
        const idSet = new Set(nodeIds)
        setNodes((nds) =>
            nds.map((n) => idSet.has(n.id) ? { ...n, data: { ...n.data, ...data } } : n)
        )
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const clearAll = useCallback(() => {
        pushHistory()
        setNodes([])
        setEdges([])
        scheduleSave()
    }, [scheduleSave, pushHistory])

    const applyAutoLayout = useCallback((direction: 'LR' | 'TB' = 'LR') => {
        pushHistory()
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodesRef.current,
            edgesRef.current,
            direction
        )
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
        scheduleSave()
    }, [scheduleSave, pushHistory])

    return {
        nodes,
        edges,
        isLoading,
        isSaving,
        canUndo,
        canRedo,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        addNodeFromDrop,
        addChildNode,
        addSiblingNode,
        duplicateNode,
        deleteNode,
        deleteNodes,
        updateNodeData,
        updateNodesData,
        clearAll,
        applyAutoLayout,
        undo,
        redo,
    }
}
