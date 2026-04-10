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
    getNodesBounds,
    getViewportForBounds,
    type NodeTypes,
    type XYPosition,
    type OnConnectEnd,
    type FinalConnectionState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { toPng } from 'html-to-image'
import { toast } from 'sonner'

import { useMindMap } from '@/components/features/groups/hooks/use-mind-map'
import { useCursorBroadcast } from '@/components/features/groups/hooks/use-cursor-broadcast'
import { addGroupTask } from '@/services/group.service'
import type { PresenceEntry } from '@/services/group.service'
import { MindMapNodeComponent } from './mind-map-node'
import { MindMapToolbar } from './mind-map-toolbar'
import { MindMapEmptyState } from './mind-map-empty-state'
import { MindMapContext } from './mind-map-context'
import { CursorOverlay } from './cursor-overlay'
import { AttachMaterialModal } from './attach-material-modal'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GroupId, MindMapNodeAttachment, MindMapNodeData, UserId } from '@/types'

// ─── Configurações estáticas (fora do componente para evitar re-render) ──────
// defaultEdgeOptions aplica-se a TODAS as arestas, inclusive as carregadas do
// Firestore que não têm `style` gravado (mapas criados antes desta versão).
const defaultEdgeOptions = {
    type: 'smoothstep',
    style: { strokeWidth: 2, stroke: '#64748b' }, // slate-500 — contraste em claro e escuro
}

const nodeTypes: NodeTypes = {
    mindMapNode: MindMapNodeComponent as unknown as NodeTypes[string],
}

interface MindMapBoardProps {
    groupId: string
    currentUserId: string
    groupName?: string
    onlineMembers?: PresenceEntry[]
}

