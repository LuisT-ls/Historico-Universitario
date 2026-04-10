'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ReactFlow,
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    useReactFlow,
    ReactFlowProvider,
    type NodeTypes,
    type XYPosition,
    type OnConnectEnd,
    type FinalConnectionState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { useMindMap } from '@/components/features/groups/hooks/use-mind-map'
import { MindMapNodeComponent } from './mind-map-node'
import { MindMapToolbar } from './mind-map-toolbar'
import { MindMapEmptyState } from './mind-map-empty-state'
import { MindMapContext } from './mind-map-context'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MindMapNodeData } from '@/types'

// ─── NodeTypes DEVE estar fora do componente ────────────────────────────────
// Se declarado dentro, o React Flow recria todos os nós a cada render,
// causando lag perceptível durante o drag (o maior culpado de jank no RF).
const nodeTypes: NodeTypes = {
    mindMapNode: MindMapNodeComponent as unknown as NodeTypes[string],
}

interface MindMapBoardProps {
    groupId: string
    currentUserId: string
}

// ─── Canvas interno (precisa estar dentro do ReactFlowProvider) ──────────────
function MindMapCanvas({ groupId, currentUserId }: MindMapBoardProps) {
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
            // Navegadores que não suportam Fullscreen API (ex: iOS Safari) falham silenciosamente
        }
    }, [])

    // ── Context value — estável enquanto as funções não mudarem ────────────
    // useMemo garante que o Provider não force re-render em todos os nós
    // a cada mudança de `nodes`/`edges` (que ocorre a cada frame do drag).
    const contextValue = useMemo(
        () => ({ updateNodeData, deleteNode, addChildNode, addSiblingNode, duplicateNode }),
        [updateNodeData, deleteNode, addChildNode, addSiblingNode, duplicateNode]
    )

    // ── Handlers do toolbar — useCallback para referências estáveis ────────
    // Sem isso, o MindMapToolbar (mesmo com memo) re-renderizaria a cada frame
    // pois receberia novas referências de função como props.
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

        let clientX: number
        let clientY: number
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
        const position: XYPosition = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
        addNode(position)
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
                    // Classe `mind-map-container` usada pelo CSS :fullscreen em globals.css
                    'mind-map-container relative w-full overflow-hidden bg-[#fafafa] dark:bg-slate-950',
                    // Border-radius e altura normais; removidos em tela cheia
                    isFullscreen
                        ? 'rounded-none border-0 h-screen'
                        : 'rounded-[2rem] border border-border/50'
                )}
                style={isFullscreen ? undefined : { height: 'calc(100vh - 380px)', minHeight: '500px' }}
            >
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
                />

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
export function MindMapBoard({ groupId, currentUserId }: MindMapBoardProps) {
    return (
        <ReactFlowProvider>
            <MindMapCanvas groupId={groupId} currentUserId={currentUserId} />
        </ReactFlowProvider>
    )
}
