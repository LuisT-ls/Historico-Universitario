'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    useReactFlow,
    useOnSelectionChange,
    ReactFlowProvider,
    type NodeTypes,
    type XYPosition,
    type OnConnectEnd,
    type FinalConnectionState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'

import { useMindMap } from '@/components/features/groups/hooks/use-mind-map'
import { addGroupTask } from '@/services/group.service'
import { MindMapNodeComponent } from './mind-map-node'
import { MindMapToolbar } from './mind-map-toolbar'
import { MindMapEmptyState } from './mind-map-empty-state'
import { MindMapContext } from './mind-map-context'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GroupId, MindMapNodeData, UserId } from '@/types'

// ─── NodeTypes DEVE estar fora do componente ────────────────────────────────
const nodeTypes: NodeTypes = {
    mindMapNode: MindMapNodeComponent as unknown as NodeTypes[string],
}

interface MindMapBoardProps {
    groupId: string
    currentUserId: string
    groupName?: string
}

// ─── Canvas interno ──────────────────────────────────────────────────────────
function MindMapCanvas({ groupId, currentUserId, groupName }: MindMapBoardProps) {
    const {
        nodes,
        edges,
        isLoading,
        isSaving,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        addNodeFromDrop,
        addChildNode,
        addSiblingNode,
        duplicateNode,
        deleteNode,
        updateNodeData,
        clearAll,
    } = useMindMap({ groupId, currentUserId })

    const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow()
    const containerRef = useRef<HTMLDivElement>(null)

    // ── Fullscreen ──────────────────────────────────────────────────────────
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onFsChange)
        return () => document.removeEventListener('fullscreenchange', onFsChange)
    }, [])

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen()
            } else {
                await document.exitFullscreen()
            }
        } catch {
            // iOS Safari não suporta Fullscreen API — falha silenciosa
        }
    }, [])

    // ── Feature 1: Atalhos de teclado ───────────────────────────────────────
    // Ref para evitar re-render nos listeners — armazena o nó selecionado atual
    const selectedNodeRef = useRef<{ id: string; pos: XYPosition } | null>(null)

    useOnSelectionChange({
        onChange: useCallback(({ nodes: selectedNodes }) => {
            const node = selectedNodes[0]
            selectedNodeRef.current = node
                ? { id: node.id, pos: node.position }
                : null
        }, []),
    })

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            // Não dispara se o foco está em input/textarea/button (ex: modo edição do nó)
            const tag = (document.activeElement?.tagName ?? '').toUpperCase()
            if (['TEXTAREA', 'INPUT', 'BUTTON', 'SELECT'].includes(tag)) return
            if (document.activeElement?.getAttribute('contenteditable') === 'true') return

            const selected = selectedNodeRef.current
            if (!selected) return

            if (e.key === 'Tab') {
                e.preventDefault() // impede navegação de foco do navegador
                addChildNode(selected.id, selected.pos)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                addSiblingNode(selected.pos)
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [addChildNode, addSiblingNode])

    // ── Feature 2: Exportar como PNG ───────────────────────────────────────
    const handleExport = useCallback(async () => {
        const container = containerRef.current
        if (!container) return

        // Filtra elementos que não devem aparecer na imagem exportada
        const filter = (domNode: Element) => {
            const cls = domNode.classList
            if (!cls) return true
            if (cls.contains('react-flow__controls'))  return false
            if (cls.contains('react-flow__minimap'))   return false
            if (cls.contains('react-flow__panel'))     return false
            // A toolbar tem data-export-ignore="true"
            if ((domNode as HTMLElement).dataset?.exportIgnore === 'true') return false
            return true
        }

        try {
            toast.loading('Gerando imagem...', { id: 'export' })
            const dataUrl = await toPng(container, {
                cacheBust: true,
                pixelRatio: 2, // resolução 2× para telas retina
                filter: filter as (node: HTMLElement) => boolean,
                backgroundColor: getComputedStyle(container).backgroundColor,
            })

            const filename = groupName
                ? `mapa-${groupName.toLowerCase().replace(/\s+/g, '-')}.png`
                : 'mapa-mental.png'

            const link = document.createElement('a')
            link.download = filename
            link.href = dataUrl
            link.click()
            toast.success('Imagem exportada!', { id: 'export' })
        } catch {
            toast.error('Não foi possível exportar a imagem.', { id: 'export' })
        }
    }, [groupName])

    // ── Feature 3: Converter nó em Tarefa do Kanban ─────────────────────────
    const convertToTask = useCallback(async (label: string) => {
        await addGroupTask({
            groupId:     groupId as GroupId,
            title:       label,
            status:      'pending',
            createdBy:   currentUserId as UserId,
        })
    }, [groupId, currentUserId])

    // ── Context value ───────────────────────────────────────────────────────
    const contextValue = useMemo(
        () => ({ updateNodeData, deleteNode, addChildNode, addSiblingNode, duplicateNode, convertToTask }),
        [updateNodeData, deleteNode, addChildNode, addSiblingNode, duplicateNode, convertToTask]
    )

    // ── Toolbar handlers ────────────────────────────────────────────────────
    const handleAddNode = useCallback(() => {
        const container = containerRef.current
        if (!container) { addNode({ x: 200, y: 200 }); return }

        const rect = container.getBoundingClientRect()
        const position: XYPosition = {
            x: rect.width  / 2 - 60 + (Math.random() - 0.5) * 80,
            y: rect.height / 2 - 20 + (Math.random() - 0.5) * 80,
        }
        addNode(position)
    }, [addNode])

    const handleZoomIn  = useCallback(() => zoomIn({ duration: 300 }),  [zoomIn])
    const handleZoomOut = useCallback(() => zoomOut({ duration: 300 }), [zoomOut])
    const handleFitView = useCallback(() => fitView({ duration: 400, padding: 0.2 }), [fitView])

    // ── Drop to Create ──────────────────────────────────────────────────────
    const onConnectEnd: OnConnectEnd = useCallback((event, connectionState: FinalConnectionState) => {
        if (connectionState.toNode !== null) return
        const sourceId = connectionState.fromNode?.id
        if (!sourceId) return

        let clientX: number, clientY: number
        if ('changedTouches' in event) {
            const touch = (event as TouchEvent).changedTouches?.[0]
            if (!touch) return
            clientX = touch.clientX
            clientY = touch.clientY
        } else {
            clientX = (event as MouseEvent).clientX
            clientY = (event as MouseEvent).clientY
        }

        const position = screenToFlowPosition({ x: clientX, y: clientY })
        addNodeFromDrop(sourceId, position)
    }, [screenToFlowPosition, addNodeFromDrop])

    // ── Duplo-clique no canvas vazio ────────────────────────────────────────
    const handleCanvasDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement
        if (target.closest('.react-flow__node')) return

        const container = containerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        addNode({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }, [addNode])

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Carregando mapa mental...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <MindMapContext.Provider value={contextValue}>
            <div
                ref={containerRef}
                onDoubleClick={handleCanvasDoubleClick}
                className={cn(
                    'mind-map-container relative w-full overflow-hidden bg-[#fafafa] dark:bg-slate-950',
                    isFullscreen
                        ? 'rounded-none border-0 h-screen'
                        : 'rounded-[2rem] border border-border/50'
                )}
                style={isFullscreen ? undefined : { height: 'calc(100vh - 380px)', minHeight: '500px' }}
            >
                {/* data-export-ignore impede que a toolbar apareça na imagem exportada */}
                <div data-export-ignore="true">
                    <MindMapToolbar
                        isSaving={isSaving}
                        hasNodes={nodes.length > 0}
                        isFullscreen={isFullscreen}
                        onAddNode={handleAddNode}
                        onClearAll={clearAll}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onFitView={handleFitView}
                        onToggleFullscreen={toggleFullscreen}
                        onExport={handleExport}
                    />
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectEnd={onConnectEnd}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    deleteKeyCode="Delete"
                    multiSelectionKeyCode="Shift"
                    className="!bg-transparent"
                    proOptions={{ hideAttribution: true }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1.2}
                        color="hsl(var(--border))"
                        className="opacity-60"
                    />

                    {nodes.length > 3 && (
                        <MiniMap
                            nodeColor={(node) => {
                                const data = node.data as MindMapNodeData
                                return data.color ?? 'hsl(var(--primary) / 0.3)'
                            }}
                            className="!bg-white/80 dark:!bg-slate-900/80 !border !border-border/60 !rounded-2xl overflow-hidden"
                            maskColor="hsl(var(--background) / 0.6)"
                            zoomable
                            pannable
                        />
                    )}

                    <Controls
                        className="!bg-white/80 dark:!bg-slate-900/80 !border !border-border/60 !rounded-2xl overflow-hidden !shadow-md"
                        showInteractive={false}
                    />
                </ReactFlow>

                {nodes.length === 0 && (
                    <MindMapEmptyState onAddFirstNode={handleAddNode} />
                )}
            </div>
        </MindMapContext.Provider>
    )
}

// ─── Wrapper público ─────────────────────────────────────────────────────────
export function MindMapBoard({ groupId, currentUserId, groupName }: MindMapBoardProps) {
    return (
        <ReactFlowProvider>
            <MindMapCanvas groupId={groupId} currentUserId={currentUserId} groupName={groupName} />
        </ReactFlowProvider>
    )
}