// ─── Canvas interno ──────────────────────────────────────────────────────────
function MindMapCanvas({ groupId, currentUserId, groupName, onlineMembers = [] }: MindMapBoardProps) {
    const {
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
    } = useMindMap({ groupId, currentUserId })

    const { zoomIn, zoomOut, fitView, screenToFlowPosition, getNodes } = useReactFlow()
    const containerRef = useRef<HTMLDivElement>(null)

    // ── Feature 1: Cursores multiplayer ────────────────────────────────────────
    const broadcastCursor = useCursorBroadcast({ groupId, userId: currentUserId })

    // ── Feature 3: Modal de materiais ──────────────────────────────────────────
    const [attachModal, setAttachModal] = useState<{
        open: boolean
        nodeId: string
        attachments: MindMapNodeAttachment[]
    }>({ open: false, nodeId: '', attachments: [] })

    const openAttachModal = useCallback(
        (nodeId: string, currentAttachments: MindMapNodeData['attachments']) => {
            setAttachModal({ open: true, nodeId, attachments: currentAttachments ?? [] })
        },
        []
    )

    const handleAttachConfirm = useCallback(
        (attachments: MindMapNodeAttachment[]) => {
            updateNodeData(attachModal.nodeId, { attachments })
        },
        [attachModal.nodeId, updateNodeData]
    )

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
            const tag = (document.activeElement?.tagName ?? '').toUpperCase()
            const isTextInput = ['TEXTAREA', 'INPUT'].includes(tag) ||
                document.activeElement?.getAttribute('contenteditable') === 'true'
            const isInteractable = isTextInput || ['BUTTON', 'SELECT'].includes(tag)

            // Undo: Ctrl+Z / Cmd+Z — funciona mesmo com button focado
            const ctrlOrCmd = e.metaKey || e.ctrlKey
            if (!isTextInput && ctrlOrCmd && e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault()
                undo()
                return
            }
            // Redo: Ctrl+Y / Cmd+Y / Ctrl+Shift+Z / Cmd+Shift+Z
            if (!isTextInput && ctrlOrCmd && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
                e.preventDefault()
                redo()
                return
            }

            // Tab / Enter para nó selecionado — bloqueia se qualquer elemento interativo está focado
            if (isInteractable) return
            const selected = selectedNodeRef.current
            if (!selected) return

            if (e.key === 'Tab') {
                e.preventDefault()
                addChildNode(selected.id, selected.pos)
            } else if (e.key === 'Enter') {
                e.preventDefault()
                addSiblingNode(selected.pos)
            }
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [addChildNode, addSiblingNode, undo, redo])

    // ── Feature 2: Exportar como PNG ──────────────────────────────────────
    // Estratégia oficial do xyflow:
    //   1. getNodes() lê os nós do store do RF (com dimensões reais medidas pelo DOM)
    //   2. getNodesBounds() calcula o bounding-box do conteúdo
    //   3. imageWidth/Height = bounds + 2×padding → imagem ajustada ao conteúdo
    //   4. getViewportForBounds() devolve {x, y, zoom} que encaixa exatamente
    //      o bounding-box na imagem sem depender do zoom atual do canvas
    //   5. Captura .react-flow__viewport (nós + arestas SVG) com transform forçado
    const handleExport = useCallback(async () => {
        const currentNodes = getNodes()
        if (currentNodes.length === 0) {
            toast.error('Adicione nós ao mapa antes de exportar.')
            return
        }

        const PADDING = 100

        const nodesBounds = getNodesBounds(currentNodes)
        const imageWidth  = nodesBounds.width  + PADDING * 2
        const imageHeight = nodesBounds.height + PADDING * 2

        const viewportEl = containerRef.current?.querySelector(
            '.react-flow__viewport'
        ) as HTMLElement | null
        if (!viewportEl) return

        const { x, y, zoom } = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.5,
            2,
            PADDING
        )

        // Detecta dark mode pelo projeto (usa classe .dark-mode no <html>)
        const isDark = document.documentElement.classList.contains('dark-mode') ||
                       document.documentElement.classList.contains('dark')
        const bgColor = isDark ? '#020617' : '#ffffff'

        try {
            toast.loading('Gerando imagem...', { id: 'export' })

            const dataUrl = await toPng(viewportEl, {
                cacheBust: true,
                pixelRatio: 2,
                width:  imageWidth,
                height: imageHeight,
                style: {
                    width:           `${imageWidth}px`,
                    height:          `${imageHeight}px`,
                    transform:       `translate(${x}px, ${y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                },
                backgroundColor: bgColor,
                filter: (node: HTMLElement) => {
                    const cls = node.classList
                    if (!cls) return true
                    return (
                        !cls.contains('react-flow__controls') &&
                        !cls.contains('react-flow__minimap')  &&
                        !cls.contains('react-flow__panel')
                    )
                },
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
    }, [getNodes, groupName])

    // ── Feature 3: Converter nó em Tarefa do Kanban ─────────────────────────
    const convertToTask = useCallback(async (label: string) => {
        await addGroupTask({
            groupId:     groupId as GroupId,
            title:       label,
            status:      'pending',
            createdBy:   currentUserId as UserId,
        })
    }, [groupId, currentUserId])

    // getSelectedIds lê do store do RF — estável por usar getNodes (ref interna)
    const getSelectedIds = useCallback(
        () => getNodes().filter(n => n.selected).map(n => n.id),
        [getNodes]
    )

    // ── Context value ───────────────────────────────────────────────────────
    const contextValue = useMemo(
        () => ({
            updateNodeData, deleteNode, addChildNode, addSiblingNode,
            duplicateNode, convertToTask, openAttachModal,
            deleteNodes, updateNodesData, getSelectedIds,
        }),
        [updateNodeData, deleteNode, addChildNode, addSiblingNode,
         duplicateNode, convertToTask, openAttachModal,
         deleteNodes, updateNodesData, getSelectedIds]
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

    // ── Feature 1: Broadcast cursor no hover ───────────────────────────────
    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const container = containerRef.current
        if (!container) return
        const rect = container.getBoundingClientRect()
        const flowPos = screenToFlowPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
        broadcastCursor(flowPos.x, flowPos.y)
    }, [screenToFlowPosition, broadcastCursor])

    // ── Feature 2: Auto-layout ──────────────────────────────────────────────
    const handleAutoLayout = useCallback(() => {
        applyAutoLayout('LR')
        setTimeout(() => fitView({ duration: 400, padding: 0.2 }), 50)
    }, [applyAutoLayout, fitView])

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
            <AttachMaterialModal
                open={attachModal.open}
                onOpenChange={(open) => setAttachModal((s) => ({ ...s, open }))}
                groupId={groupId}
                currentAttachments={attachModal.attachments}
                onConfirm={handleAttachConfirm}
            />

            <div
                ref={containerRef}
                onDoubleClick={handleCanvasDoubleClick}
                onPointerMove={handlePointerMove}
                className={cn(
                    'mind-map-container relative w-full overflow-hidden bg-[#fafafa] dark:bg-slate-950',
                    isFullscreen
                        ? 'rounded-none border-0 h-screen'
                        : 'rounded-[2rem] border border-border/50'
                )}
                style={isFullscreen ? undefined : { height: 'clamp(340px, calc(100svh - 380px), 80svh)' }}
            >
                {/* data-export-ignore impede que a toolbar apareça na imagem exportada */}
                <div data-export-ignore="true">
                    <MindMapToolbar
                        isSaving={isSaving}
                        hasNodes={nodes.length > 0}
                        isFullscreen={isFullscreen}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onAddNode={handleAddNode}
                        onClearAll={clearAll}
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onFitView={handleFitView}
                        onToggleFullscreen={toggleFullscreen}
                        onExport={handleExport}
                        onAutoLayout={handleAutoLayout}
                        onUndo={undo}
                        onRedo={redo}
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
                    defaultEdgeOptions={defaultEdgeOptions}
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

                {/* Feature 1: Cursores multiplayer */}
                <CursorOverlay members={onlineMembers} />

                {nodes.length === 0 && (
                    <MindMapEmptyState onAddFirstNode={handleAddNode} />
                )}
            </div>
        </MindMapContext.Provider>
    )
}

// ─── Wrapper público ─────────────────────────────────────────────────────────
export function MindMapBoard({ groupId, currentUserId, groupName, onlineMembers }: MindMapBoardProps) {
    return (
        <ReactFlowProvider>
            <MindMapCanvas
                groupId={groupId}
                currentUserId={currentUserId}
                groupName={groupName}
                onlineMembers={onlineMembers}
            />
        </ReactFlowProvider>
    )
}
